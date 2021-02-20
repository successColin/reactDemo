/*
 * @Author: jwk
 * @Date:   2019-10-30 16:45:59
 * @Last Modified by: jwk
 * @Last Modified time: 2019-10-30 16:45:59
 * @Desc: 加密封装
 */

import CryptoJS from 'crypto-js'; // 导入加密模块
// const key = CryptoJS.enc.Utf8.parse('0123456789abcdef'); // 十六位十六进制数作为密钥
// const iv = CryptoJS.enc.Utf8.parse('abcdef0123456789'); // 十六位十六进制数作为密钥偏移量
// const key = CryptoJS.enc.Hex.parse('0123456789abcdef'); // 十六位十六进制数作为密钥
// const iv = CryptoJS.enc.Hex.parse('abcdef0123456789'); // 十六位十六进制数作为密钥偏移量
const key = CryptoJS.enc.Hex.parse('31323334353637383930414243444546');
const iv = CryptoJS.enc.Hex.parse('31323334353637383930414243444546');

/**
 * 加密方法
 * @param {String} word 需要加密的字符
 * @returns {String} 加密后的字符
 */
export function encrypt(word) {
  // const srcs = CryptoJS.enc.Utf8.parse(word);
  // console.log('CryptoJS.enc.Utf8.parse(word)', srcs);
  const encrypted = CryptoJS.AES.encrypt(word, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  // return encrypted.ciphertext.toString().toUpperCase();
  return encrypted.ciphertext.toString();
}

/**
 * 解密方法
 * @param {String} word 需要解密的字符
 * @returns {String} 解密后的字符
 */
export function decrypt(word) {
  // const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  // const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  // const decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  // const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  // return decryptedStr.toString();
  let dec = CryptoJS.AES.decrypt(CryptoJS.format.Hex.parse(word), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(dec);
}

export default {
  encrypt,
  decrypt,
};

