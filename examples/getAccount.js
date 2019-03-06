const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.trongrid.io',
  port: 50051,
});

async function run() {
  const account = await client.getAccount('TRNSzTRpHahqRbg7LBBUJpwpzD4viCgFRH');
  console.log(account); // result
}

run();
