const GrpcClient = require('./client/grpc');
const SolidityGrpcClient = require('./client/solidity_grpc');
const Transaction = require('./utils/transaction');

module.exports = {
  GrpcClient,
  SolidityGrpcClient,
  Transaction
};
