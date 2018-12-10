const ADDRESS_PREFIX_TEST = 'a0';
const ADDRESS_PREFIX = '41';
const ADDRESS_SIZE = 34;


function isAddressValid(address) {
  if (!address || address.length === 0) {
    return false;
  }

  if (address.length !== ADDRESS_SIZE) {
    return false;
  }

  const prefixRegex = new RegExp(`^(${ADDRESS_PREFIX}|${ADDRESS_PREFIX_TEST})`);
  if (prefixRegex.test(address.substr(0, 2).toUpperCase())) {
    return false;
  }

  return true;
}

module.exports = {
  isAddressValid,
  ADDRESS_PREFIX,
};
