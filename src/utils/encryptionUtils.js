// Import the SubtleCrypto API for encryption
export const importPublicKey = async (pem) => {
    const binaryDerString = window.atob(pem.replace(/-----[^-]+-----/g, ""));
    const binaryDer = new Uint8Array(
        [...binaryDerString].map((char) => char.charCodeAt(0))
    );

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
};

export const encryptWithRSA = async (data, publicKey) => {
    const enc = new TextEncoder();
    const encodedData = enc.encode(data);

    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        encodedData
    );

    return Buffer.from(new Uint8Array(encryptedData)).toString("hex");
};
