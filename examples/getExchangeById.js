const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: '35.180.51.163',
  port: 50051,
});

async function run() {
  try {
   
    const exch = await client.getExchangeById(9);
    console.log(exch); // result
  } catch (e) {
    console.log(e);
  }
}

run();
