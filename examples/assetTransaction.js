const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.trongrid.io',
  port: 50051,
});

async function run() {
  // Create and broadcast transaction
  const transaction = await client.transferAsset(
    '50D154C5498F81358EC56ADCA75CB5355FA1D09E3677C38BB98281EFFD153CDE',
    '1001913',
    'TMdLE7n8DzhiRxTKF8xQMP6redSXTgSxug',
    'TFQhs82XxZrH9ENfqM2srtdZno9gimipxh',
    20,
    '{"address_to":"TN7WabSJCVhYdJzbR5BcHrx1DyJ4mwFvBS"}"',
  );
  console.log(transaction); // result
}

run();


// amount:20
// assetName:"1001913"
// contractType:2
// data:"{"address_to":"TN7WabSJCVhYdJzbR5BcHrx1DyJ4mwFvBS"}"
// hash:"8ffc0b4071b6043161d58de128123aaba69242d26013c27a5daaece67c68ecdb"
// ownerAddress:"TMdLE7n8DzhiRxTKF8xQMP6redSXTgSxug"
// time:1547314765545
// toAddress:"TFQhs82XxZrH9ENfqM2srtdZno9gimipxh"
