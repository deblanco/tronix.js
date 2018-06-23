
const { deserializeTransactions } = require('../utils/serializer');
const { getBase58CheckAddress } = require('../utils/crypto');
const { byteArray2hexStr } = require('../utils/bytes');
const { base64DecodeFromString } = require('../lib/code');

const deserializeBlock = (blockRaw) => {
  const blockObj = blockRaw.toObject();
  const deserializedTxs = deserializeTransactions(blockRaw.getTransactionsList());
  return {
    transactionsList: deserializedTxs,
    transactionsCount: deserializedTxs.length,
    totalTrx: deserializedTxs.reduce((t, n) => t + ((n && n.amount) ? n.amount : 0), 0),
    size: blockRaw.serializeBinary().length,
    time: blockObj.blockHeader.rawData.timestamp,
    witnessAddress: getBase58CheckAddress(base64DecodeFromString(blockObj.blockHeader.rawData.witnessAddress)),
    number: blockObj.blockHeader.rawData.number,
    parentHash: byteArray2hexStr(blockRaw.getBlockHeader().getRawData().getParenthash()),
  };
};

const deserializeBlocks = blocksRaw => blocksRaw.getBlockList().map(deserializeBlock);

module.exports = {
  deserializeBlock,
  deserializeBlocks,
};