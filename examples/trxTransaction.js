const { GrpcClient } = require('../src');

const client = new GrpcClient({
  hostname: 'grpc.trongrid.io',
  port: 50051,
});

const jsonExample = {
  encrypted_data: 'QU8ZUEH3MxgUXtInA0TW/W3QZ7PU/mt83sYH7q7FuJItfUMCXk9FMfFwkFACYFeWhgSIGTPO1+qEt/txp5GuuPdlf015rw///fb0pM4kVAB29Z1vV4ZmHN6B3zwiiBbWvYtg57aqfuuupX5oKEuZFejrn/kqrFeVXlT4bCFemZMJJyMTWZ9AfF5kGMDdYaPpho6KLzR2+KNsNlFSodRbmWXUpd+UA8YZpQx5XwMDZd9s48iC5UWneiQ46y+W/3C4dDwPDDfq',
};

async function run() {
  // Create and broadcast transaction
  try {
    console.time();
    const transaction = await client.createTransaction(
      '0F2784AA700A9676F6D203345ABA7DAD07A929177981326FF4C9C3E999DDBE61',
      'TG8Mp5Dkd2iBnzkcBrrMJZtKArqtufYfJS',
      'TCehHrPdrVM7dSx4AZYgNogZwAAdzSDgGp',
      200000,
      JSON.stringify(jsonExample),
    );
    console.log(transaction); // result
    const getTransaction = await client.getTransactionById(transaction.transaction.hash);
    console.log(getTransaction);
    console.timeEnd();
  } catch (e) {
    console.log(e);
  }
}

run();
