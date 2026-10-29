/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 cemuu
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin, { StartAt } from "@utils/types";

import { startEntrance } from "./entrance";
import style from "./style.css?managed";

let overlay: HTMLDivElement | undefined;
let observer: MutationObserver | undefined;
let minimumTimer: ReturnType<typeof setTimeout> | undefined;
let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
let removalTimer: ReturnType<typeof setTimeout> | undefined;
let played = false;
let minimumElapsed = false;
let leaving = false;
let stopEntrance: (() => void) | undefined;

function removeIntro() {
    overlay?.remove();
    overlay = undefined;
}

function cleanUp() {
    observer?.disconnect();
    observer = undefined;
    clearTimeout(minimumTimer);
    clearTimeout(deadlineTimer);
    clearTimeout(removalTimer);
    document.removeEventListener("keydown", onKeyDown);
    stopEntrance?.();
    stopEntrance = undefined;
    removeIntro();
}

function reveal(animateComponents = true) {
    if (!overlay || leaving) return;
    leaving = true;
    observer?.disconnect();
    clearTimeout(minimumTimer);
    clearTimeout(deadlineTimer);
    const status = overlay.querySelector(".vc-tiannan-status");
    if (status) status.textContent = "Welcome back";
    overlay.classList.add("vc-tiannan-leaving");
    if (animateComponents) {
        stopEntrance = startEntrance(cleanUp);
        removalTimer = setTimeout(removeIntro, 800);
    } else {
        removalTimer = setTimeout(cleanUp, 800);
    }
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") skip();
}

function skip() {
    if (leaving) cleanUp();
    else reveal(false);
}

function checkReady() {
    if (minimumElapsed && document.querySelector('#channels, [data-is-popout-window="false"] [role="main"], form input[type="password"]')) reveal();
}

export default definePlugin({
    name: "TianNanStartup",
    description: "Cinematic startup and component entrances inspired by Tian Nan. Supports skipping and reduced motion.",
    authors: [{ name: "cemuu", id: 0n }],
    enabledByDefault: true,
    startAt: StartAt.DOMContentLoaded,
    managedStyle: style,

    start() {
        if (played || !document.body || location.pathname.startsWith("/popout") || window.opener
            || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        played = true;
        minimumElapsed = leaving = false;
        overlay = document.createElement("div");
        overlay.className = "vc-tiannan-intro";
        overlay.setAttribute("aria-label", "Opening Discord");
        overlay.innerHTML = `
            <div class="vc-tiannan-scene" aria-hidden="true"></div>
            <div class="vc-tiannan-shade" aria-hidden="true"></div>
            <div class="vc-tiannan-content">
                <div class="vc-tiannan-emblem" aria-hidden="true">
                    <span class="vc-tiannan-orbit"></span>
                    <span class="vc-tiannan-diamond"></span>
                    <span class="vc-tiannan-axis"></span>
                </div>
                <p class="vc-tiannan-eyebrow">TIAN NAN</p>
                <h1 class="vc-tiannan-title">DISCORD</h1>
                <div class="vc-tiannan-rule" aria-hidden="true"></div>
                <p class="vc-tiannan-status" role="status">Preparing your interface</p>
            </div>
            <span class="vc-tiannan-corner vc-tiannan-corner-tl" aria-hidden="true"></span>
            <span class="vc-tiannan-corner vc-tiannan-corner-br" aria-hidden="true"></span>
            <button class="vc-tiannan-skip" type="button" aria-label="Skip startup animation">SKIP <span>ESC</span></button>`;
        overlay.querySelector("button")!.addEventListener("click", skip);
        document.body.append(overlay);
        document.addEventListener("keydown", onKeyDown);
        observer = new MutationObserver(checkReady);
        observer.observe(document.body, { childList: true, subtree: true });
        minimumTimer = setTimeout(() => {
            minimumElapsed = true;
            checkReady();
        }, 1900);
        // A slow/changed Discord DOM can never leave a permanent splash screen.
        deadlineTimer = setTimeout(reveal, 4500);
    },

    stop: cleanUp
});
