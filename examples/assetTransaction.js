const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.shasta.trongrid.io',
  port: 50051,
});

async function run() {
  // Create and broadcast transaction
  const transaction = await client.transferAsset(
    '582729C4B66A32486F97C8BCA6CE8A7710418D22FDD09FF5EC07121752905A4A',
    '1000056',
    'TVsBRLWpLeQabKrPQngzYVtofRMzrNntDo',
    'TN7WabSJCVhYdJzbR5BcHrx1DyJ4mwFvBS',
    25,
    '',
  );
  console.log(transaction); // result
}

run();
