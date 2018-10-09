
const { getBase58CheckAddress } = require('./crypto');
const { bytesToString } = require('./bytes');

const deserializeAsset = assetRaw => ({
  ownerAddress: getBase58CheckAddress(Array.from(assetRaw.getOwnerAddress())),
  url: bytesToString(assetRaw.getUrl()),
  name: bytesToString(assetRaw.getName()),
  description: bytesToString(assetRaw.getDescription()),
  startTime: assetRaw.getStartTime(),
  endTime: assetRaw.getEndTime(),
  voteScore: assetRaw.getVoteScore(),
  totalSupply: assetRaw.getTotalSupply(),
  trxNum: assetRaw.getTrxNum() / 1000,
  num: assetRaw.getNum(),
  frozenSupplyList: assetRaw.getFrozenSupplyList().map(frz => frz.toObject()),
  abbr: bytesToString(assetRaw.getAbbr()),
});

const deserializeAssets = assetsRaw => assetsRaw.getAssetissueList().map(deserializeAsset);

module.exports = {
  deserializeAsset,
  deserializeAssets,
};
