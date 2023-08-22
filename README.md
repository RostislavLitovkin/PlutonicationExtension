# Plutonication Extension

<img width="1511" alt="Screenshot 2023-08-22 at 16 26 24" src="https://github.com/RostislavLitovkin/PlutonicationExtension/assets/77352013/d1493e65-da01-4e3b-8257-c3d0db4bb7c6">

This is a [polkadot.js extension](https://github.com/polkadot-js/extension) compatible browser extension for [Plutonication](https://github.com/cisar2218/Plutonication).

It can connect to any web dApp supporting `polkadot.js extension` and it will generate a QR code for you to scan.
Once the QR code is scanned, the wallet will connect to the dApp and it will be ready to receive transaction requests.
Everything by that point is automatic.

# Build and Run locally

1. Build via `yarn build` or `yarn watch`
2. Install the extension
  - Chrome:
    - go to `chrome://extensions/`
    - ensure you have the Development flag set
    - "Load unpacked" and point to `packages/extension/build`
    - if developing, after making changes - refresh the extension
  - Firefox:
    - go to `about:debugging#addons`
    - check "Enable add-on debugging"
    - click on "Load Temporary Add-on" and point to `packages/extension/build/manifest.json`
    - if developing, after making changes - reload the extension
3. When visiting `https://polkadot.js.org/apps/` it will inject the extension

Once added, you can create an account (via a generated seed) or import via an existing seed. The [apps UI](https://github.com/polkadot-js/apps/), when loaded, will show these accounts as `<account name> (extension)`
