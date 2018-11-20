const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.shasta.trongrid.io',
  port: 50051,
});

const jsonExample = {
  glossary: {
    title: 'example glossary',
    GlossDiv: {
      title: 'S',
      GlossList: {
        GlossEntry: {
          ID: 'SGML',
          SortAs: 'SGML',
          GlossTerm: 'Standard Generalized Markup Language',
          Acronym: 'SGML',
          Abbrev: 'ISO 8879:1986',
          GlossDef: {
            para: 'A meta-markup language, used to create markup languages such as DocBook.',
            GlossSeeAlso: ['GML', 'XML'],
          },
          GlossSee: 'markup',
        },
      },
    },
  },
};

async function run() {
  // Create and broadcast transaction
  try {
    const transaction = await client.createTransaction(
      'E55FA381F323051393C4BF902ED408CD99AFBB61532D4AC9DA99777E398BDE2D',
      'TTQBFP2FARbYV6xhQLmLCHVmf6gt3bYmGQ',
      'TVcaZYGf94J5K6WkPsfSDVUu5cWreZz1h9',
      100,
      JSON.stringify(jsonExample),
    );
    console.log(transaction); // result
    const getTransaction = await client.getTransactionById(transaction.transaction.hash);
    console.log(getTransaction);
  } catch (e) {
    console.log(e);
  }
}

run();
