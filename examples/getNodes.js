const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: '52.220.172.34',
  port: 50051,
});

async function run() {
  try {
    const nodes = await client.getNodes();
    console.log(nodes); // result
    // const witnesess = await client.getWitnesses();
    // console.log(witnesess); // result
  } catch (e) {
    console.log(e);
  }
}

run();
