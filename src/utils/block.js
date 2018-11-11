
const { deserializeTransactions } = require('../utils/transaction');
const { getBase58CheckAddress, SHA256 } = require('../utils/crypto');
const { byteArray2hexStr } = require('../utils/bytes');
const { base64DecodeFromString } = require('../lib/code');

const deserializeBlock = (blockRaw) => {
  const blockObj = blockRaw.toObject();
  // block doesn't exists
  if (!blockObj.blockHeader) return null;

  const deserializedTxs = deserializeTransactions(blockRaw.getTransactionsList());
  return {
    transactionsList: deserializedTxs,
    transactionsCount: deserializedTxs.length,
    totalTrx: deserializedTxs.reduce((t, n) => t + ((n && n.amount) ? n.amount : 0), 0),
    size: blockRaw.serializeBinary().length,
    time: blockRaw.getBlockHeader().getRawData().getTimestamp(),
    witnessAddress: getBase58CheckAddress(base64DecodeFromString(blockObj.blockHeader.rawData.witnessAddress)),
    number: blockRaw.getBlockHeader().getRawData().getNumber(),
    parentHash: byteArray2hexStr(blockRaw.getBlockHeader().getRawData().getParenthash()).toLowerCase(),
    hash: byteArray2hexStr(SHA256(blockRaw.getBlockHeader().getRawData().serializeBinary())).toLowerCase(),
  };
};

const deserializeBlocks = blocksRaw => blocksRaw.getBlockList().map(deserializeBlock);

module.exports = {
  deserializeBlock,
  deserializeBlocks,
};
