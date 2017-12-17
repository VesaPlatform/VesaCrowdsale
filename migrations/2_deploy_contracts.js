const VesaToken = artifacts.require("./VesaToken");
const VesaCrowdsale = artifacts.require("./VesaCrowdsale");


module.exports = function(deployer, network, accounts) {

	var beneficiary = accounts[accounts.length - 1];

	deployer.deploy(VesaToken).then(function(){
		return deployer.deploy(VesaCrowdsale, VesaToken.address, beneficiary);
	});

    // const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1;// one second in the future
    // const endTime = startTime + (86400 * 20); // 20 days
    // const rate = new web3.BigNumber(1000);
    // const wallet = accounts[0];

    // deployer.deploy(VesaTokenCrowdsale, startTime, endTime, rate, wallet);
};