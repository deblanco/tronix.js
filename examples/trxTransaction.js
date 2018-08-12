const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: '47.254.146.147',
  port: 50051,
});

async function run() {
  // Create and broadcast transaction
  const transaction = await client.createTransaction(
    '009AEC470DB691C1359C9FCF119628D94174023AE2FD3F9C894596DCF6138DDA',
    'TQLtKtQTBP465FJ23xdgQqwUuw9uAeBRTa',
    'TSyZ75VYtchKqgDJfNS4qyFzB1kWPp5y8h',
    100000,
  );
  console.log(transaction); // result
}

run();
