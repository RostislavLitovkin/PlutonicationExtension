// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

window.onload = (): void => {
    const url = new URL(window.location.href).searchParams.get("url");
    const key = new URL(window.location.href).searchParams.get("key");
    const name = new URL(window.location.href).searchParams.get("name");
    const icon = new URL(window.location.href).searchParams.get("icon");

    console.log(url)
    console.log(key)

    // @ts-ignore
    const plutonication =
        "plutonication:" +
        "?url=" + url +
        "&key=" + key +
        "&name=" + name +
        "&icon=" + icon

    // Generate the QR code
    const qrCodeElement = document.getElementById('qrcode');

    // @ts-ignore
    qrCodeElement.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(plutonication)
}