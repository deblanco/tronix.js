const { ADDRESS_PREFIX, ADDRESS_PREFIX_BYTE } = require('./address');
const base64EncodeToString = require('../lib/code').base64EncodeToString;
const { base64DecodeFromString, hexStr2byteArray } = require('../lib/code');
const { encode58, decode58 } = require('../lib/base58');
const EC = require('elliptic').ec;
const { keccak256 } = require('js-sha3');
const jsSHA = require('../lib/sha256');
const ADDRESS_SIZE = require('./address').ADDRESS_SIZE;
const { byte2hexStr, byteArray2hexStr } = require('./bytes');

function arrayToBase64String(a) {
  return btoa(String.fromCharCode(...a));
}

function signBytes(privateKey, contents) {
  if (typeof privateKey === 'string') {
    privateKey = hexStr2byteArray(privateKey);
  }

  const hashBytes = SHA256(contents);
  const signBytes = ECKeySign(hashBytes, privateKey);

  return signBytes;
}

// return bytes of rowdata, use to sign.
function getRowBytesFromTransactionBase64(base64Data) {
  const bytesDecode = base64DecodeFromString(base64Data);
  const transaction = proto.protocol.Transaction.deserializeBinary(bytesDecode);
  const raw = transaction.getRawData();
  return raw.serializeBinary();
}

// gen Ecc priKey for bytes
function genPriKey() {
  const ec = new EC('secp256k1');
  const key = ec.genKeyPair();
  const priKey = key.getPrivate();
  let priKeyHex = priKey.toString('hex');
  while (priKeyHex.length < 64) {
    priKeyHex = '0' + priKeyHex;
  }

  return hexStr2byteArray(priKeyHex);
}

// return address by bytes, pubBytes is byte[]
function computeAddress(pubBytes) {
  if (pubBytes.length === 65) {
    pubBytes = pubBytes.slice(1);
  }

  let hash = keccak256(pubBytes).toString();
  let addressHex = hash.substring(24);
  addressHex = ADDRESS_PREFIX + addressHex;
  return hexStr2byteArray(addressHex);
}

// return address by bytes, priKeyBytes is byte[]
function getAddressFromPriKey(priKeyBytes) {
  const pubBytes = getPubKeyFromPriKey(priKeyBytes);
  return computeAddress(pubBytes);
}

// return address by Base58Check String,
function getBase58CheckAddress(addressBytes) {
  let hash0 = SHA256(addressBytes);
  let hash1 = SHA256(hash0);
  let checkSum = hash1.slice(0, 4);
  checkSum = addressBytes.concat(checkSum);
  return encode58(checkSum);
}

function decode58Check(addressStr) {
  let decodeCheck = decode58(addressStr);
  if (decodeCheck.length <= 4) {
    console.error('ERROR CHECK');
    return null;
  }

  let decodeData = decodeCheck.slice(0, decodeCheck.length - 4);
  let hash0 = SHA256(decodeData);
  let hash1 = SHA256(hash0);

  if (hash1[0] === decodeCheck[decodeData.length] &&
    hash1[1] === decodeCheck[decodeData.length + 1] &&
    hash1[2] === decodeCheck[decodeData.length + 2] &&
    hash1[3] === decodeCheck[decodeData.length + 3]) {
    return decodeData;
  }

  return null;
}

function isAddressValid(base58Str) {
  try {
    if (typeof (base58Str) !== 'string') {
      return false;
    }
    if (base58Str.length !== ADDRESS_SIZE) {
      return false;
    }
    let address = decode58(base58Str);

    if (address.length !== 25) {
      return false;
    }
    if (address[0] !== ADDRESS_PREFIX_BYTE) {
      return false;
    }
    let checkSum = address.slice(21);
    address = address.slice(0, 21);
    let hash0 = SHA256(address);
    let hash1 = SHA256(hash0);
    let checkSum1 = hash1.slice(0, 4);
    if (checkSum[0] == checkSum1[0] && checkSum[1] == checkSum1[1] && checkSum[2]
        == checkSum1[2] && checkSum[3] == checkSum1[3]
    ) {
      return true;
    }
  } catch (e) {
    // ignore
  }

  return false;
}

// return address by Base58Check String, priKeyBytes is base64String
function getBase58CheckAddressFromPriKeyBase64String(priKeyBase64String) {
  let priKeyBytes = base64DecodeFromString(priKeyBase64String);
  let pubBytes = getPubKeyFromPriKey(priKeyBytes);
  let addressBytes = computeAddress(pubBytes);
  return getBase58CheckAddress(addressBytes);
}

// return address by String, priKeyBytes is base64String
function getHexStrAddressFromPriKeyBase64String(priKeyBase64String) {
  const priKeyBytes = base64DecodeFromString(priKeyBase64String);
  const pubBytes = getPubKeyFromPriKey(priKeyBytes);
  const addressBytes = computeAddress(pubBytes);
  const addressHex = byteArray2hexStr(addressBytes);
  return addressHex;
}
// return address by String, priKeyBytes is base64String
function getAddressFromPriKeyBase64String(priKeyBase64String) {
  const priKeyBytes = base64DecodeFromString(priKeyBase64String);
  const pubBytes = getPubKeyFromPriKey(priKeyBytes);
  const addressBytes = computeAddress(pubBytes);
  const addressBase64 = base64EncodeToString(addressBytes);
  return addressBase64;
}

// return pubkey by 65 bytes, priKeyBytes is byte[]
function getPubKeyFromPriKey(priKeyBytes) {
  let ec = new EC('secp256k1');
  let key = ec.keyFromPrivate(priKeyBytes, 'bytes');
  let pubkey = key.getPublic();
  let x = pubkey.x;
  let y = pubkey.y;
  let xHex = x.toString('hex');
  while (xHex.length < 64) {
    xHex = '0' + xHex;
  }
  let yHex = y.toString('hex');
  while (yHex.length < 64) {
    yHex = '0' + yHex;
  }
  let pubkeyHex = '04' + xHex + yHex;
  let pubkeyBytes = hexStr2byteArray(pubkeyHex);
  return pubkeyBytes;
}

// return sign by 65 bytes r s id. id < 27
function ECKeySign(hashBytes, priKeyBytes) {
  const ec = new EC('secp256k1');
  const key = ec.keyFromPrivate(priKeyBytes, 'bytes');
  const signature = key.sign(hashBytes);
  const r = signature.r;
  const s = signature.s;
  const id = signature.recoveryParam;

  let rHex = r.toString('hex');
  while (rHex.length < 64) {
    rHex = '0' + rHex;
  }
  let sHex = s.toString('hex');
  while (sHex.length < 64) {
    sHex = '0' + sHex;
  }
  const idHex = byte2hexStr(id);
  const signHex = rHex + sHex + idHex;
  return hexStr2byteArray(signHex);
}

// toDO:
// return 32 bytes
function SHA256(msgBytes) {
  const shaObj = new jsSHA('SHA-256', 'HEX');
  const msgHex = byteArray2hexStr(msgBytes);
  shaObj.update(msgHex);
  const hashHex = shaObj.getHash('HEX');
  return hexStr2byteArray(hashHex);
}

function passwordToAddress(password) {
  const com_priKeyBytes = base64DecodeFromString(password);
  const com_addressBytes = getAddressFromPriKey(com_priKeyBytes);
  return getBase58CheckAddress(com_addressBytes);
}

function pkToAddress(privateKey) {
  const com_priKeyBytes = hexStr2byteArray(privateKey);
  const com_addressBytes = getAddressFromPriKey(com_priKeyBytes);
  return getBase58CheckAddress(com_addressBytes);
}

module.exports = {
  passwordToAddress,
  genPriKey,
  getAddressFromPriKey,
  getPubKeyFromPriKey,
  getBase58CheckAddress,
  isAddressValid,
  getBase58CheckAddressFromPriKeyBase64String,
  pkToAddress,
  decode58Check,
  signBytes,
  SHA256,
  ECKeySign,
};
