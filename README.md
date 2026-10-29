# TianNanStartup

Give Discord a cinematic silver-and-charcoal startup screen, followed by staggered perspective and wave entrances for the server rail, channels, chat, members, and controls.

## Features

- Plays once per renderer startup. A full reload with **Ctrl+R** also counts as a new startup.
- Usually takes about nine seconds in total. Press **Esc** or click **SKIP** to skip it.
- Clicking inside the app or switching channels ends the component entrance scene.
- Respects the system's **reduced motion** preference.
- Works without a theme. Add a GIF as described below to customize the background.
- Includes all visible server icons in the entrance wave.

## GIF background

The background GIF is **not included** in this repository. Name your own GIF `tian-nan-pingpong.gif` and place it here on Windows:

```text
%APPDATA%\Vencord\themes\assets\tian-nan-pingpong.gif
```

Create the `assets` directory if needed. You can find your themes directory through **Vencord → Themes → Open Themes Folder**. On other systems, use the same `assets` subdirectory inside Vencord's themes directory.

The plugin loads `vencord:///themes/assets/tian-nan-pingpong.gif`. Without the GIF, the entrance effects still work on a dark background. To use a different filename or HTTPS URL, change the `.vc-tiannan-scene` background in `style.css` and rebuild.

## Installation

This repository contains a custom Vencord **userplugin**. You need **Git, Node.js, and pnpm**.

### Get the Vencord source

If you do not already have a Vencord source checkout:

```powershell
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install --frozen-lockfile
```

### Add the plugin

Run these commands from your Vencord source directory:

```powershell
git clone https://github.com/Cmeglny/TianNanStartup src/userplugins/tianNanStartup
pnpm build
```

If this is your first time installing a source build into Discord Desktop, fully quit Discord from the system tray, then run:

```powershell
pnpm inject
```

In the Vencord Installer, select your Discord installation and apply the patch. Reopen Discord, then find **TianNanStartup** under **Settings → Vencord → Plugins**. If your source build is already installed, rebuild it and fully restart Discord.

To install without Git, choose **Code → Download ZIP** on GitHub and extract it. Place the plugin directory so its entry point is exactly `Vencord/src/userplugins/tianNanStartup/index.ts`, then follow the build step above. Keep your Vencord source directory in place.

Official guides: [Installing Vencord from source](https://docs.vencord.dev/installing/) · [Installing custom plugins](https://docs.vencord.dev/installing/custom-plugins/)

## Updating

If you installed the plugin with Git, run these commands from your Vencord source directory:

```powershell
git -C src/userplugins/tianNanStartup pull --ff-only
pnpm build
```

Fully restart Discord afterward. For ZIP installations, replace the plugin source files with the new version and rebuild.

## Compatibility

The sources were checked with **Vencord 1.15.14**, commit `644434941b515a2626a2161e219653cb36e723e7`. Changes to Discord's component structure or Vencord APIs may require updates.

## License

Copyright © 2026 cemuu. **GPL-3.0-or-later**. See [LICENSE](LICENSE) for the full license text. This is an independently maintained custom plugin.
