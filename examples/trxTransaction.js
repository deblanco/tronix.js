const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.trongrid.io',
  port: 50051,
});

const jsonExample = {
  payment_id: '63b5d56ba347457844252cc7f20ca453c38bf5e3256e130e4dfd1dc0db64767b',
  encrypted_data: 'jDeirfYptNMuLFPvvCAe36V2spUoXlgA9deQMnF2PTB+rX6YZmQ7DHGgXwBOd03F1MMfkwBsaU5wB+AW8dzK2RpBq136hvBn17lqrsDjHl4yR5HDi6wmCsr0Wm0u99TIeSNNf2x6j/+E6A3fT1jUfjoGnw++9gVNIafTRxv89i/Z1UCY966kSzdsnqBGiB/Dw1YGUCaI/hfB/zU2eGGCS2iMMLjCG56yLkxE7rcKkn3eOwMMisClZVZ70EW49MdUgak5BuEwwg==',
};

async function run() {
  // Create and broadcast transaction
  try {
    // const transaction = await client.createTransaction(
    //   '7d237e652159e6c532d5daeea31b4ae71d8085783d7539a986a4bf295b1ce657',
    //   'TL1ugdFjji9GxA7iVh3W5UAh2vN1BRaz5M',
    //   'TG8Mp5Dkd2iBnzkcBrrMJZtKArqtufYfJS',
    //   1100000,
    //   JSON.stringify(jsonExample),
    // );
    // console.log(transaction); // result
    const getTransaction = await client.getTransactionById('4509c34dec4b10148330d972742ffa7015c15c82250d851b79ddc4e0f49f627d');
    console.log(getTransaction);
  } catch (e) {
    console.log(e);
  }
}

run();
