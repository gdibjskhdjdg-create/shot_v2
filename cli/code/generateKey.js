const crypto = require('crypto');

const ENC_KEY = crypto.randomBytes(32).toString('hex');

console.log('کلید رمزنگاری شما:', ENC_KEY);
console.log('طول کلید (بایت):', Buffer.from(ENC_KEY, 'hex').length);