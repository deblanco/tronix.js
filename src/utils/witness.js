const { getBase58CheckAddress } = require('../utils/crypto');

function deserializeWitness(witnessRaw) {
  const witness = witnessRaw.toObject();
  witness.address = getBase58CheckAddress(Array.from(witnessRaw.getAddress()));
  return witness;
}

function deserializeWitnesses(witnessesRaw) {
  return witnessesRaw.getWitnessesList().map(deserializeWitness);
}

module.exports = {
  deserializeWitnesses,
};
