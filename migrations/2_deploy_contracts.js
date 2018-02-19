const VesaToken = artifacts.require("VesaToken");
const VesaPreICO = artifacts.require("VesaPreICO");
const VesaStage2PreICO = artifacts.require("VesaStage2PreICO");


module.exports = function(deployer, network, accounts) {

	var beneficiary = accounts[accounts.length - 1];

	deployer.deploy(VesaToken).then(function(){
		// return deployer.deploy(VesaPreICO, VesaToken.address, beneficiary);
		return deployer.deploy(VesaStage2PreICO, VesaToken.address, beneficiary);
	});
};