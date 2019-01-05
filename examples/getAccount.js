const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.shasta.trongrid.io',
  port: 50051,
});

async function run() {
  const account = await client.getAccount('TVsBRLWpLeQabKrPQngzYVtofRMzrNntDo');
  console.log(account); // result
}

run();
