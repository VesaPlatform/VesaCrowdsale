const VesaToken = artifacts.require("./VesaToken.sol");
const VesaStage2PreICO = artifacts.require("./VesaStage2PreICO.sol");
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545")) // Hardcoded development port




const timeTravel = function (time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], // 86400 is num seconds in day
      id: new Date().getTime()
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

const mineBlock = function () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine"
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

contract('VesaStage2PreICO', function(accounts) {

  var ownerAddress = accounts[0];
  var missingBeneficiaryAddress = accounts[5];
  var beneficiaryAddress = accounts[accounts.length-1];

  const price = 200000000000000;
  const bonusPrice = 164285714300000;
  const bonusPriceDeltaPerHour = 3571428573000;
  const startTime = 1520427600;
  const price_1_h = bonusPrice;
  const price_2_h = bonusPrice + 1 * bonusPriceDeltaPerHour;
  const price_3_h = bonusPrice + 2 * bonusPriceDeltaPerHour;
  const price_4_h = bonusPrice + 3 * bonusPriceDeltaPerHour;
  const price_5_h = bonusPrice + 4 * bonusPriceDeltaPerHour;
  const price_6_h = bonusPrice + 5 * bonusPriceDeltaPerHour;
  const price_7_h = bonusPrice + 6 * bonusPriceDeltaPerHour;
  const price_8_h = bonusPrice + 7 * bonusPriceDeltaPerHour;
  const price_9_h = bonusPrice + 8 * bonusPriceDeltaPerHour;
  const price_10_h = bonusPrice + 9 * bonusPriceDeltaPerHour;
  const price_11_h = price;


  it("owner is the first account", async function(){

    let currentTime = Math.floor(Date.now() / 1000);
    let leftTime = (startTime - currentTime);
    let diff = leftTime + 1;
    await timeTravel(diff);
    await mineBlock();

    let meta = await VesaStage2PreICO.deployed();
    let owner = await meta.owner.call();
    assert.equal(owner, ownerAddress, "owner isn't the first account");
  })

  it("beneficiary is the last account", async function(){
    let meta = await VesaStage2PreICO.deployed();
    let beneficiary = await meta.beneficiary.call();
    assert.notEqual(beneficiary, missingBeneficiaryAddress, "beneficiary is the last account");
    assert.equal(beneficiary, beneficiaryAddress, "beneficiary isn't the last account");
  })

  if("balance VesaToken owner should be 40000000", async function() {
        let tokenMeta = await VesaToken.deployed();
  })

  it("should put 20000000 VSA in the contract account", async function() {
    let tokenMeta = await VesaToken.deployed();
    let meta = await VesaStage2PreICO.deployed();
    let metaTokensBalance = await tokenMeta.balanceOf.call(meta.address);
    await tokenMeta.transfer(meta.address, web3.toWei("20000000", 'ether'));
    let currentContractTokenBalance = await tokenMeta.balanceOf.call(meta.address);
    assert.equal(web3.fromWei(currentContractTokenBalance.valueOf()), "20000000", "20000000 wasn't in the contract balance");
  })

  it("Hours passed: 1. The price should be " + web3.fromWei(price_1_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_1_h, "Price inccorect");
  });

  it("Hours passed: 2. The price should be " + web3.fromWei(price_2_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_2_h, "Price inccorect");
  });

  it("Hours passed: 3. The price should be " + web3.fromWei(price_3_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_3_h, "Price inccorect");
  });

  it("Hours passed: 4. The price should be " + web3.fromWei(price_4_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_4_h, "Price inccorect");
  });

  it("Hours passed: 5. The price should be " + web3.fromWei(price_5_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_5_h, "Price inccorect");
  });


  it("user wants to buy a tokens", async function() {
    let tokenMeta = await VesaToken.deployed();
    let meta = await VesaStage2PreICO.deployed();

    let currentContractTokenBalance = await tokenMeta.balanceOf.call(meta.address);

    let testAccount = accounts[7];
    let testAccountBalance = await web3.eth.getBalance(testAccount);
    let testAccountTokensBalance =  await tokenMeta.balanceOf.call(testAccount);

    let b = await tokenMeta.balanceOf.call(meta.address);

    assert.equal(testAccountTokensBalance.valueOf(), web3.toWei(0, 'ether'), 'wrong token balance');

    let transactionData = {
      from: testAccount,
      to: meta.address,
      value: web3.toWei(1, 'ether')
    };

    await web3.eth.sendTransaction(transactionData);

    testAccountBalance = await web3.eth.getBalance(testAccount);
    testAccountTokensBalance =  await tokenMeta.balanceOf.call(testAccount);
    assert.equal(web3.fromWei(testAccountTokensBalance.valueOf()), "5478.260869978071833679", 'wrong token balance');

  })

  it("try check goal reached and make sure that crowdsale is not closed", async function () {
    let meta = await VesaStage2PreICO.deployed();

    let status = await meta.checkGoalReached();
    let close = await meta.crowdsaleClosed.call();
    assert.isNotTrue(close, "crowssale closed");
  });


  it("Hours passed: 6. The price should be " + web3.fromWei(price_6_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_6_h, "Price inccorect");
  });

  it("Hours passed: 7. The price should be " + web3.fromWei(price_7_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_7_h, "Price inccorect");
  });

  it("user wants to buy a tokens", async function() {
    let tokenMeta = await VesaToken.deployed();
    let meta = await VesaStage2PreICO.deployed();

    let currentContractTokenBalance = await tokenMeta.balanceOf.call(meta.address);

    let testAccount = accounts[7];
    let testAccountBalance = await web3.eth.getBalance(testAccount);
    let testAccountTokensBalance =  await tokenMeta.balanceOf.call(testAccount);

    assert.equal(web3.toWei(testAccountTokensBalance.valueOf()), "0", 'wrong token balance');

    await web3.eth.sendTransaction({
      from: testAccount,
      to: meta.address,
      value: web3.toWei(10, 'ether')
    });

    testAccountBalance = await web3.eth.getBalance(testAccount);
    testAccountTokensBalance =  await tokenMeta.balanceOf.call(testAccount);
    assert.equal(web3.fromWei(testAccountTokensBalance.valueOf()), "10802.204532347323966221", 'wrong token balance');

  })

  it("try check goal reached and make sure that crowdsale is not closed", async function () {
    let meta = await VesaStage2PreICO.deployed();

    let status = await meta.checkGoalReached();
    let close = await meta.crowdsaleClosed.call();
    assert.isNotTrue(close, "crowssale closed");
  });

  it("Hours passed: 8. The price should be " + web3.fromWei(price_8_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_8_h, "Price inccorect");
  });

  it("Hours passed: 9. The price should be " + web3.fromWei(price_9_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_9_h, "Price inccorect");
  });

  it("Hours passed: 10. The price should be " + web3.fromWei(price_10_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_10_h, "Price inccorect");
  });

  it("Hours passed: 11. The price should be " + web3.fromWei(price_11_h), async function () {
    let meta = await VesaStage2PreICO.deployed();
    await timeTravel(3600) // 1 hour later
    await mineBlock()
    let value = await meta.getPrice.call();
    assert.equal(value.valueOf(), price_11_h, "Price inccorect");
  });


  it("2 eth bonus - 0%", async function () {
    let meta = await VesaStage2PreICO.deployed();
    let value = await meta.getBonus.call(web3.toWei(2, 'ether'));
    assert.equal(value.valueOf(), 0, "wrong bonus");
  });

  it("3 eth bonus - 35%", async function () {
    let meta = await VesaStage2PreICO.deployed();
    let value = await meta.getBonus.call(web3.toWei(3, 'ether'));
    assert.equal(value.valueOf(), 35, "wrong bonus");
  });

  it("11 eth bonus - 42%", async function () {
    let meta = await VesaStage2PreICO.deployed();
    let value = await meta.getBonus.call(web3.toWei(11, 'ether'));
    assert.equal(value.valueOf(), 42, "wrong bonus");
  });

  it("15 eth bonus - 47%", async function () {
    let meta = await VesaStage2PreICO.deployed();
    let value = await meta.getBonus.call(web3.toWei(15, 'ether'));
    assert.equal(value.valueOf(), 47, "wrong bonus");
  });


  it("40 eth bonus - 55%", async function () {
    let meta = await VesaStage2PreICO.deployed();
    let value = await meta.getBonus.call(web3.toWei(40, 'ether'));
    assert.equal(value.valueOf(), 55, "wrong bonus");
  });

  it("101 eth bonus - 65%", async function () {
    let meta = await VesaStage2PreICO.deployed();
    let value = await meta.getBonus.call(web3.toWei(101, 'ether'));
    assert.equal(value.valueOf(), 65, "wrong bonus");
  });

  it("286 eth bonus - 75%", async function () {
    let meta = await VesaStage2PreICO.deployed();
    let value = await meta.getBonus.call(web3.toWei(286, 'ether'));
    assert.equal(value.valueOf(), 75, "wrong bonus");
  });





  it("try check goal reached and make sure that crowdsale is closed", async function () {

    let meta = await VesaStage2PreICO.deployed();

    let days_31 = 86400 * 31;

    await timeTravel(days_31) // 31 days later
    await mineBlock()
    let status = await meta.checkGoalReached();
    let close = await meta.crowdsaleClosed.call();
    assert.isTrue(close, "crowdsale closed");
  });


  it("user can withdraw funds if the goal is not reached", async function() {
    let tokenMeta = await VesaToken.deployed();
    let meta = await VesaStage2PreICO.deployed();

    let status = await meta.checkGoalReached();
    let close = await meta.crowdsaleClosed.call();
    let fundingGoalReached = await meta.fundingGoalReached.call();
    //console.log(fundingGoalReached);
    //console.log(close);
    assert.isTrue(close, "crowdsale closed");

    let contractBalance = await web3.eth.getBalance(meta.address);
    //console.log(contractBalance.valueOf());

    let testAccount = accounts[7];
    let testAccountBalance = await web3.eth.getBalance(testAccount);
    //console.log(1,testAccountBalance.valueOf());

    await meta.safeWithdrawal({from: testAccount});

    testAccountBalance1 = await web3.eth.getBalance(testAccount);
    //console.log(2,testAccountBalance1.valueOf());

    // testAccountTokensBalance =  await tokenMeta.balanceOf.call(testAccount);
    // assert.equal(web3.fromWei(testAccountTokensBalance.valueOf()), "10802.204532347323966221", 'wrong token balance');
    // testAccountTokensBalance =  await tokenMeta.balanceOf.call(accounts[0]);
    // console.log(testAccountTokensBalance.valueOf());

  })

})