const { Account } = require('../src');

function main() {
  const pk = '9642A0A5BDF477F872786F9AF5B92CEDDF48191FCA9487250087258B231FC59A';
  const address = Account.getAddressFromPrivateKey(pk);
  console.log(address);
  console.log('account', Account.generateAccount());
}

main();
