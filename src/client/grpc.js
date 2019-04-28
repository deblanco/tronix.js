const caller = require('grpc-caller');
const {
  applyClassDecorator,
  requireAllParams
} = require('../utils/decorators');
const {
  EmptyMessage,
  NumberMessage,
  BytesMessage,
  BlockLimit,
  EasyTransferMessage,
  PaginatedMessage
} = require('../protocol/api/api_pb');
const { WalletClient } = require('../protocol/api/api_grpc_pb');
const { decode58Check } = require('../utils/crypto');
const { bytesToString, longToByteArray } = require('../utils/bytes');
const { Account } = require('../protocol/core/Tron_pb');
const {
  stringToBytes,
  hexStr2byteArray,
  base64DecodeFromString
} = require('../lib/code');
const { deserializeBlock, deserializeBlocks } = require('../utils/block');
const { deserializeAsset, deserializeAssets } = require('../utils/asset');
const { deserializeAccount } = require('../utils/account');
const { deserializeWitnesses } = require('../utils/witness');
const { atob } = require('../utils/base64');
const {
  buildTransferTransaction,
  buildTransferAssetTransaction,
  buildVoteTransaction,
  buildFreezeBalanceTransaction,
  buildAssetIssueTransaction,
  buildExchangeCreateContractTransaction,
  buildExchangeInjectContractContractTransaction,
  buildExchangeWithdrawContractTransaction,
  buildExchangeTransactionContractTransaction,
  addBlockReferenceToTransaction,
  addDataToTransaction,
  signTransaction,
  decodeTransactionFields,
  deserializeTransaction,
  deserializeEasyTransfer
} = require('../utils/transaction');

class GrpcClient {
  constructor(options) {
    this.hostname = options.hostname;
    this.port = options.port || 50051;

    /**
     * @type {WalletClient}
     */
    this.api = caller(`${this.hostname}:${this.port}`, WalletClient);
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

  /** NOT ENDED
   * Retrieve all blockchain configurated parameters
   *
   * @returns {Promise<*>}

  async getBlockchainParameters() {
    const chainParameters = await this.api.getChainParameters(new EmptyMessage());
    console.log(chainParameters.toObject());
    return chainParameters;
  }
  */

  /**
   * Retrieve all connected nodes
   *
   * @returns {Promise<*>}
   */
  getNodes() {
    return this.api.listNodes(new EmptyMessage()).then(x =>
      x.getNodesList().map(node => ({
        port: node.getAddress().getPort(),
        host: atob(node.getAddress().getHost_asB64())
      }))
    );
  }

  /**
   * Retrieves assets list
   *
   * @returns {Promise<*>}
   */
  async getAssetIssueList() {
    const assetsListRaw = await this.api.getAssetIssueList(new EmptyMessage());
    return deserializeAssets(assetsListRaw);
  }

  /**
   * Retrieves a account by the given address
   *
   * @param {assetName} string asset name
   * @returns {Promise<*>}
   */
  async getAssetIssueByName(assetName) {
    const assetByte = new BytesMessage();
    assetByte.setValue(new Uint8Array(stringToBytes(assetName)));
    const assetIssue = await this.api.getAssetIssueByName(assetByte);
    return {
      id: assetName,
      ...deserializeAsset(assetIssue)
    };
  }

  /**
   * Retrieves an asset by the given id
   *
   * @param {assetId} string asset id
   * @returns {Promise<*>}
   */
  async getAssetIssueById(assetId) {
    const assetByte = new BytesMessage();
    assetByte.setValue(new Uint8Array(stringToBytes(assetId)));
    const assetIssue = await this.api.getAssetIssueById(assetByte);
    return deserializeAsset(assetIssue);
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
   * Retrieve an account resource information
   *
   * @param {address} address address account
   * @returns {Promise<*>}
   */
  async getAccountResource(address) {
    const accountArg = new Account();
    accountArg.setAddress(new Uint8Array(decode58Check(address)));
    const accountRaw = await this.api.getAccountResource(accountArg);
    return accountRaw.toObject();
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
   * Get block by latest num
   * @param {number} start block number
   * @param {number} end block number
   * @returns {Promise<*>}
   */
  async getBlockByLimitNext(start, end) {
    const message = new BlockLimit();
    message.setStartnum(start);
    message.setEndnum(end);
    const blocksRaw = await this.api.getBlockByLimitNext(message);
    return deserializeBlocks(blocksRaw);
  }

  /**
   * Get block by latest num
   *
   * @returns {Promise<*>}
   */
  async getBlockByLatestNum(limit = 1) {
    const message = new NumberMessage();
    message.setNum(limit);
    const blocksRaw = await this.api.getBlockByLatestNum(message);
    return deserializeBlocks(blocksRaw);
  }

  /**
   * Retrieve latest block
   *
   * @returns {Promise<*>}
   */
  async getNowBlock() {
    const lastBlockRaw = await this.api.getNowBlock(new EmptyMessage());
    return deserializeBlock(lastBlockRaw);
  }

  /**
   * Retrieve transaction by id
   *
   * @returns {Promise<*>}
   */
  async getTransactionById(txHash) {
    const txByte = new BytesMessage();
    txByte.setValue(new Uint8Array(hexStr2byteArray(txHash.toUpperCase())));
    const transaction = await this.api.getTransactionById(txByte);
    return deserializeTransaction(transaction);
  }

  /**
   * Retrieve total transactions
   *
   * @returns {Promise<*>}
   */
  async getTotalTransaction() {
    const totalTransactions = await this.api.totalTransaction(
      new EmptyMessage()
    );
    return totalTransactions.toObject().num;
  }

  /**
   * Retrieve next maintenance time
   *
   * @returns {Promise<*>}
   */
  async getNextMaintenanceTime() {
    const nextMaintenanceTime = await this.api.getNextMaintenanceTime(
      new EmptyMessage()
    );
    return nextMaintenanceTime.toObject();
  }

  /**
   * Easy transfer
   *
   * @returns {Promise<*>}
   */
  async easyTransfer(passPhrase, toAddress, amount) {
    const easyTransferMessage = new EasyTransferMessage();
    easyTransferMessage.setPassphrase(
      new Uint8Array(stringToBytes(passPhrase))
    );
    easyTransferMessage.setToaddress(Uint8Array.from(decode58Check(toAddress)));
    easyTransferMessage.setAmount(amount);
    const result = await this.api.easyTransfer(easyTransferMessage);
    return deserializeEasyTransfer(result);
  }

  /**
   * Generate address
   *
   * @returns {Promise<*>}
   */
  async generateAddress() {
    const newAddress = await this.api.generateAddress(new EmptyMessage());
    return newAddress.toObject();
  }

  /**
   * Create address from string
   *
   * @returns {Promise<*>}
   */
  async createAdresss(randomString) {
    const randomByte = new BytesMessage();
    randomByte.setValue(new Uint8Array(stringToBytes(randomString)));
    const newAddress = await this.api.createAdresss(randomByte);
    const newAddressResult = newAddress.toObject();
    return decodeTransactionFields({
      address: newAddressResult.value
    });
  }

  /**
   * Freeze balance
   *
   * @returns {Promise<*>}
   */
  async freezeBalance(priKey, address, amount, duration) {
    const freezeTransaction = buildFreezeBalanceTransaction(
      address,
      amount,
      duration
    );
    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      freezeTransaction,
      nowBlock
    );
    const signedTransaction = signTransaction(referredTransaction, priKey);
    const sendTransaction = await this.api.broadcastTransaction(
      signedTransaction
    );
    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * Vote witness
   *
   * @returns {Promise<*>}
   */
  async voteWitnessAccount(priKey, fromAddress, votes) {
    const voteTransaction = buildVoteTransaction(fromAddress, votes);
    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      voteTransaction,
      nowBlock
    );
    const signedTransaction = signTransaction(referredTransaction, priKey);
    const sendTransaction = await broadcastTransaction(signedTransaction);
    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * Get exchange by id
   *
   * @returns {Promise<*>}
   */
  async createAsset(
    priKey,
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
    precision
  ) {
    const assetTransaction = buildAssetIssueTransaction(
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
      precision
    );

    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      assetTransaction,
      nowBlock
    );
    const signedTransaction = signTransaction(referredTransaction, priKey);
    const sendTransaction = await this.api.broadcastTransaction(
      signedTransaction
    );
    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * List exchange
   *
   * @returns {Promise<*>}
   */
  async listExchanges() {
    const message = new EmptyMessage();
    const exchangeList = await this.api.listExchanges(message);
    return decodeTransactionFields(exchangeList.toObject());
  }

  /**
   * Get paginated exchange
   *
   * @returns {Promise<*>}
   */
  async getPaginatedExchangeList(limit = 1000, offset = 0) {
    const exchangeListParams = new PaginatedMessage();
    exchangeListParams.setOffset(offset);
    exchangeListParams.setLimit(limit);
    const exchangeList = await this.api.getPaginatedExchangeList(
      exchangeListParams
    );
    return decodeTransactionFields(exchangeList.toObject());
  }

  /**
   * Get exchange by id
   *
   * @returns {Promise<*>}
   */
  async getExchangeById(id) {
    const idBytes = new BytesMessage();
    idBytes.setValue(new Uint8Array(longToByteArray(id).reverse()));
    const exchangeResult = await this.api.getExchangeById(idBytes);
    return decodeTransactionFields(exchangeResult.toObject());
  }

  /**
   * Create exchange by id
   *
   * @returns {Promise<*>}
   */
  async createExchange(
    priKey,
    address,
    firstTokenId,
    firstTokenBalance,
    secondTokenId,
    secondTokenBalance
  ) {
    const exchangeTransaction = buildExchangeCreateContractTransaction(
      address,
      firstTokenId,
      firstTokenBalance,
      secondTokenId,
      secondTokenBalance
    );

    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      exchangeTransaction,
      nowBlock
    );
    const signedTransaction = signTransaction(referredTransaction, priKey);
    const sendTransaction = await this.api.broadcastTransaction(
      signedTransaction
    );
    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * Inject exchange by id
   *
   * @returns {Promise<*>}
   */
  async injectExchange(priKey, address, exchangeId, tokenId, quantity) {
    const exchangeTransaction = buildExchangeInjectContractContractTransaction(
      address,
      exchangeId,
      tokenId,
      quantity
    );
    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      exchangeTransaction,
      nowBlock
    );
    const signedTransaction = signTransaction(referredTransaction, priKey);
    const sendTransaction = await this.api.broadcastTransaction(
      signedTransaction
    );
    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * Inject exchange by id
   *
   * @returns {Promise<*>}
   */
  async withdrawExchange(priKey, address, exchangeId, tokenId, quantity) {
    const exchangeTransaction = buildExchangeWithdrawContractTransaction(
      address,
      exchangeId,
      tokenId,
      quantity
    );
    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      exchangeTransaction,
      nowBlock
    );
    const signedTransaction = signTransaction(referredTransaction, priKey);
    const sendTransaction = await this.api.broadcastTransaction(
      signedTransaction
    );
    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * Execute exchange by id
   *
   * @returns {Promise<*>}
   */
  async executeExchange(
    priKey,
    address,
    exchangeId,
    tokenId,
    quantity,
    expectedPrice
  ) {
    const exchangeTransaction = buildExchangeTransactionContractTransaction(
      address,
      exchangeId,
      tokenId,
      quantity,
      expectedPrice
    );
    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      exchangeTransaction,
      nowBlock
    );
    const signedTransaction = signTransaction(referredTransaction, priKey);
    const sendTransaction = await this.api.broadcastTransaction(
      signedTransaction
    );
    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * Create transaction
   *
   * @returns {Promise<*>}
   */
  async createTransaction(priKey, from, to, amount, data) {
    const transferContract = buildTransferTransaction(from, to, amount);
    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      transferContract,
      nowBlock
    );
    if (data) addDataToTransaction(transferContract, data);
    const signedTransaction = signTransaction(referredTransaction, priKey);

    const sendTransaction = await this.api.broadcastTransaction(
      signedTransaction
    );

    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * Transfer asset
   *
   * @returns {Promise<*>}
   */
  async transferAsset(priKey, token, from, to, amount, data) {
    const transferContract = buildTransferAssetTransaction(
      token,
      from,
      to,
      amount
    );
    const nowBlock = await this.getNowBlock();
    const referredTransaction = addBlockReferenceToTransaction(
      transferContract,
      nowBlock
    );
    if (data) addDataToTransaction(transferContract, data);
    const signedTransaction = signTransaction(referredTransaction, priKey);
    const sendTransaction = await this.api.broadcastTransaction(
      signedTransaction
    );
    return {
      ...sendTransaction.toObject(),
      transaction: deserializeTransaction(signedTransaction)
    };
  }

  /**
   * Broadcast transaction
   *
   * @returns {Promise<*>}
   */
  async broadcastTransaction(transaction) {
    let broadcastTransactionAnswer = await this.api.broadcastTransaction(
      transaction
    );
    broadcastTransactionAnswer = broadcastTransactionAnswer.toObject();
    broadcastTransactionAnswer.message = bytesToString(
      Array.from(base64DecodeFromString(broadcastTransactionAnswer.message))
    );
    return broadcastTransactionAnswer;
  }
}

module.exports = applyClassDecorator(GrpcClient, requireAllParams);
