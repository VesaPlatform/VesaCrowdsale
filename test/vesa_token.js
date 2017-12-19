var VesaToken = artifacts.require("VesaToken");
var VesaPreICO = artifacts.require("VesaPreICO");

// contract("VesaPreICO", function(accounts) {
// 	var ownerAddress = accounts[0];
// 	var missingBeneficiaryAddress = accounts[5];
//  	var beneficiaryAddress = accounts[9];

//  	const bonusPriceDeltaPerHour = 28571428570000;
//  	const price_1_h = 1857142857000000;
//  	const price_2_h = 1857142857000000 + bonusPriceDeltaPerHour;

//  	it("owner is the first account", function() {
// 		return VesaPreICO.deployed().then(function(instance) {
// 			return instance.owner.call()
// 		}).then(function(owner){
// 			assert.equal(owner, ownerAddress, "owner isn't the first account");
// 		});
// 	});

// 	it("beneficiary is the last account", function() {
// 		return VesaPreICO.deployed().then(function(instance) {
// 			return instance.beneficiary.call()
// 		}).then(function(beneficiary){
// 			assert.notEqual(beneficiary, missingBeneficiaryAddress, "owner is the last account");
// 			assert.equal(beneficiary, beneficiaryAddress, "owner isn't the last account");

// 		});
// 	});

// 	it("1st hour price", function() {
// 		return VesaPreICO.deployed().then(function(instance) {
// 			return instance.getPrice.call();
// 		}).then(function(price){

// 			assert.equal(price.valueOf(), price_1_h, "1st hour price inccorect");

// 		});
// 	});

// 	it("2nd hour price", function() {
// 		return VesaPreICO.deployed().then(function(instance) {
// 			return instance.getPrice.call();
// 		}).then(function(price){
// 			assert.equal(price.valueOf(), price_2_h, "2nd hour price inccorect");

// 		});
// 	});

// });

// contract("VesaToken", function(accounts) {

// 	var owner = accounts[0];


// 	it("should put 40000000 VSA in the first account", function() {
// 		return VesaToken.deployed().then(function(instance){
// 			return instance.balanceOf.call(owner);
// 		}).then(function(balance){
// 			assert.equal(balance.valueOf(), '4e+25', "40000000 wasn't in the first account");
// 		})
// 	})

// });

// contract("VesaCrowdsale", function(accounts) {

// 	var owner = accounts[0];
// 	var missingBeneficiary = accounts[5];
// 	var beneficiary = accounts[9];

// 	var token;
// 	var crowdsale;

// 	it('token address', function() {
// 		return VesaToken.deployed().then(function(tokenInstance){
// 			token = tokenInstance;
// 			return tokenInstance;
// 		}).then(function() {
// 			VesaCrowdsale.deployed().then(function(crowdsaleInstance){
// 				crowdsale = crowdsaleInstance;
// 				return crowdsaleInstance;
// 			}).then(function () {
// 				return token.transfer(crowdsale.address, '20000000000000000000000000')
// 			}).then(function () {
// 				return token.balanceOf.call(owner);
// 			}).then(function(ownerBalance){
// 				assert.equal(ownerBalance.valueOf(), '2e+25', "20000000 wasn't in the first account")
// 			});
// 		});
// 	})




// });