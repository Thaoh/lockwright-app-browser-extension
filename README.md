<p align="center">
  <img src="docs/logo.svg" alt="Lockwright" width="128"/>
</p>

# Lockwright Browser Extension

Chrome MV3 / Firefox extension for Lockwright. Autofill, passkeys, and a native-messaging bridge to the desktop app.

Community fork of PearPass (Apache 2.0). Not affiliated with or endorsed by Tether Data or the Pears project.

npm names, store listings, and shipped binaries still say PearPass until identity `works.dexterity.lockwright` lands. Gecko id will be `lockwright@dexterity.works`. Host id is still `com.pears.pass` until that swap.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Native messaging (desktop bridge) — Firefox / Zen / Flatpak](#native-messaging-desktop-bridge--firefox--zen--flatpak)
- [Usage](#usage)
- [Testing](#testing)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

The extension autofills logins and identities, handles passkey create/auth, and talks to the desktop app for vault operations.

Also [desktop](https://github.com/Thaoh/lockwright-app-desktop) and [mobile](https://github.com/Thaoh/lockwright-app-mobile).

---

## Features

- Autofill login and identity fields from the vault
- Passkeys (WebAuthn) stored in the vault
- Create, unlock, and switch vaults from the popup
- Logins, identities, cards, and notes
- Password generator
- Native messaging bridge to the desktop app
- LinguiJS i18n

---

## Installation

```bash
git clone git@github.com:Thaoh/lockwright-app-browser-extension.git
cd lockwright-app-browser-extension
corepack enable
corepack prepare pnpm@11.10.0 --activate
NPM_CONFIG_LEGACY_PEER_DEPS=true pnpm install
pnpm run build
# or Firefox: dist-firefox/ + dist-firefox.zip
pnpm run build:firefox
```

`pnpm run build` writes Chromium `dist/`.

`pnpm run build:firefox` builds Chromium first, then a Gecko copy in `dist-firefox/` and `dist-firefox.zip` (Chrome-only manifest fields and `offscreen.*` stripped).

Watch:

```bash
pnpm run build:watch
```

### Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. **Load unpacked** → `dist/`.

### Load in Firefox

1. `pnpm run build:firefox`.
2. Open `about:debugging#/runtime/this-firefox`.
3. **Load Temporary Add-on…** → `dist-firefox/manifest.json` (or `dist-firefox.zip`).

### Load in Zen Browser

Zen is a Firefox fork. Use the Firefox package, not Chromium `dist/`.

Permanent unsigned install (pairing survives restart):

1. `pnpm run build:firefox`.
2. `about:config` → `xpinstall.signatures.required` = `false`.
3. Add-ons manager → gear → **Install Add-on From File…** → `dist-firefox.zip`.
4. Pair with the desktop app once.

Temporary load (`about:debugging` → `dist-firefox/manifest.json`) dies on browser restart. You must re-pair.

### Native messaging (desktop bridge) — Firefox / Zen / Flatpak

The extension talks to the desktop app through a native messaging host. Missing host → popup connection error with Firefox/Zen guidance.

**Typical host manifest locations (Linux):**

| Browser | Path |
| --- | --- |
| Firefox / Zen (often) | `~/.mozilla/native-messaging-hosts/` |
| Zen-specific (if used) | `~/.zen/native-messaging-hosts/` |
| Flatpak Zen | Host must also be readable inside the sandbox (e.g. `~/.var/app/app.zen_browser.zen/…` or a Flatpak filesystem override) |

**macOS:** `~/Library/Application Support/Mozilla/NativeMessagingHosts/` (Zen may also use a Zen-specific Application Support folder).

**Windows:** Mozilla native messaging registry keys (same family as Firefox).

The desktop installer currently registers Mozilla-standard paths. Host id is still the PearPass one until identity lands. Zen usually picks those up. Dual-write into Zen-specific directories is a desktop follow-up. For Flatpak Zen, grant access to the host file (Flatseal filesystem, or `flatpak override`) and allow native-messaging for that host id.

Keep the desktop app running with browser integration enabled.

---

## Usage

PearPass docs at [docs.pass.pears.com](https://docs.pass.pears.com) describe the product at the fork point. They are not Lockwright docs.

---

## Testing

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
| [`lockwright-app-desktop`](https://github.com/Thaoh/lockwright-app-desktop) | Desktop |
| [`lockwright-app-mobile`](https://github.com/Thaoh/lockwright-app-mobile) | Mobile |
| [`lockwright-lib-vault`](https://github.com/Thaoh/lockwright-lib-vault) | Vault |
| [`lockwright-lib-vault-core`](https://github.com/Thaoh/lockwright-lib-vault-core) | Vault core |
| [`lockwright-lib-constants`](https://github.com/Thaoh/lockwright-lib-constants) | Shared constants |

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## License

Apache License 2.0. See `LICENSE.md` and `NOTICE.md`.
