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

# 5. Build the extension
pnpm run build
```

This creates a `dist/` directory containing the packed extension files.

For development with hot-reloading:

```bash
pnpm run build:watch
```

This will watch for file changes and rebuild automatically.

### Load the extension in your browser

1. Open your browser's extension management page (e.g. `chrome://extensions` in Chrome).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` directory.

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
