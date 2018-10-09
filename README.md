# tronix.js

Javascript API for the Tron Protocol via GRPC

## Installation

`npm install --save tronix.js`

## Usage

```javascript
const { GrpcClient, SolidityGrpcClient } = require('tronix.js');

const client = new GrpcClient({
  hostname: '99.99.99.99',
  port: 50051,
});

const solidityClient = new SolidityGrpcClient({
  hostname: '88.88.88.88',
  port: 50051,
});

async function run() {
  const blcknumber = await client.getBlockByNumber(1234);
  const blck = await client.getNowBlock();
  const assets = await solidityClient.getAssetIssueList();
}

run();
```

You can check a public list of TRON nodes here: [Official_Public_Node.md](https://github.com/tronprotocol/Documentation/blob/master/TRX/Official_Public_Node.md)

## Full/Solidity Node REST Gateway

Find a full example of use below, It will build a full REST API of your node automatically: [tronix.js-gateway](https://github.com/deblanco/tronix.js-gateway)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Credits

* [Daniel Blanco](https://github.com/deblanco)
* [Santiago de los Santos](http://github.com/santiagodls)
* Special contributors
  * [AngelMQ](https://github.com/AngelQuirogaM) 
  * [Rovak](https://github.com/rovak) (Original project)


## License

LGPL-3.0
