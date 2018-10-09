const {
  getBase58CheckAddress, decode58Check, SHA256, ECKeySign,
} = require('./crypto');
const { longToByteArray, byteArray2hexStr, bytesToString } = require('./bytes');
const { hexStr2byteArray } = require('../lib/code');
const { Transaction } = require('../protocol/core/Tron_pb');
const google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');
const { base64DecodeFromString } = require('../lib/code');
const {
  TransferContract,
  TransferAssetContract,
  AccountUpdateContract,
  VoteWitnessContract,
  ParticipateAssetIssueContract,
  AssetIssueContract,
  FreezeBalanceContract,
  UnfreezeBalanceContract,
  WitnessUpdateContract,
  WithdrawBalanceContract,
  WitnessCreateContract,
  UnfreezeAssetContract,
  AccountCreateContract,
  VoteAssetContract,
  DeployContract,
  UpdateAssetContract,
} = require('../protocol/core/Contract_pb');

const ContractType = Transaction.Contract.ContractType;
const ContractTable = {};
ContractTable[ContractType.ACCOUNTCREATECONTRACT] = [AccountCreateContract.deserializeBinary, 'protocol.AccountCreateContract'];
ContractTable[ContractType.ACCOUNTUPDATECONTRACT] = [AccountUpdateContract.deserializeBinary, 'protocol.AccountUpdateContract'];
ContractTable[ContractType.TRANSFERCONTRACT] = [TransferContract.deserializeBinary, 'protocol.TransferContract'];
ContractTable[ContractType.TRANSFERASSETCONTRACT] = [TransferAssetContract.deserializeBinary, 'protocol.TransferAssetContract'];
ContractTable[ContractType.VOTEASSETCONTRACT] = [VoteAssetContract.deserializeBinary, 'protocol.VoteAssetContract'];
ContractTable[ContractType.VOTEWITNESSCONTRACT] = [VoteWitnessContract.deserializeBinary, 'protocol.VoteWitnessContract'];
ContractTable[ContractType.ASSETISSUECONTRACT] = [AssetIssueContract.deserializeBinary, 'protocol.AssetIssueContract'];
ContractTable[ContractType.DEPLOYCONTRACT] = [DeployContract.deserializeBinary, 'protocol.DeployContract'];
ContractTable[ContractType.WITNESSCREATECONTRACT] = [WitnessCreateContract.deserializeBinary, 'protocol.WitnessCreateContract'];
ContractTable[ContractType.WITNESSUPDATECONTRACT] = [WitnessUpdateContract.deserializeBinary, 'protocol.WitnessUpdateContract'];
ContractTable[ContractType.PARTICIPATEASSETISSUECONTRACT] = [ParticipateAssetIssueContract.deserializeBinary, 'protocol.ParticipateAssetIssueContract'];
ContractTable[ContractType.FREEZEBALANCECONTRACT] = [FreezeBalanceContract.deserializeBinary, 'protocol.FreezeBalanceContract'];
ContractTable[ContractType.UNFREEZEBALANCECONTRACT] = [UnfreezeBalanceContract.deserializeBinary, 'protocol.UnfreezeBalanceContract'];
ContractTable[ContractType.WITHDRAWBALANCECONTRACT] = [WithdrawBalanceContract.deserializeBinary, 'protocol.WithdrawBalanceContract'];
ContractTable[ContractType.UNFREEZEASSETCONTRACT] = [UnfreezeAssetContract.deserializeBinary, 'protocol.UnfreezeAssetContract'];
ContractTable[ContractType.UPDATEASSETCONTRACT] = [UpdateAssetContract.deserializeBinary, 'protocol.UpdateAssetContract'];
/* not defined right now
  ContractTable[ContractType.CUSTOMCONTRACT] =                  [CustomContract.deserializeBinary,'protocol.CustomContract']
*/

const TransactionFields = {
  decodeAddress(address) { return getBase58CheckAddress(base64DecodeFromString(address)); },
  ownerAddress(address) { return this.decodeAddress(address); },
  toAddress(address) { return this.decodeAddress(address); },
  voteAddress(address) { return this.decodeAddress(address); },
  address(address) { return this.decodeAddress(address); },
  assetName(token) { return bytesToString(Array.from(base64DecodeFromString(token))); }
};

function decodeTransactionFields(transaction) {
  const transactionResult = transaction;
  Object.keys(transactionResult).forEach((key) => {
    if (Array.isArray(transactionResult[key])) {
      transactionResult[key].forEach(decodeTransactionFields);
    } else if (TransactionFields[key]) {
      transactionResult[key] = TransactionFields[key](transactionResult[key],transaction.contractType);
    }
  });
  return transactionResult;
}

function deserializeTransaction(tx) {
  if (!tx) return null;
  try {
    const contract = tx.getRawData().getContractList()[0];
    const any = contract.getParameter();
    const contractType = contract.getType();
    let transaction = any.unpack(ContractTable[contractType][0], ContractTable[contractType][1]);
    transaction = transaction.toObject();
    transaction.contractType = contractType;
    transaction.hash = byteArray2hexStr(SHA256(tx.getRawData().serializeBinary())).toLowerCase();
    transaction.time = tx.getRawData().getTimestamp();
    transaction = decodeTransactionFields(transaction);
    return transaction;
  } catch (err) {
    throw err;
  }
}

function deserializeTransactions(transactionsList = []) {
  return transactionsList.map(tx => deserializeTransaction(tx)).filter(t => !!t);
}

function deserializeEasyTransfer(transferResult) {
  const easyObject = transferResult.toObject();
  easyObject.result.message = bytesToString(Array.from(base64DecodeFromString(easyObject.result.message)));
  easyObject.transaction = deserializeTransaction(transferResult.getTransaction());
  return easyObject;
}

function encodeString(str) {
  return Uint8Array.from(base64DecodeFromString(btoa(str)));
}

// TODO find a better place.
function btoa(str) {
  let buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = new Buffer(str.toString(), 'binary');
  }

  return buffer.toString('base64');
}

function buildTransferContract(message, contractType, typeName) {
  const anyValue = new google_protobuf_any_pb.Any();
  anyValue.pack(message.serializeBinary(), `protocol.${typeName}`);

  const contract = new Transaction.Contract();
  contract.setType(contractType);
  contract.setParameter(anyValue);

  const raw = new Transaction.raw();
  raw.addContract(contract);

  const transaction = new Transaction();
  transaction.setRawData(raw);

  return transaction;
}

/**
 * Build trx transfer transaction
 * @param {string} from address in base 58
 * @param {string} to address in base 58
 * @param {number} amount amount in SUNs
 *
 */
function buildTransferTransaction(from, to, amount) {
  const transferContract = new TransferContract();
  transferContract.setToAddress(Uint8Array.from(decode58Check(to)));
  transferContract.setOwnerAddress(Uint8Array.from(decode58Check(from)));
  transferContract.setAmount(amount);

  const transaction = buildTransferContract(
    transferContract,
    Transaction.Contract.ContractType.TRANSFERCONTRACT,
    'TransferContract',
  );

  return transaction;
}

/**
 * Build token transfer transaction
 * @param {string} token token name
 * @param {string} from address in base 58
 * @param {string} to address in base 58
 * @param {number} amount amount in suns //TODO check if TRX?
 *
 */
function buildTransferAssetTransaction(token, from, to, amount) {
  const transferContract = new TransferAssetContract();
  transferContract.setToAddress(Uint8Array.from(decode58Check(to)));
  transferContract.setOwnerAddress(Uint8Array.from(decode58Check(from)));
  transferContract.setAmount(amount);
  transferContract.setAssetName(encodeString(token));

  const transaction = buildTransferContract(
    transferContract,
    Transaction.Contract.ContractType.TRANSFERASSETCONTRACT,
    'TransferAssetContract',
  );

  return transaction;
}

/**
 * Update account transaction (you can just update with your name 1 time)
 * @param {string} address address in base 58
 * @param {string} name name string //TODO check the limit
 *
 */
function buildAccountUpdateTransaction(address, name) {
  const contract = new AccountUpdateContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setAccountName(encodeString(name));

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.ACCOUNTUPDATECONTRACT,
    'AccountUpdateContract',
  );

  return transaction;
}


/**
 * Create witness transaction
 * @param {string} address address in base 58
 * @param {string} url url for witness //Check the limit
 *
 */
function buildWitnessCreateTransaction(address, url) {
  const contract = new WitnessCreateContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setUrl(encodeString(url));

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.WITNESSCREATECONTRACT,
    'WitnessCreateContract',
  );

  return transaction;
}

/**
 * Update witness transaction
 * @param {string} address address in base 58
 * @param {string} url url for witness //Check the limit
 *
 */
function buildWitnessUpdateTransaction(address, url) {
  const contract = new WitnessUpdateContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));

  contract.setUpdateUrl(encodeString(url));

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.WITNESSUPDATECONTRACT,
    'WitnessUpdateContract',
  );

  return transaction;
}


/**
 * Widthdraw balance transaction (for block creation rewards)
 * @param {string} address address in base 58
 *
 */
function buildWithdrawBalanceTransaction(address) {
  const contract = new WithdrawBalanceContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.WITHDRAWBALANCECONTRACT,
    'WithdrawBalanceContract',
  );

  return transaction;
}

/**
 * Votes transaction
 * @param {string} address address in base 58
 * @param {array} votes list of votes of quantity +
 *
 */
function buildVoteTransaction(address, votes) {
  const contract = new VoteWitnessContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));

  for (const address of Object.keys(votes)) {
    const vote = new VoteWitnessContract.Vote();
    vote.setVoteAddress(Uint8Array.from(decode58Check(address)));
    const numberOfVotes = parseInt(votes[address]);
    if (isNaN(numberOfVotes) || numberOfVotes <= 0) {
      continue;
    }
    vote.setVoteCount(numberOfVotes);
    contract.addVotes(vote);
  }

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.VOTEWITNESSCONTRACT,
    'VoteWitnessContract',
  );

  return transaction;
}

/**
 * Asset participate issue transaction
 * @param {string} address address in base 58
 * @param {array} issuerAddress issuer address in base 58
 * @param {string} token token name //check the chars limit
 *
 */
function buildAssetParticipateTransaction(address, issuerAddress, token, amount) {
  const contract = new ParticipateAssetIssueContract();

  contract.setToAddress(Uint8Array.from(decode58Check(issuerAddress)));
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setAssetName(encodeString(token));
  contract.setAmount(amount);

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.PARTICIPATEASSETISSUECONTRACT,
    'ParticipateAssetIssueContract',
  );

  return transaction;
}


/**
 * Asset issue transaction
 * @param {object} options options list
 *
 */
function buildAssetIssueTransaction(options) {
  const contract = new AssetIssueContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(options.address)));
  contract.setName(encodeString(options.name));
  contract.setAbbr(encodeString(options.shortName));
  contract.setTotalSupply(options.totalSupply);
  contract.setNum(options.num);
  contract.setEndTime(Date.parse(options.endTime));
  contract.setStartTime(Date.parse(options.startTime));
  contract.setTrxNum(options.trxNum);
  contract.setDescription(encodeString(options.description));
  contract.setUrl(encodeString(options.url));
  contract.setPublicFreeAssetNetUsage(0);
  contract.setFreeAssetNetLimit(0);
  contract.setPublicFreeAssetNetLimit(0);

  if (options.frozenSupply) {
    for (const frozenSupply of options.frozenSupply) {
      const frozenSupplyContract = new AssetIssueContract.FrozenSupply();
      frozenSupplyContract.setFrozenAmount(frozenSupply.amount);
      frozenSupplyContract.setFrozenDays(frozenSupply.days);
      contract.addFrozenSupply(frozenSupplyContract);
    }
  }

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.ASSETISSUECONTRACT,
    'AssetIssueContract',
  );

  return transaction;
}

/**
 * Freeze balance
 *
 * @param address From which address to freze
 * @param amount The amount of TRX to freeze
 * @param duration Duration in days
 *
 */
function buildFreezeBalanceTransaction(address, amount, duration) {
  const contract = new FreezeBalanceContract();

  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setFrozenBalance(amount);
  contract.setFrozenDuration(duration);

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.FREEZEBALANCECONTRACT,
    'FreezeBalanceContract',
  );

  return transaction;
}

/**
 * Unfreeze balance
 *
 * @param address From which address to freeze
 *
 */
function buildUnfreezeBalanceTransaction(address) {
  const contract = new UnfreezeBalanceContract();

  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.UNFREEZEBALANCECONTRACT,
    'UnfreezeBalanceContract',
  );

  return transaction;
}

/**
 * Unfreeze Assets
 *
 * @param address From which address to unfreeze
 *
 */
function buildUnfreezeAssetTransaction(address) {
  const contract = new UnfreezeAssetContract();

  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.UNFREEZEASSETCONTRACT,
    'UnfreezeAssetContract',
  );

  return transaction;
}

/**
 * Add block reference to transaction
 * This is a needed step after building the transaction before signing the transaction it to the network.
 * @param {Transaction} transaction a builded non-signed transaction
 * @param {Block} block the block to ref the transaction (usually the current block)
 */
function addBlockReferenceToTransaction(transaction, block) {
  const blockHash = block.hash;
  const blockNum = block.number;

  const numBytes = longToByteArray(blockNum);
  numBytes.reverse();
  const hashBytes = hexStr2byteArray(blockHash);

  const generateBlockId = [...numBytes.slice(0, 8), ...hashBytes.slice(8, hashBytes.length - 1)];

  const rawData = transaction.getRawData();
  rawData.setRefBlockHash(Uint8Array.from(generateBlockId.slice(8, 16)));
  rawData.setRefBlockBytes(Uint8Array.from(numBytes.slice(6, 8)));
  rawData.setExpiration(block.time + (60 * 5 * 1000));

  transaction.setRawData(rawData);
  return transaction;
}

/**
 * Sign A Transaction by priKey.
 * signature is 65 bytes, r[32] || s[32] || id[1](<27)
 * @returns  a Transaction object signed
 * @param transaction: a Transaction object unSigned
 * @param priKeyBytes: privateKey for ECC
 */
function signTransaction(transaction, priKeyBytes) {
  if (typeof priKeyBytes === 'string') {
    priKeyBytes = hexStr2byteArray(priKeyBytes);
  }

  const raw = transaction.getRawData();
  const rawBytes = raw.serializeBinary();
  const hashBytes = SHA256(rawBytes);
  const signBytes = ECKeySign(hashBytes, priKeyBytes);
  const uint8Array = new Uint8Array(signBytes);
  const count = raw.getContractList().length;
  for (let i = 0; i < count; i++) {
    transaction.addSignature(uint8Array);
  }

  return transaction;
}

module.exports = {
  buildTransferTransaction,
  buildTransferAssetTransaction,
  buildAccountUpdateTransaction,
  buildAssetParticipateTransaction,
  buildVoteTransaction,
  buildFreezeBalanceTransaction,
  buildUnfreezeBalanceTransaction,
  buildAssetIssueTransaction,
  buildWitnessUpdateTransaction,
  buildWithdrawBalanceTransaction,
  buildWitnessCreateTransaction,
  buildUnfreezeAssetTransaction,
  addBlockReferenceToTransaction,
  signTransaction,
  decodeTransactionFields,
  deserializeTransaction,
  deserializeTransactions,
  deserializeEasyTransfer,
};
