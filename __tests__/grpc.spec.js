const fetch = require('node-fetch');
const { GrpcClient } = require('../src');

const getTronscanNodes = async () => {
  try {
    const nodes = await fetch('https://api.tronscan.org/api/node').then(res => res.json());
    const nodesGrpc = nodes.nodes.filter(node => node.grpcEnabled);
    return nodesGrpc;
  } catch (err) {
    throw err;
  }
};

describe('GrpcClient', async () => {
  let testNode;
  let client;

  beforeAll(async () => {
    testNode = await getTronscanNodes();

    client = new GrpcClient({
      hostname: testNode[0].ip,
      port: 50051,
    });
  });

  it('should retrieve the last block', async () => {
    const block = await client.getLatestBlock();
    expect(block).toBeDefined();
    const blockByNumber = await client.getBlockByNumber(block.number);
    expect(blockByNumber).toBeDefined();
  });

  it('should retrieve a list of witnesses', async () => {
    const witnesses = await client.getWitnesses();
    expect(witnesses.length).toBeGreaterThan(0);
  });
});
