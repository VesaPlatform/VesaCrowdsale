var VesaToken = artifacts.require("VesaToken");
var VesaCrowdsale = artifacts.require("VesaCrowdsale");


contract("VesaToken", function(accounts) {

	var owner = accounts[0];


	it("should put 40000000 VSA in the first account", function() {
		return VesaToken.deployed().then(function(instance){
			return instance.balanceOf.call(owner);
		}).then(function(balance){
			assert.equal(balance.valueOf(), '4e+25', "40000000 wasn't in the first account");
		})
	})

});

contract("VesaCrowdsale", function(accounts) {

	var owner = accounts[0];
	var missingBeneficiary = accounts[5];
	var beneficiary = accounts[9];

	var token;
	var crowdsale;

	it('token address', function() {
		return VesaToken.deployed().then(function(tokenInstance){
			token = tokenInstance;
			return tokenInstance;
		}).then(function() {
			VesaCrowdsale.deployed().then(function(crowdsaleInstance){
				crowdsale = crowdsaleInstance;
				return crowdsaleInstance;
			}).then(function () {
				return token.transfer(crowdsale.address, '20000000000000000000000000')
			}).then(function () {
				return token.balanceOf.call(owner);
			}).then(function(ownerBalance){
				assert.equal(ownerBalance.valueOf(), '2e+25', "20000000 wasn't in the first account")
			});
		});
	})


	it("owner is the first account", function() {
		return VesaCrowdsale.deployed().then(function(instance) {
			return instance.owner.call()
		}).then(function(tokenOwner){
			assert.equal(tokenOwner, owner, "owner isn't the first account");
		});
	});

	it("beneficiary is the last account", function() {
		return VesaCrowdsale.deployed().then(function(instance) {
			return instance.beneficiary.call()
		}).then(function(crowdsaleBeneficiare){
			assert.notEqual(crowdsaleBeneficiare, missingBeneficiary, "owner is the last account");
			assert.equal(crowdsaleBeneficiare, beneficiary, "owner isn't the last account");

		});
	});

});