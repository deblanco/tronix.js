const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.shasta.trongrid.io',
  port: 50051,
});

async function run() {
  const account = await client.getAccount('TY4WakEWYCJ5auM8DXkDxKmiFBWY3TU9HM');
  console.log(account); // result
}

run();
