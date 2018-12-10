const { SolidityGrpcClient } = require('../src');

const client = new SolidityGrpcClient({
  hostname: '47.251.52.228',
  port: 50051,
});

async function run() {
  try {
    const block = await client.getBlockByNumber(4995508);
    console.log(block); // result
  } catch (e) {
    console.log(e);
  }
}

run();
