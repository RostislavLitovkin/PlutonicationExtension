// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MESSAGE_ORIGIN_CONTENT, MESSAGE_ORIGIN_PAGE, PORT_CONTENT } from '@polkadot/extension-base/defaults';
import { chrome } from '@polkadot/extension-inject/chrome';

// connect to the extension
const port = chrome.runtime.connect({ name: PORT_CONTENT });

// send any messages from the extension back to the page
port.onMessage.addListener((data: any): void => {
  window.postMessage({ ...data, origin: MESSAGE_ORIGIN_CONTENT }, '*');
});

// all messages from the page, pass them to the extension
window.addEventListener('message', ({ data, source }: Message): void => {
  // only allow messages from our window, by the inject
  if (source !== window || data.origin !== MESSAGE_ORIGIN_PAGE) {
    return;
  }

  port.postMessage(data);
});

// inject our data injector
const script = document.createElement('script');

script.src = chrome.extension.getURL('page.js');

script.onload = (): void => {
  // remove the injecting tag when loaded
  if (script.parentNode) {
    script.parentNode.removeChild(script);
  }
};

(document.head || document.documentElement).appendChild(script);

interface Message extends MessageEvent {
  data: {
    error?: string;
    id: string;
    origin: string;
    response?: string;
    subscription?: string;
    plutonicationUrl?: string;
    roomKey: number;
  }
}

window.addEventListener('message', async ({ data }: Message): Promise<void> => {
  if (data.response === "OPEN_POPUP") {

    chrome.runtime.sendMessage({
      message: "open_popup",
      url: data.plutonicationUrl,
      key: data.roomKey,
      name: data.origin
    });
  }
});
