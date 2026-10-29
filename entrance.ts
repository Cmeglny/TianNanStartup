/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 cemuu
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

interface Region {
    name: string;
    selector: string;
    delay: number;
    from: string;
    origin: string;
    rows?: string;
    limit?: number;
}

interface EntranceAnimation {
    element: HTMLElement;
    from: string;
    at: number;
    duration: number;
    origin: string;
    transform: string;
    opacity: string;
}

const regions: Region[] = [
    // The rail is already bounded by viewport visibility; include its bottom icons too.
    { name: "servers", selector: 'nav[class*="guilds_"], [data-list-id="guildsnav"]', delay: 150, from: "translate3d(-100px, 0, -180px) rotateY(58deg) scale(.8)", origin: "0% 50%", rows: '[data-list-item-id^="guildsnav___"]', limit: Infinity },
    { name: "channels", selector: '[class*="sidebarList_"], #channels, [class*="privateChannels_"]', delay: 650, from: "translate3d(-150px, 35px, -140px) rotateY(24deg) scale(.88)", origin: "0% 50%", rows: '[data-list-item-id^="channels___"], [class*="voiceUser_"], [class*="channel_"][data-list-item-id]', limit: 14 },
    { name: "header", selector: '[class*="chat_"] > [class*="title_"], [class*="chat_"] > section[aria-label], [class*="subtitleContainer_"]', delay: 1150, from: "translate3d(0, -85px, -100px) rotateX(-55deg)", origin: "50% 0%", rows: '[role="button"], button', limit: 6 },
    { name: "conversation", selector: '[class*="chatContent_"], [class*="tabBody_"]', delay: 1650, from: "translate3d(0, 100px, -240px) rotateX(18deg) scale(.84)", origin: "50% 100%", rows: '[id^="chat-messages-"], [class*="peopleListItem_"]', limit: 9 },
    { name: "members", selector: '[class*="membersWrap_"]', delay: 2150, from: "translate3d(150px, 25px, -140px) rotateY(-32deg) scale(.88)", origin: "100% 50%", rows: '[class*="member_"]', limit: 12 },
    { name: "composer", selector: '[class*="chat_"] [class*="form_"]', delay: 2650, from: "translate3d(0, 95px, -100px) rotateX(32deg) scale(.92)", origin: "50% 100%" },
    { name: "controls", selector: '[class*="panels_"]', delay: 3050, from: "translate3d(0, 85px, -70px) rotateX(25deg) scale(.9)", origin: "50% 100%" }
];

/** Animate real elements without replacing React nodes or leaving inline styles behind. */
export function startEntrance(onFinish: () => void): () => void {
    const root = document.getElementById("app-mount");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        onFinish();
        return () => {};
    }
    const started = performance.now();
    const timelineStarted = document.timeline.currentTime;
    const initialUrl = location.href;
    const animations = new Set<Animation>();
    const claimed = new Set<string>();
    const animatedRows = new WeakSet<Element>();
    const rowCounts = new Map<string, number>();
    const hosts = new Map<Region, HTMLElement>();
    let stopped = false;
    let frame = 0;
    let scanTimer: ReturnType<typeof setTimeout> | undefined;
    let discoveryEnded = false;
    let lastScan = -Infinity;

    const stage = document.createElement("div");
    stage.className = "vc-tiannan-stage";
    stage.setAttribute("aria-hidden", "true");
    stage.innerHTML = '<div class="vc-tiannan-halo"></div><div class="vc-tiannan-sweep"></div><div class="vc-tiannan-letterbox vc-tiannan-letterbox-top"></div><div class="vc-tiannan-letterbox vc-tiannan-letterbox-bottom"></div>';
    const skip = document.createElement("button");
    skip.className = "vc-tiannan-stage-skip vc-tiannan-skip";
    skip.type = "button";
    skip.setAttribute("aria-label", "Bileşen açılış animasyonunu atla");
    skip.innerHTML = "ATLA <span>ESC</span>";
    document.body.append(stage, skip);

    function animate(plan: EntranceAnimation) {
        const transform = plan.transform === "none" ? "" : plan.transform;
        const elapsed = performance.now() - started;
        // One compositor timeline keeps existing panels moving while Discord mounts
        // more server content. No nested blur/brightness surfaces are rasterized.
        const at = Math.max(plan.at, elapsed);
        const { element, origin } = plan;
        const animation = element.animate([
            { opacity: 0, transform: `perspective(1400px) ${plan.from} ${transform}`, transformOrigin: origin },
            { opacity: plan.opacity, transform: plan.transform, transformOrigin: origin }
        ], {
            duration: plan.duration,
            delay: typeof timelineStarted === "number" ? at : Math.max(0, at - elapsed),
            easing: "cubic-bezier(.16, 1, .3, 1)",
            fill: "both"
        });
        if (typeof timelineStarted === "number") animation.startTime = timelineStarted;
        animations.add(animation);
        animation.onfinish = () => {
            animations.delete(animation);
            animation.cancel();
        };
    }

    function visible(element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    }

    function collect() {
        frame = 0;
        if (stopped) return;
        if (location.href !== initialUrl) return finish();
        lastScan = performance.now();
        const plans: EntranceAnimation[] = [];
        function plan(element: HTMLElement, from: string, at: number, duration: number, origin: string) {
            const baseline = getComputedStyle(element);
            // Copy values now; CSSStyleDeclaration itself is live. All reads precede
            // all animation writes, avoiding a forced style/layout pass per row.
            plans.push({ element, from, at, duration, origin, transform: baseline.transform, opacity: baseline.opacity });
        }
        // Snapshot geometry before applying any parent transform; a sliding parent
        // must not make its still-visible composer/rows look offscreen.
        const snapshots = regions.map(region => {
            const remaining = (region.limit ?? 10) - (rowCounts.get(region.name) ?? 0);
            if (claimed.has(region.name) && (!region.rows || remaining <= 0)) return { region, host: undefined, rows: [] };
            const host = hosts.get(region) ?? Array.from(root!.querySelectorAll<HTMLElement>(region.selector)).find(visible);
            const rows: HTMLElement[] = [];
            if (host?.isConnected && region.rows && remaining > 0) {
                const candidates = host.querySelectorAll<HTMLElement>(region.rows);
                const reverse = region.name === "conversation";
                let inspected = 0;
                for (let index = reverse ? candidates.length - 1 : 0; index >= 0 && index < candidates.length; index += reverse ? -1 : 1) {
                    if (rows.length >= remaining || inspected >= 160) break;
                    const row = candidates[index];
                    if (animatedRows.has(row)) continue;
                    inspected++;
                    if (visible(row)) rows.push(row);
                }
            }
            return { region, host, rows };
        });
        for (const { region, host, rows } of snapshots) {
            if (region.name === "conversation" && claimed.has("fallback")) continue;
            if (!claimed.has(region.name)) {
                if (host) {
                    claimed.add(region.name);
                    hosts.set(region, host);
                    plan(host, region.from, region.delay, 2350, region.origin);
                }
            }
            if (!host?.isConnected || !region.rows) continue;
            for (const row of rows) {
                const count = rowCounts.get(region.name) ?? 0;
                if (count >= (region.limit ?? 10)) break;
                if (animatedRows.has(row)) continue;
                animatedRows.add(row);
                rowCounts.set(region.name, count + 1);
                // Keep the complete rail wave inside the scene even in tall windows.
                const rowDelay = region.name === "servers" ? Math.min(count * 95, 4200) : count * 95;
                plan(row, `translate3d(${region.name === "members" ? 28 : -22}px, 20px, 0) scale(.94)`, region.delay + 550 + rowDelay, 1250, "50% 50%");
            }
        }
        // Home pages and new Discord layouts still get one entrance if no chat body matched.
        if (!claimed.has("conversation") && !claimed.has("fallback")) {
            const main = root!.querySelector<HTMLElement>('main, [role="main"]');
            if (main && visible(main)) {
                claimed.add("fallback");
                plan(main, regions[3].from, 1650, 2350, "50% 100%");
            }
        }
        for (const animation of plans) animate(animation);
    }

    function scheduleCollect() {
        if (stopped || discoveryEnded || frame || scanTimer !== undefined) return;
        const wait = Math.max(0, 160 - (performance.now() - lastScan));
        if (wait > 0) {
            scanTimer = setTimeout(() => {
                scanTimer = undefined;
                frame = requestAnimationFrame(collect);
            }, wait);
        } else {
            frame = requestAnimationFrame(collect);
        }
    }

    const observer = new MutationObserver(mutations => {
        if (mutations.some(mutation => Array.from(mutation.addedNodes).some(node => node instanceof Element))) scheduleCollect();
    });
    observer.observe(root, { childList: true, subtree: true });
    // Only discover the initial loading cohort; future navigation/messages do not replay.
    const discoveryTimer = setTimeout(() => {
        discoveryEnded = true;
        observer.disconnect();
        cancelAnimationFrame(frame);
        clearTimeout(scanTimer);
    }, 2600);
    const endTimer = setTimeout(finish, 7200);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function stop() {
        if (stopped) return;
        stopped = true;
        observer.disconnect();
        cancelAnimationFrame(frame);
        clearTimeout(scanTimer);
        clearTimeout(discoveryTimer);
        clearTimeout(endTimer);
        document.removeEventListener("pointerdown", onPointer, true);
        window.removeEventListener("popstate", finish);
        window.removeEventListener("hashchange", finish);
        reducedMotion.removeEventListener("change", onMotion);
        for (const animation of animations) {
            animation.onfinish = null;
            animation.cancel();
        }
        animations.clear();
        stage.remove();
        skip.remove();
    }

    function finish() {
        stop();
        onFinish();
    }

    function onPointer(event: PointerEvent) {
        if (event.target instanceof Node && root!.contains(event.target)) finish();
    }

    function onMotion(event: MediaQueryListEvent) {
        if (event.matches) finish();
    }

    skip.addEventListener("click", finish);
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("popstate", finish);
    window.addEventListener("hashchange", finish);
    reducedMotion.addEventListener("change", onMotion);
    scheduleCollect();
    return stop;
}
