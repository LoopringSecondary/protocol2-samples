const Web3 = require("web3"); // tslint:disable-line
const util = require("util");
const Tx = require('ethereumjs-tx');
const pjs = require("protocol2-js");
const BN = require("bn.js");
const contractAddresses = require("../deployedAddresses.json");

// abi of contract github.com/Loopring/protocol2/contracts/test/DummyToken.sol
// all ABI files used here can be found in github.com/Loopring/protocol2/ABI directory.
const dummyTokenABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_target","type":"address"},{"name":"_value","type":"uint256"}],"name":"addBalance","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_value","type":"uint256"}],"name":"burnFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_target","type":"address"},{"name":"_value","type":"uint256"}],"name":"setBalance","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint8"},{"name":"_totalSupply","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"burner","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]';

const submitterABI = '[{"constant":false,"inputs":[{"name":"data","type":"bytes"}],"name":"submitRings","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"FEE_PERCENTAGE_BASE","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_ringIndex","type":"uint256"},{"indexed":true,"name":"_ringHash","type":"bytes32"},{"indexed":true,"name":"_feeRecipient","type":"address"},{"indexed":false,"name":"_fills","type":"bytes"}],"name":"RingMined","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_ringHash","type":"bytes32"}],"name":"InvalidRing","type":"event"}]';

const orderCancellerABI = '[{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"token1","type":"address"},{"name":"token2","type":"address"},{"name":"cutoff","type":"uint256"}],"name":"cancelAllOrdersForTradingPairOfOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"cutoff","type":"uint256"}],"name":"cancelAllOrdersOfOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"orderHashes","type":"bytes"}],"name":"cancelOrders","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"cutoff","type":"uint256"}],"name":"cancelAllOrders","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token1","type":"address"},{"name":"token2","type":"address"},{"name":"cutoff","type":"uint256"}],"name":"cancelAllOrdersForTradingPair","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_broker","type":"address"},{"indexed":false,"name":"_orderHashes","type":"bytes32[]"}],"name":"OrdersCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_broker","type":"address"},{"indexed":false,"name":"_token1","type":"address"},{"indexed":false,"name":"_token2","type":"address"},{"indexed":false,"name":"_cutoff","type":"uint256"}],"name":"AllOrdersCancelledForTradingPair","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_broker","type":"address"},{"indexed":false,"name":"_cutoff","type":"uint256"}],"name":"AllOrdersCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_broker","type":"address"},{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_token1","type":"address"},{"indexed":false,"name":"_token2","type":"address"},{"indexed":false,"name":"_cutoff","type":"uint256"}],"name":"AllOrdersCancelledForTradingPairByBroker","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_broker","type":"address"},{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_cutoff","type":"uint256"}],"name":"AllOrdersCancelledByBroker","type":"event"}]';

const tradeDelegateABI = '[{"constant":false,"inputs":[],"name":"resume","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"authorizeAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isAddressAuthorized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"suspend","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"deauthorizeAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"batch","type":"bytes32[]"}],"name":"batchTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';

const tradeHistoryABI = '[{"constant":false,"inputs":[],"name":"resume","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"broker","type":"address"},{"name":"cutoff","type":"uint256"}],"name":"setCutoffs","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"filled","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"authorizeAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"filledInfo","type":"bytes32[]"}],"name":"batchUpdateFilled","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"broker","type":"address"},{"name":"owner","type":"address"},{"name":"cutoff","type":"uint256"}],"name":"setCutoffsOfOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"orderInfo","type":"bytes32[]"}],"name":"batchGetFilledAndCheckCancelled","outputs":[{"name":"fills","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"},{"name":"","type":"bytes20"}],"name":"tradingPairCutoffsOwner","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes20"}],"name":"tradingPairCutoffs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"broker","type":"address"},{"name":"tokenPair","type":"bytes20"},{"name":"cutoff","type":"uint256"}],"name":"setTradingPairCutoffs","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isAddressAuthorized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"broker","type":"address"},{"name":"orderHash","type":"bytes32"}],"name":"setCancelled","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"}],"name":"cancelled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"cutoffs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"suspend","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"broker","type":"address"},{"name":"owner","type":"address"},{"name":"tokenPair","type":"bytes20"},{"name":"cutoff","type":"uint256"}],"name":"setTradingPairCutoffsOfOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"deauthorizeAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"cutoffsOwner","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]';

const miner = "0xE20cF871f1646d8651ee9dC95AAB1d93160b3467";
const minerPrivateKey = "7c71142c72a019568cf848ac7b805d21f2e0fd8bc341e8314580de11c6a397bf";

// get web3 object by infura:
// change the api-key if you want to use yours
const infuraKov = "https://kovan.infura.io/v3/a06ed9c6b5424b61beafff27ecc3abf3";
const localUrl = "http://127.0.0.1:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));

/* NOTICE: All the loopring contract addresses and tokens
 * used in this file can be found in this file:
 * https://github.com/Loopring/protocol2/blob/master/deployment-kovan.md
 * when developing, I suggest you use ganache instead of kovan testnet:
 * git clone https://github.com/Loopring/protocol2
 * cd protocol2
 * npm run ganache
 * open a new terminal tab, run: npm run migrate
 * then, replace all the contract addresses below:
 */
/*  --- contracts on kovan network --- */
// const WETHAddress = "0xbb7147f582a1e23bec6570ffdcdd413a5788493a";
// const LrcAddress = "0x7cb592d18d0c49751ba5fce76c1aec5bdd8941fc";
// const GTOAddress = "0x159afefcda3d1acb6edcebabea8fa446e2ba1575";
// const RDNAddress = "0x7585e9bca0707ad405ab007b34b795d61ce0c778";
// const REPAddress = "0x308ffef25bc7aafa77c54e475d01850a6f210f7b";

// const brokerRegistryAddress = "0xd0ef9379c783e5783ba499ceba78734794b67e72";
// const orderRegistryAddress = "0x4ff214811f164dab1889c83b1fe2c8c27d3db615";
// const orderBookAddress = "0x7f9d7c8d69c13215fe9d460342996be35ca6f9aa";
// const tradeDelegateAddress = "0xca66ffaf17e4b600563f6af032456aa7b05a6975";
// const feeHolderAddress = "0xc577c2bea8446e2ef43b316d1c897865483af021";
// const tradeHistoryAddress = "0xc87d291c40c9f2754be26391878f715277c134b8";
// const burnRateTableAddress = "0x58b1544dabe649f4840edcaca675551eec3474d7";
// const ringSubmitterAddress = "0x9428ae80be4f5c3ff4578076263316aa79efbfc8";
// const orderCancellerAddress = "0xeea505f4eaf0d623f098d59746bd8d4e13561c86";
/*  --- contracts on kovan network end --- */

/*  --- contracts on ganache, will change every time you redeploy --- */
const WETHAddress = contractAddresses["WETHToken"];
const LrcAddress = contractAddresses["LRCToken"];
const GTOAddress = contractAddresses["GTOToken"];

const brokerRegistryAddress = contractAddresses["BrokerRegistry"];
const orderRegistryAddress = contractAddresses["OrderRegistry"];
const orderBookAddress = contractAddresses["OrderBook"];
const tradeDelegateAddress = contractAddresses["Delegate"];
const feeHolderAddress = contractAddresses["FeeHolder"];
const tradeHistoryAddress = contractAddresses["TradeHistory"];
const burnRateTableAddress = contractAddresses["BurnRateTable"];
const ringSubmitterAddress = contractAddresses["RingSubmitter"];
const orderCancellerAddress = contractAddresses["OrderCanceller"];
/*  --- contracts on ganache end --- */

async function sendTransaction(from, to, value, data, privKey) {
  const txCount = await web3.eth.getTransactionCount(from);
  console.log("from:", from, "txCount:", txCount);

  const txData = {
    nonce: web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(1000000),
    gasPrice: web3.utils.toHex(10e9),
    to: to,
    from: from,
    value: web3.utils.toHex(value),
    data: data,
  };

  sendSigned(txData, privKey, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
}

function sendSigned(txData, privKey, cb) {
  const privateKey = new Buffer(privKey, 'hex');
  const transaction = new Tx(txData);
  console.log("privKey:", privKey);
  transaction.sign(privateKey);
  const serializedTx = transaction.serialize().toString('hex');
  return web3.eth.sendSignedTransaction('0x' + serializedTx, cb);
}

async function getEventsFromContract(contract, eventName, fromBlock) {
  return await contract.getPastEvents(eventName, {
    fromBlock,
    toBlock: "latest",
  }).then((events) => {
    return events;
  });
}

async function watchAndPrintEvent(contract, eventName) {
  const events = await this.getEventsFromContract(contract, eventName, 0);

  events.forEach((e) => {
    console.log("event:", util.inspect(e.args, false, null));
  });
}

async function doAuthorize() {
  // RingSubmitter contract must be authorized by TradeDelegate and TradeHistory contract
  // OrderCanceller contract must be authorized by TradeHistory contract
  const TradeDelegate = new web3.eth.Contract(JSON.parse(tradeDelegateABI), tradeDelegateAddress);
  // authorization can only be done by contract owner, which is miner in our case:
  const authTxData1 = TradeDelegate.methods.authorizeAddress(ringSubmitterAddress).encodeABI();
  await sendTransaction(miner, tradeDelegateAddress, 0, authTxData1, minerPrivateKey);

  const TradeHistory = new web3.eth.Contract(JSON.parse(tradeHistoryABI), tradeHistoryAddress);
  const authTxData2 = TradeHistory.methods.authorizeAddress(ringSubmitterAddress).encodeABI();
  await sendTransaction(miner, tradeHistoryAddress, 0, authTxData2, minerPrivateKey);
  const authTxData3 = TradeHistory.methods.authorizeAddress(orderCancellerAddress).encodeABI();
  await sendTransaction(miner, tradeHistoryAddress, 0, authTxData3, minerPrivateKey);
}

function numberToHex(n) {
  return "0x" + n.toString(16);
}

async function test() {
  // you may create new account using webjs:
  // const order1Owner = web3.eth.accounts.create();
  // const order1OwnerPrivateKey = order1Owner.privateKey.substr(2);
  // here, we use account from ganache's account list.
  const order1Owner = "0x8ea825a5fd77fd4180da0bb0c14309925c991b58";
  const order1OwnerPrivateKey = "b6363ec295018ed93759777139049dbb098734843c311ebb9951c1e93feffcb4";

  const order2Owner = "0x201bba420af6cebdaa29b7aff1244447bab35074";
  const order2OwnerPrivateKey = "3c3cb9b2fcab41e588d5aa0066928f855f2cf09e5c817fc41350eae9cfe8dc36";

  // do authorize first. only need to do it once.
  // await doAuthorize();

  /* send some eth to order1Owner and order1Owner,
   * so they can approve token to loopring tradeDelegate:
   * 0.01 ETH should be enough
   */
  // await sendTransaction(miner, order1Owner, 0.01 * 1e18, "0x0", minerPrivateKey);
  // await sendTransaction(miner, order2Owner, 0.01 * 1e18, "0x0", minerPrivateKey);

  /*
   * we deployed some fake tokens on kovan testnet,
   * Any address can get these tokens by request the token contract's setBalance method:
   */

  const LrcToken = new web3.eth.Contract(JSON.parse(dummyTokenABI), LrcAddress);
  const WETHToken = new web3.eth.Contract(JSON.parse(dummyTokenABI), WETHAddress);

  // set LRC balance for order1Owner
  const setBalanceTxData1 = LrcToken.methods.setBalance(order1Owner, numberToHex(1e22)).encodeABI();
  await sendTransaction(order1Owner, LrcAddress, 0, setBalanceTxData1, order1OwnerPrivateKey);

  // set WETH balance for order2Owner
  const setBalanceTxData2 = WETHToken.methods.setBalance(order2Owner, numberToHex(10 * 1e18)).encodeABI();
  await sendTransaction(order2Owner, WETHAddress, 0, setBalanceTxData2, order2OwnerPrivateKey);
  // set LRC balance for order2Owner, so it can pay fee using lrc token.
  const setBalanceTxData3 = LrcToken.methods.setBalance(order2Owner, numberToHex(100 * 1e18)).encodeABI();
  await sendTransaction(order2Owner, LrcAddress, 0, setBalanceTxData3, order2OwnerPrivateKey);

  // do approval to loopring trade delegate:
  const approveTxData1 = LrcToken.methods.approve(tradeDelegateAddress, numberToHex(1e+22)).encodeABI();
  await sendTransaction(order1Owner, LrcAddress, 0, approveTxData1, order1OwnerPrivateKey);

  const approveTxData2 = LrcToken.methods.approve(tradeDelegateAddress, numberToHex(100 * 1e18)).encodeABI();
  await sendTransaction(order2Owner, LrcAddress, 0, approveTxData2, order2OwnerPrivateKey);
  const approveTxData3 = WETHToken.methods.approve(tradeDelegateAddress, numberToHex(10 * 1e18)).encodeABI();
  await sendTransaction(order2Owner, WETHAddress, 0, approveTxData3, order2OwnerPrivateKey);

  /* create orders:
   * order1: buy 1000 LRC, sell 1 WETH
   * order2: buy 1 WETH, sell 1000 LRC
   * @see https://github.com/Loopring/protocol2-js/blob/master/src/types.ts for orderInfo and ringsInfo type definitions.
   */
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

  // generate rings and sign:
  const context = new pjs.Context(0, 0, tradeDelegateAddress, tradeHistoryAddress, brokerRegistryAddress, orderRegistryAddress, feeHolderAddress, orderBookAddress, burnRateTableAddress, LrcAddress, 1000, 0);
  const ringsInfo = {
    transactionOrigin: miner,
    miner: miner,
    rings: [[0, 1]],
    orders: [order1, order2],
  };
  const ringsGenerator = new pjs.RingsGenerator(context);
  await ringsGenerator.setupRingsAsync(ringsInfo); // sign orders, and ringsInfo.

  // encode rings
  const bs = ringsGenerator.toSubmitableParam(ringsInfo);

  // submit rings:
  const submitter = new web3.eth.Contract(JSON.parse(submitterABI), ringSubmitterAddress);
  const txData = submitter.methods.simulateAndReport(web3.utils.hexToBytes(bs), {from: ringsInfo.transactionOrigin}).encodeABI();
  await sendTransaction(miner, ringSubmitterAddress, 0, txData);

  // parse event:
  watchAndPrintEvent(submitter, "RingMined");

}

test();
