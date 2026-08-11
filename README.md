<p align="center">
  <img src="public/logo.png" alt="PearPass logo" width="264"/>
</p>

# PearPass Browser Extension

> The browser extension for PearPass, an open-source, end-to-end encrypted password and identity manager built on Pear Runtime.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Native messaging (desktop bridge) — Firefox / Zen / Flatpak](#native-messaging-desktop-bridge--firefox--zen--flatpak)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

PearPass is an open-source, privacy-first password and identity manager that gives you full control over your sensitive information. It makes storing and managing your credentials simple, secure, and private. PearPass encrypts and stores all data locally on your device.

This extension brings PearPass into the browser: it autofills saved logins and identities, handles passkey creation and authentication, and communicates with the PearPass desktop app for vault operations.

PearPass is also available on [desktop](https://github.com/tetherto/pearpass-app-desktop) and [mobile](https://github.com/tetherto/pearpass-app-mobile).

---

## Features

- **Autofill** — Detects login and identity fields on any website and fills them from your vault in one click.
- **Passkey support** — Creates and uses passkeys for websites that support WebAuthn, stored securely in your vault.
- **Vault management** — Create, unlock, and switch between multiple encrypted vaults directly from the extension popup.
- **Record management** — Stores logins, identities, credit cards, and secure notes.
- **Password generator** — Generates strong, unique passwords.
- **Native app bridge** — Connects to the PearPass desktop app for vault operations.
- **Internationalization** — Supports multiple languages using LinguiJS.

---

## Installation

### Steps

```bash
# 1. Clone the repository
git clone git@github.com:tetherto/pearpass-app-browser-extension.git

# 2. Go to the cloned directory
cd pearpass-app-browser-extension

# 3. Enable pnpm (Corepack ships with Node)
corepack enable
corepack prepare pnpm@11.10.0 --activate

# 4. Install dependencies (npm/yarn are blocked; lifecycle scripts are allowlisted)
NPM_CONFIG_LEGACY_PEER_DEPS=true pnpm install

# 5. Build the extension (Chrome)
pnpm run build

# Or build a Firefox package (dist-firefox/ + dist-firefox.zip)
pnpm run build:firefox
```

`pnpm run build` creates a `dist/` directory for Chromium browsers.

`pnpm run build:firefox` runs the Chromium build, then packages a Gecko-ready copy into `dist-firefox/` and `dist-firefox.zip` (Chrome-only manifest fields and `offscreen.*` assets are stripped).

For development with hot-reloading:

```bash
pnpm run build:watch
```

This will watch for file changes and rebuild automatically.

### Load the extension in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` directory.

### Load the extension in Firefox

1. Run `pnpm run build:firefox`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and select `dist-firefox/manifest.json` (or `dist-firefox.zip`).

### Load the extension in Zen Browser

Zen is a Firefox fork. Use the **Firefox** package (`pnpm run build:firefox`), not the Chromium `dist/`.

**Recommended (permanent unsigned install — pairing survives restarts):**

1. Run `pnpm run build:firefox` (produces `dist-firefox/` and `dist-firefox.zip`).
2. In Zen, open `about:config` and set `xpinstall.signatures.required` to `false`.
3. Open the Add-ons manager (`about:addons`) → gear menu → **Install Add-on From File…** → select `dist-firefox.zip`.
4. Pair the extension with the PearPass desktop app once.

Temporary load (`about:debugging` → **Load Temporary Add-on…** → `dist-firefox/manifest.json`) also works for quick checks, but the add-on is removed on browser restart and you must re-pair.

### Native messaging (desktop bridge) — Firefox / Zen / Flatpak

The extension talks to the PearPass desktop app through a native messaging host. If the host is missing, the popup shows a connection error with Firefox/Zen guidance.

**Typical host manifest locations (Linux):**

| Browser | Path |
| --- | --- |
| Firefox / Zen (often) | `~/.mozilla/native-messaging-hosts/` |
| Zen-specific (if used) | `~/.zen/native-messaging-hosts/` |
| Flatpak Zen | Host must also be readable inside the sandbox (e.g. `~/.var/app/app.zen_browser.zen/…` or a Flatpak filesystem override) |

**macOS:** `~/Library/Application Support/Mozilla/NativeMessagingHosts/` (Zen may also use a Zen-specific Application Support folder).

**Windows:** Mozilla native messaging registry keys (same family as Firefox).

The PearPass desktop installer currently registers Mozilla-standard paths. Zen usually picks those up; if it does not, dual-write into Zen-specific directories is a desktop-app follow-up. For Flatpak Zen, grant the app access to the host file (Flatseal → filesystem, or `flatpak override`) and ensure the webextension native-messaging permission is allowed for the PearPass host id.

Always keep the desktop app running with browser integration enabled when using the extension.

---

## Usage Examples

Visit the official PearPass documentation for step-by-step guides on setup, vault management, autofill, passkey usage, and all other PearPass features:

**[docs.pass.pears.com](https://docs.pass.pears.com)**

---

## Testing

This project uses Jest for unit and integration testing.

```bash
pnpm test
```

---

## Dependencies

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [LinguiJS](https://lingui.dev/)
- [Redux](https://redux.js.org/)

---

## Related Projects

| Project | Description |
| --- | --- |
| [`pearpass-app-desktop`](https://github.com/tetherto/pearpass-app-desktop) | Desktop app for PearPass |
| [`pearpass-app-mobile`](https://github.com/tetherto/pearpass-app-mobile) | Mobile app for PearPass |
| [`pearpass-lib-vault`](https://github.com/tetherto/pearpass-lib-vault) | Vault management library |
| [`tether-dev-docs`](https://github.com/tetherto/tether-dev-docs) | Developer documentation and guides |

---

## Contributing

We welcome contributions. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow and coding conventions.

---

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.
