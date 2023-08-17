// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestSignatures, TransportRequestMessage } from '@polkadot/extension-base/background/types';
import type { Message } from '@polkadot/extension-base/types';

import { MESSAGE_ORIGIN_CONTENT } from '@polkadot/extension-base/defaults';
import { handleResponse, redirectIfPhishing } from '@polkadot/extension-base/page';
import { injectExtension } from '@polkadot/extension-inject';

import { packageInfo } from './packageInfo.js';
import type { Injected, InjectedAccount, Unsubcall } from '@polkadot/extension-inject/types';
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';

import { io } from "socket.io-client"
import type { SignerResult } from '@polkadot/api/types/index.js';
import type { HexString } from "@polkadot/util/types"

const plutonicationUrl = "wss://plutonication-53tvi.ondigitalocean.app/plutonication" // "ws://0.0.0.0:8050/plutonication" 
// Connect to your server
const socket = io(plutonicationUrl);

// Listen to an event
socket.on('receivepubkey', function (data) {
  pubkey = data
});

// Listen to an event
socket.on('message', function (data) {
  console.log("This message has been received:")
  console.log(data);
});

socket.on('signed_payload', function (data) {
  console.log("signed_payload: ")
  console.log(data.signature)
  signature = data.signature
});

function inject() {
  injectExtension(enable, {
    name: 'polkadot-js',
    version: packageInfo.version
  });
}

let pubkey: string = ""

async function waitForPubkey(): Promise<string> {
  pubkey = ""
  while (pubkey === "") {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log("New pubkey: " + pubkey);
  return pubkey
}

let signature: HexString = "0x"

async function waitForSignature(): Promise<HexString> {
  signature = "0x"
  while (signature === "0x") {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return signature
}

export async function enable(origin: string): Promise<Injected> {

  const injected: Injected = {
    accounts: {
      get: async function (_anyType?: boolean | undefined): Promise<InjectedAccount[]> {

        const account: InjectedAccount = {
          address: await waitForPubkey()
        }

        return [account]

      },
      subscribe: function (_cb: (accounts: InjectedAccount[]) => void | Promise<void>): Unsubcall {
        return () => { };
      }
    },
    signer: {
      signPayload: async (payloadJson: SignerPayloadJSON): Promise<SignerResult> => {

        socket.emit("sign_payload", { Data: payloadJson })

        const result: SignerResult = {
          /**
           * @description The id for this request
           */
          id: 0,
          /**
           * @description The resulting signature in hex
           */
          signature: await waitForSignature()
        }

        return result;
      },
      signRaw: async (raw: SignerPayloadRaw): Promise<SignerResult> => {
        socket.emit("sign_raw", { Data: raw })

        const result: SignerResult = {
          /**
           * @description The id for this request
           */
          id: 0,
          /**
           * @description The resulting signature in hex
           */
          signature: await waitForSignature()
        }

        return result;
      }
    }
  }

  // open the popup
  window.postMessage({
    response: "OPEN_POPUP",
    origin,
    plutonicationUrl
    // other data properties...
  }, "*");

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