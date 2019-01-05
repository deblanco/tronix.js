const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.shasta.trongrid.io',
  port: 50051,
});

async function run() {
  // Create and broadcast transaction
  const asset = await client.createAsset(
    '582729C4B66A32486F97C8BCA6CE8A7710418D22FDD09FF5EC07121752905A4A',
    'TVsBRLWpLeQabKrPQngzYVtofRMzrNntDo',
    'TRXP',
    'TRXP',
    'TRXP4Ever',
    'https://google.com',
    10000000,
    1,
    1,
    Date.now() + 500000,
    Date.now() + 5000000,
    null,
    6,
  );
  console.log(asset); // result
}

run();
