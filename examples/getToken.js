const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.trongrid.io',
  port: 50051
});

async function run() {
  try {
    const trxp = await client.getAssetIssueByName('1000001');
    console.log(trxp);
  } catch (err) {
    console.error(err);
  }
}

run();
