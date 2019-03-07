# protocol2-samples

## Install and run:
* `npm install`
* `node src/test.js`

## Dependencies:
* web3
* protocol2-js@0.4.7

## Loopring protocol:
* https://github.com/Loopring/protocol2

## Setup:
* Deploy loopring protocol2 to an ethereum testnet or private net. The protocol was already deployed to Kovan:
  https://github.com/Loopring/protocol2/blob/master/deployment-kovan.md
  
* While developing, use a local testnet using ganache:
  * `git clone https://github.com/Loopring/protocol2`
  * `cd protocol2`
  * `npm install`
  * `npm run ganache`
  * Open another terminal window, and run: `npm run migrate`. This will deploy the loopring protocol in the ganache node and will create a file called `deployedAddresses.json`.
  * Copy `deployedAddresses.json` to your project, you will need to use it later.

## Code snippits

All sample code below is in `src/test.js`.

### Create orders and rings:

For all type definitions (orders, rings,...) see https://github.com/Loopring/protocol2-js/blob/master/src/types.ts

~~~
   const order1 = {
     tokenS: "WETH",
     tokenB: "LRC",
     amountS: 1e18,
     amountB: 1000e18,
     feeToken: LrcAddress,
     feeAmount: 2e18,
   };
   
  const order2 = {
    tokenS: "LRC",
    tokenB: "WETH",
    amountS: 1000e18,
    amountB: 1e18,
    feeToken: LrcAddress,
    feeAmount: 3e18,
  };

  const ringsInfo = {
    transactionOrigin: miner,
    miner: miner,
    rings: [[0, 1]],
    orders: [order1, order2],
  };
  const ringsGenerator = new pjs.RingsGenerator(context);
  await ringsGenerator.setupRingsAsync(ringsInfo); // sign orders, and ringsInfo.
   
~~~

### Encode ring data:
~~~
  const bs = ringsGenerator.toSubmitableParam(ringsInfo);
~~~

### Submit rings:
~~~
  const submitter = new web3.eth.Contract(JSON.parse(submitterABI), ringSubmitterAddress);
  const txData = submitter.methods.simulateAndReport(web3.utils.hexToBytes(bs), {from: ringsInfo.transactionOrigin}).encodeABI();  
  await sendTransaction(miner, ringSubmitterAddress, 0, txData);
~~~

### Parse events
~~~
  watchAndPrintEvent(submitter, "RingMined");
~~~

## About Loopring protocol

If you want to know more about how loopring protocol2 works, run the unit tests in [loopring protocol2](https://github.com/Loopring/protocol2) project:
* `clone protocol2`
* `npm install`
* `npm run ganache`
* `npm run compile`
* `npm run transpile`
* `npm run test -- transpiled/test/testSubmitRingsSimple.js -x  // run single test.`
