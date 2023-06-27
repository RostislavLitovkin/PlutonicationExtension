// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestSignatures, TransportRequestMessage } from '@polkadot/extension-base/background/types';
import type { Message } from '@polkadot/extension-base/types';

import { MESSAGE_ORIGIN_CONTENT } from '@polkadot/extension-base/defaults';
import { handleResponse, redirectIfPhishing } from '@polkadot/extension-base/page';
import { injectExtension } from '@polkadot/extension-inject';

import { packageInfo } from './packageInfo.js';
import type { Injected, InjectedAccount, Unsubcall } from '@polkadot/extension-inject/types';

import { io } from "socket.io-client"


// Connect to your server
var socket = io('wss://plutonication-53tvi.ondigitalocean.app/plutonication');

// Listen to an event
socket.on('receivepubkey', function (data) {
  pubkey = data
});

// Listen to an event
socket.on('message', function (data) {
  console.log(data);
});

function inject() {
  injectExtension(enable, {
    name: 'polkadot-js',
    version: packageInfo.version
  });
}

let pubkey: string

async function waitForPubkey(): Promise<string> {
  while (!pubkey) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return pubkey
}

export async function enable(origin: string): Promise<Injected> {
  console.log("Initializing plutonication on: " + origin);

  

  window.postMessage({
    response: "OPEN_POPUP",
    origin
    // other data properties...
  }, "*");

  const injected: Injected = {
    accounts: {
      get: async function (_anyType?: boolean | undefined): Promise<InjectedAccount[]> {

        const account: InjectedAccount = {
          address: await waitForPubkey()
        }

        console.log("Pubkey received: " + account.address)

        return [account]

      },
      subscribe: function (_cb: (accounts: InjectedAccount[]) => void | Promise<void>): Unsubcall {
        return () => { };
      }
    },
    signer: {

    }
  }
  return injected;
}

// setup a response listener (events created by the loader for extension responses)
window.addEventListener('message', ({ data, source }: Message): void => {
  // only allow messages from our window, by the loader
  if (source !== window || data.origin !== MESSAGE_ORIGIN_CONTENT) {
    return;
  }

  if (data.id) {
    handleResponse(data as TransportRequestMessage<keyof RequestSignatures>);
  } else {
    console.error('Missing id for response.');
  }
});

redirectIfPhishing().then((gotRedirected) => {
  if (!gotRedirected) {
    inject();
  }
}).catch((e) => {
  console.warn(`Unable to determine if the site is in the phishing list: ${(e as Error).message}`);
  inject();
});