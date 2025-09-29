const fs = require('fs');
const crypto = require('crypto');


const algorithm = 'aes-256-cbc';
const key = Buffer.from(appConfigs.ENC_KEY, 'hex');

async function encryptFile(inputFile, outputFile) {
    const data = await fs.readFileSync(inputFile);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const result = Buffer.concat([iv, encrypted]);
    await fs.writeFileSync(outputFile, result);
}

async function decryptFile(inputFile, outputFile = null) {
    const data = await fs.readFileSync(inputFile);

    const iv = data.slice(0, 16);
    const encrypted = data.slice(16);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // return decrypted;
    await fs.writeFileSync(outputFile, decrypted);
}

module.exports = {
    encryptFile,
    decryptFile,
}