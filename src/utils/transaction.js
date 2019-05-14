const {
  getBase58CheckAddress,
  decode58Check,
  SHA256,
  ECKeySign
} = require('./crypto');
const { btoa } = require('./base64');
const { longToByteArray, byteArray2hexStr, bytesToString } = require('./bytes');
const { hexStr2byteArray } = require('../lib/code');
const { Transaction } = require('../protocol/core/Tron_pb');
const google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');
const { base64DecodeFromString } = require('../lib/code');
const {
  AccountCreateContract,
  TransferContract,
  TransferAssetContract,
  VoteAssetContract,
  VoteWitnessContract,
  WitnessCreateContract,
  AssetIssueContract,
  WitnessUpdateContract,
  ParticipateAssetIssueContract,
  AccountUpdateContract,
  FreezeBalanceContract,
  UnfreezeBalanceContract,
  WithdrawBalanceContract,
  UnfreezeAssetContract,
  UpdateAssetContract,
  ProposalCreateContract,
  ProposalApproveContract,
  ProposalDeleteContract,
  SetAccountIdContract,
  CreateSmartContract,
  TriggerSmartContract,
  UpdateSettingContract,
  ExchangeCreateContract,
  ExchangeInjectContract,
  ExchangeWithdrawContract,
  ExchangeTransactionContract,
  UpdateEnergyLimitContract
} = require('../protocol/core/Contract_pb');

const ContractType = Transaction.Contract.ContractType;
const ContractTable = {};
ContractTable[ContractType.ACCOUNTCREATECONTRACT] = [
  AccountCreateContract.deserializeBinary,
  'protocol.AccountCreateContract'
];
ContractTable[ContractType.TRANSFERCONTRACT] = [
  TransferContract.deserializeBinary,
  'protocol.TransferContract'
];
ContractTable[ContractType.TRANSFERASSETCONTRACT] = [
  TransferAssetContract.deserializeBinary,
  'protocol.TransferAssetContract'
];
ContractTable[ContractType.VOTEASSETCONTRACT] = [
  VoteAssetContract.deserializeBinary,
  'protocol.VoteAssetContract'
];
ContractTable[ContractType.VOTEWITNESSCONTRACT] = [
  VoteWitnessContract.deserializeBinary,
  'protocol.VoteWitnessContract'
];
ContractTable[ContractType.WITNESSCREATECONTRACT] = [
  WitnessCreateContract.deserializeBinary,
  'protocol.WitnessCreateContract'
];
ContractTable[ContractType.ASSETISSUECONTRACT] = [
  AssetIssueContract.deserializeBinary,
  'protocol.AssetIssueContract'
];
ContractTable[ContractType.WITNESSUPDATECONTRACT] = [
  WitnessUpdateContract.deserializeBinary,
  'protocol.WitnessUpdateContract'
];
ContractTable[ContractType.PARTICIPATEASSETISSUECONTRACT] = [
  ParticipateAssetIssueContract.deserializeBinary,
  'protocol.ParticipateAssetIssueContract'
];
ContractTable[ContractType.ACCOUNTUPDATECONTRACT] = [
  AccountUpdateContract.deserializeBinary,
  'protocol.AccountUpdateContract'
];
ContractTable[ContractType.FREEZEBALANCECONTRACT] = [
  FreezeBalanceContract.deserializeBinary,
  'protocol.FreezeBalanceContract'
];
ContractTable[ContractType.UNFREEZEBALANCECONTRACT] = [
  UnfreezeBalanceContract.deserializeBinary,
  'protocol.UnfreezeBalanceContract'
];
ContractTable[ContractType.WITHDRAWBALANCECONTRACT] = [
  WithdrawBalanceContract.deserializeBinary,
  'protocol.WithdrawBalanceContract'
];
ContractTable[ContractType.UNFREEZEASSETCONTRACT] = [
  UnfreezeAssetContract.deserializeBinary,
  'protocol.UnfreezeAssetContract'
];
ContractTable[ContractType.UPDATEASSETCONTRACT] = [
  UpdateAssetContract.deserializeBinary,
  'protocol.UpdateAssetContract'
];
ContractTable[ContractType.PROPOSALCREATECONTRACT] = [
  ProposalCreateContract.deserializeBinary,
  'protocol.ProposalCreateContract'
];
ContractTable[ContractType.PROPOSALAPPROVECONTRACT] = [
  ProposalApproveContract.deserializeBinary,
  'protocol.ProposalApproveContract'
];
ContractTable[ContractType.PROPOSALDELETECONTRACT] = [
  ProposalDeleteContract.deserializeBinary,
  'protocol.ProposalDeleteContract'
];
ContractTable[ContractType.SETACCOUNTIDCONTRACT] = [
  SetAccountIdContract.deserializeBinary,
  'protocol.SetAccountIdContract'
];
ContractTable[ContractType.CREATESMARTCONTRACT] = [
  CreateSmartContract.deserializeBinary,
  'protocol.CreateSmartContract'
];
ContractTable[ContractType.TRIGGERSMARTCONTRACT] = [
  TriggerSmartContract.deserializeBinary,
  'protocol.TriggerSmartContract'
];
ContractTable[ContractType.UPDATESETTINGCONTRACT] = [
  UpdateSettingContract.deserializeBinary,
  'protocol.UpdateSettingContract'
];
ContractTable[ContractType.EXCHANGECREATECONTRACT] = [
  ExchangeCreateContract.deserializeBinary,
  'protocol.ExchangeCreateContract'
];
ContractTable[ContractType.EXCHANGEINJECTCONTRACT] = [
  ExchangeInjectContract.deserializeBinary,
  'protocol.ExchangeInjectContract'
];
ContractTable[ContractType.EXCHANGEWITHDRAWCONTRACT] = [
  ExchangeWithdrawContract.deserializeBinary,
  'protocol.ExchangeWithdrawContract'
];
ContractTable[ContractType.EXCHANGETRANSACTIONCONTRACT] = [
  ExchangeTransactionContract.deserializeBinary,
  'protocol.ExchangeTransactionContract'
];
ContractTable[ContractType.UPDATEENERGYLIMITCONTRACT] = [
  UpdateEnergyLimitContract.deserializeBinary,
  'protocol.UpdateEnergyLimitContract'
];

/* not defined right now
  ContractTable[ContractType.GETCONTRACT] = [GetContract.deserializeBinary, 'protocol.GetContract'];
  ContractTable[ContractType.CUSTOMCONTRACT] = [CustomContract.deserializeBinary,'protocol.CustomContract']
*/

const TransactionFields = {
  decodeAddress(address) {
    return getBase58CheckAddress(base64DecodeFromString(address));
  },
  ownerAddress(address) {
    return this.decodeAddress(address);
  },
  toAddress(address) {
    return this.decodeAddress(address);
  },
  voteAddress(address) {
    return this.decodeAddress(address);
  },
  address(address) {
    return this.decodeAddress(address);
  },
  creatorAddress(address) {
    return this.decodeAddress(address);
  },
  data(data) {
    return Buffer.from(data, 'base64').toString('ascii');
  },
  assetName(token) {
    return bytesToString(Array.from(base64DecodeFromString(token)));
  },
  tokenId(token) {
    if (token == 0) {
      return 0; //contract type 31
    } else {
      if (isNaN(token)) {
        return bytesToString(Array.from(base64DecodeFromString(token)));
      } else {
        return token;
      }
    }
    return bytesToString(Array.from(base64DecodeFromString(token)));
  },
  firstTokenId(token) {
    return bytesToString(Array.from(base64DecodeFromString(token)));
  },
  secondTokenId(token) {
    return bytesToString(Array.from(base64DecodeFromString(token)));
  }
};

function decodeTransactionFields(transaction) {
  const transactionResult = transaction;

  Object.keys(transactionResult).forEach(key => {
    if (Array.isArray(transactionResult[key])) {
      transactionResult[key].forEach(decodeTransactionFields);
    } else if (TransactionFields[key]) {
      transactionResult[key] = TransactionFields[key](
        transactionResult[key],
        transaction.contractType
      );
    }
  });
  return transactionResult;
}

function deserializeTransaction(tx) {
  if (!tx || !tx.getRawData()) return null;
  try {
    const transaction = tx.getRawData().toObject();
    const contract = tx.getRawData().getContractList()[0];
    const any = contract.getParameter();
    const contractType = contract.getType();

    if (!ContractTable[contractType]) return null;

    let transference = any.unpack(
      ContractTable[contractType][0],
      ContractTable[contractType][1]
    );
    transference = transference.toObject();
    transference.contractType = contractType;
    transference.hash = byteArray2hexStr(
      SHA256(tx.getRawData().serializeBinary())
    ).toLowerCase();
    transference.time = tx.getRawData().getTimestamp();
    transference.data = transaction.data;
    transference = decodeTransactionFields(transference);
    return transference;
  } catch (err) {
    throw err;
  }
}

function deserializeTransactions(transactionsList = []) {
  return transactionsList
    .map(tx => deserializeTransaction(tx))
    .filter(t => !!t);
}

function deserializeEasyTransfer(transferResult) {
  const easyObject = transferResult.toObject();
  easyObject.result.message = bytesToString(
    Array.from(base64DecodeFromString(easyObject.result.message))
  );
  easyObject.transaction = deserializeTransaction(
    transferResult.getTransaction()
  );
  return easyObject;
}

function encodeString(str) {
  return Uint8Array.from(base64DecodeFromString(btoa(str)));
}

function buildTransferContract(message, contractType, typeName) {
  const anyValue = new google_protobuf_any_pb.Any();
  anyValue.pack(message.serializeBinary(), `protocol.${typeName}`);

  const contract = new Transaction.Contract();
  contract.setType(contractType);
  contract.setParameter(anyValue);

  const raw = new Transaction.raw();
  raw.addContract(contract);
  raw.setTimestamp(new Date().getTime());

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
    'TransferContract'
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
    'TransferAssetContract'
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
    'AccountUpdateContract'
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
    'WitnessCreateContract'
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
    'WitnessUpdateContract'
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
    'WithdrawBalanceContract'
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
    'VoteWitnessContract'
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
function buildAssetParticipateTransaction(
  address,
  issuerAddress,
  token,
  amount
) {
  const contract = new ParticipateAssetIssueContract();

  contract.setToAddress(Uint8Array.from(decode58Check(issuerAddress)));
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setAssetName(encodeString(token));
  contract.setAmount(amount);

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.PARTICIPATEASSETISSUECONTRACT,
    'ParticipateAssetIssueContract'
  );

  return transaction;
}

/**
 * Asset issue transaction
 * @param {object} options options list
 *
 */
function buildAssetIssueTransaction(
  address,
  name,
  shortName,
  description,
  url,
  totalSupply,
  icoNum,
  icoTrxPerNum,
  icoStartTime,
  icoEndTime,
  frozenSupply,
  precision = 0
) {
  const contract = new AssetIssueContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setName(encodeString(name));
  contract.setAbbr(encodeString(shortName));
  contract.setDescription(encodeString(description));
  contract.setTotalSupply(totalSupply);
  contract.setNum(icoNum);
  contract.setTrxNum(icoTrxPerNum);
  contract.setStartTime(icoStartTime);
  contract.setEndTime(icoEndTime);
  contract.setUrl(encodeString(url));
  contract.setPublicFreeAssetNetUsage(0);
  contract.setFreeAssetNetLimit(0);
  contract.setPublicFreeAssetNetLimit(0);
  contract.setPrecision(precision);

  if (frozenSupply) {
    for (const frozenSupplyItem of frozenSupply) {
      const frozenSupplyContract = new AssetIssueContract.FrozenSupply();
      frozenSupplyContract.setFrozenAmount(frozenSupplyItem.amount);
      frozenSupplyContract.setFrozenDays(frozenSupplyItem.days);
      contract.addFrozenSupply(frozenSupplyContract);
    }
  }

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.ASSETISSUECONTRACT,
    'AssetIssueContract'
  );

  return transaction;
}

/**
 * Asset update transaction
 * @param {object} options options list
 *
 */
function builUpdateAssetTransaction(options) {
  const contract = new UpdateAssetContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(options.address)));
  contract.setUrl(encodeString(options.url));
  contract.setDescription(encodeString(options.description));
  // TODO newLimit & newPublicLimit?

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.UPDATEASSETCONTRACT,
    'UpdateAssetContract'
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
    'FreezeBalanceContract'
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
    'UnfreezeBalanceContract'
  );

  return transaction;
}

/**
 * Withdraw balance
 *
 * @param address From which address to withdraw
 *
 */
function buildWithdrawBalanceTransaction(address) {
  const contract = new WithdrawBalanceContract();

  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.WITHDRAWBALANCECONTRACT,
    'WithdrawBalanceContract'
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
    'UnfreezeAssetContract'
  );

  return transaction;
}

/**
 * Exchange Create
 *
 * @param address Exchange creation address
 * @param firstTokenId First token id (name)
 * @param firstTokenBalance First token balance
 * @param secondTokenId Second token id (name)
 * @param secondTokenBalance Second token balance
 *
 */
function buildExchangeCreateContractTransaction(
  address,
  firstTokenId,
  firstTokenBalance,
  secondTokenId,
  secondTokenBalance
) {
  const contract = new ExchangeCreateContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setFirstTokenId(encodeString(firstTokenId));
  contract.setFirstTokenBalance(firstTokenBalance);
  contract.setSecondTokenId(encodeString(secondTokenId));
  contract.setSecondTokenBalance(secondTokenBalance);

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.EXCHANGECREATECONTRACT,
    'ExchangeCreateContract'
  );

  return transaction;
}

/**
 * Exchange Inject
 *
 * @param address Exchange inject address (origin)
 * @param exchangeId Exchange id number
 * @param tokenId token id to inject
 * @param quantity Quantity of tokens to inject
 */
function buildExchangeInjectContractContractTransaction(
  address,
  exchangeId,
  tokenId,
  quantity
) {
  const contract = new ExchangeInjectContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setExchangeId(exchangeId);
  contract.setTokenId(encodeString(tokenId));
  contract.setQuant(quantity);

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.EXCHANGEINJECTCONTRACT,
    'ExchangeInjectContract'
  );

  return transaction;
}

/**
 * Exchange Withdraw
 *
 * @param address Exchange withdraw address (origin)
 * @param exchangeId Exchange id number
 * @param tokenId token id to inject
 * @param quantity Quantity of tokens to withdraw
 */
function buildExchangeWithdrawContractTransaction(
  address,
  exchangeId,
  tokenId,
  quantity
) {
  const contract = new ExchangeWithdrawContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setExchangeId(exchangeId);
  contract.setTokenId(encodeString(tokenId));
  contract.setQuant(quantity);

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.EXCHANGEWITHDRAWCONTRACT,
    'ExchangeWithdrawContract'
  );

  return transaction;
}

/**
 * Exchange Withdraw
 *
 * @param address Exchange withdraw address (origin)
 * @param exchangeId Exchange id number
 * @param tokenId token id to inject
 * @param quantity Quantity of tokens to withdraw
 */
function buildExchangeTransactionContractTransaction(
  address,
  exchangeId,
  tokenId,
  quantity,
  expectedPrice
) {
  const contract = new ExchangeTransactionContract();
  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setExchangeId(exchangeId);
  contract.setTokenId(encodeString(tokenId));
  contract.setQuant(quantity);
  contract.setExpected(expectedPrice);

  const transaction = buildTransferContract(
    contract,
    Transaction.Contract.ContractType.EXCHANGETRANSACTIONCONTRACT,
    'ExchangeTransactionContract'
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

  const generateBlockId = [
    ...numBytes.slice(0, 8),
    ...hashBytes.slice(8, hashBytes.length - 1)
  ];

  const rawData = transaction.getRawData();
  rawData.setRefBlockHash(Uint8Array.from(generateBlockId.slice(8, 16)));
  rawData.setRefBlockBytes(Uint8Array.from(numBytes.slice(6, 8)));
  rawData.setExpiration(block.time + 60 * 5 * 1000);

  transaction.setRawData(rawData);
  return transaction;
}

/**
 * Add data message to a Transaction
 * This is a needed step after building the transaction before signing the transaction it to the network.
 * @param {Transaction} transaction a builded non-signed transaction
 * @param {String} data the message that you want to stream with the transaction
 */
function addDataToTransaction(transaction, data) {
  transaction.getRawData().setData(btoa(data));
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
  builUpdateAssetTransaction,
  buildWitnessUpdateTransaction,
  buildWithdrawBalanceTransaction,
  buildWitnessCreateTransaction,
  buildUnfreezeAssetTransaction,
  buildExchangeCreateContractTransaction,
  buildExchangeInjectContractContractTransaction,
  buildExchangeWithdrawContractTransaction,
  buildExchangeTransactionContractTransaction,
  addBlockReferenceToTransaction,
  addDataToTransaction,
  signTransaction,
  decodeTransactionFields,
  deserializeTransaction,
  deserializeTransactions,
  deserializeEasyTransfer
};
