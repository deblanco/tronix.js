const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.shasta.trongrid.io',
  port: 50051,
});

async function run() {
  // Create and broadcast transaction
  const transaction = await client.transferAsset(
    'E55FA381F323051393C4BF902ED408CD99AFBB61532D4AC9DA99777E398BDE2D',
    'hellotron',
    'TTQBFP2FARbYV6xhQLmLCHVmf6gt3bYmGQ',
    'TSyZ75VYtchKqgDJfNS4qyFzB1kWPp5y8h',
    2,
    '',
  );
  console.log(transaction); // result
}

run();
