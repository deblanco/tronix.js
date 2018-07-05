const caller = require('grpc-caller');
const { applyClassDecorator, requireAllParams } = require('../utils/decorators');
const {
  EmptyMessage, BytesMessage, NumberMessage, AccountPaginated,
} = require('../protocol/api/api_pb');

const { hexStr2byteArray } = require('../lib/code');
const { decode58Check } = require('../utils/crypto');
const { Account } = require('../protocol/core/Tron_pb');
const { WalletSolidityClient, WalletExtensionClient } = require('../protocol/api/api_grpc_pb');
const { deserializeBlock } = require('../utils/block');
const { deserializeAssets } = require('../utils/asset');
const { deserializeAccount } = require('../utils/account');
const { deserializeWitnesses } = require('../utils/witness');
const { deserializeTransaction, deserializeTransactions } = require('../utils/transaction');

class SolidityGrpcClient {
  constructor(options) {
    this.hostname = options.hostname;
    this.port = options.port;

    /**
     * @type {WalletClient}
     */
    this.api = caller(`${this.hostname}:${this.port}`, WalletSolidityClient);
    this.api_extension = caller(`${this.hostname}:${this.port}`, WalletExtensionClient);
  }

  async getAssetIssueList() {
    const assetsListRaw = await this.api.getAssetIssueList(new EmptyMessage());
    return deserializeAssets(assetsListRaw);
  }

  /**
   * Retrieve all connected witnesses
   *
   * @returns {Promise<*>}
   */
  async getWitnesses() {
    const witnesses = await this.api.listWitnesses(new EmptyMessage());
    return deserializeWitnesses(witnesses);
  }

  /**
   * Retrieves a account by the given address
   *
   * @param {address} string account address
   * @returns {Promise<*>}
   */
  async getAccount(address) {
    const accountArg = new Account();
    accountArg.setAddress(new Uint8Array(decode58Check(address)));
    const accountRaw = await this.api.getAccount(accountArg);
    return deserializeAccount(accountRaw);
  }

  /**
   * Retrieves a block by the given number
   *
   * @param {number} number block number
   * @returns {Promise<*>}
   */
  async getBlockByNumber(number) {
    const message = new NumberMessage();
    message.setNum(number);
    const blockRaw = await this.api.getBlockByNum(message);
    return deserializeBlock(blockRaw);
  }

  /**
   * Retrieve latest block
   *
   * @returns {Promise<*>}
   */
  async getLatestBlock() {
    const lastBlockRaw = await this.api.getNowBlock(new EmptyMessage());
    return deserializeBlock(lastBlockRaw);
  }


  async getTransactionById(txHash) {
    const txByte = new BytesMessage();
    txByte.setValue(new Uint8Array(hexStr2byteArray(txHash.toUpperCase())));
    const transaction = await this.api.getTransactionById(txByte);
    return deserializeTransaction(transaction);
  }

  async getTransactionsToThis(address, limit = 1000, offset = 0) {
    const accountArg = new Account();
    accountArg.setAddress(new Uint8Array(decode58Check(address)));
    const accountPag = new AccountPaginated();
    accountPag.setAccount(accountArg);
    accountPag.setLimit(limit);
    accountPag.setOffset(offset);
    const accountRaw = await this.api_extension.getTransactionsToThis(accountPag);
    return deserializeTransactions(accountRaw.getTransactionList());
  }

  async getTransactionsFromThis(address, limit = 1000, offset = 0) {
    const accountArg = new Account();
    accountArg.setAddress(new Uint8Array(decode58Check(address)));
    const accountPag = new AccountPaginated();
    accountPag.setAccount(accountArg);
    accountPag.setLimit(limit);
    accountPag.setOffset(offset);
    const accountRaw = await this.api_extension.getTransactionsFromThis(accountPag);
    return deserializeTransactions(accountRaw.getTransactionList());
  }
}

module.exports = applyClassDecorator(SolidityGrpcClient, requireAllParams);
