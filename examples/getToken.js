const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.shasta.trongrid.io',
  port: 50051,
});

async function run() {
  try {
    const trxp = await client.getAssetIssueById('1000056');
    console.log(trxp);
    const tokens = await client.getAssetIssueList();
    console.log(tokens); // result
  } catch (err) {
    console.error(err);
  }
}

run();
