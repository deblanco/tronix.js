const { byteArray2hexStr, bytesToString } = require('./bytes');
const { getBase58CheckAddress, genPriKey, getAddressFromPriKey } = require('./crypto');

/**
 * Generate a new account
 */
function generateAccount() {
  const priKeyBytes = genPriKey();
  const addressBytes = getAddressFromPriKey(priKeyBytes);
  const address = getBase58CheckAddress(addressBytes);
  const privateKey = byteArray2hexStr(priKeyBytes);

  return {
    privateKey,
    address,
  };
}

function deserializeAccount(accountRaw) {
  const account = accountRaw.toObject();
  if (account.accountName.length > 0) {
    account.accountName = bytesToString(Array.from(accountRaw.getAccountName()));
  }
  account.address = getBase58CheckAddress(Array.from(accountRaw.getAddress()));
  account.votesList.map((vote) => {
    vote.voteAddress = getBase58CheckAddress(vote.voteAddress);
    return vote;
  });
  account.balance = accountRaw.getBalance();
  account.assetMap = account.assetMap.map(asset => ({
    name: asset[0],
    balance: asset[1],
  }));
  return account;
}

module.exports = {
  generateAccount,
  deserializeAccount,
};
