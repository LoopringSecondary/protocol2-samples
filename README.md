# protocol2-samples

## prepare:
* first, we need to deploy loopring protocol2 contracts to an ethereum testnet or private net.
  if you use kovan, we had already done the deployment for you, please refer to: 
  https://github.com/Loopring/protocol2/blob/master/deployment-kovan.md for detailed information.
  
* In period of development, I suggest you use ganache instead of kovan, so you can test your code much
  more faster. Follow the steps below:
  * git clone https://github.com/Loopring/protocol2
  * cd protocol2
  * npm install
  * npm run ganache
  * open another terminal window, and run: npm run migrate  // this conmmand will deploy all the loopring protocol contract in the ganache node.
  * you will get a file named deployedAddresses.json under the protocol2 folder.
  * copy the deployedAddresses.json file to your project. you will need to use it later.

## all sample code below is in src/test.js.

## create orders and rings:
* see https://github.com/Loopring/protocol2-js/blob/master/src/types.ts for orderInfo and ringsInfo type definitions.
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

## encode params:
~~~
  const bs = ringsGenerator.toSubmitableParam(ringsInfo);
~~~

## submit rings:
~~~
  const submitter = new web3.eth.Contract(JSON.parse(submitterABI), ringSubmitterAddress);
  const txData = submitter.methods.simulateAndReport(web3.utils.hexToBytes(bs), {from: ringsInfo.transactionOrigin}).encodeABI();  
  await sendTransaction(miner, ringSubmitterAddress, 0, txData);
~~~

## parse event
~~~
  watchAndPrintEvent(submitter, "RingMined");
~~~

