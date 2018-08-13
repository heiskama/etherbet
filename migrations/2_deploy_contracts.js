var BetList = artifacts.require("./BetList.sol");

module.exports = function(deployer) {
  deployer.deploy(BetList);
}
