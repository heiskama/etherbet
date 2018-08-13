// The contract to be tested (exception handling)
var BetList = artifacts.require("./BetList.sol");

// The test suite
contract("BetList", function(accounts) {
  var BetListInstance;
  var referee = accounts[0];
  var challenger = accounts[1];
  var accepter = accounts[2];
  var betName = "Bet 1";
  var betConditions = "Conditions for bet 1";
  var betPrice = 1;


  // Test for exception when no bet is available to be accepted
  it("should throw an exception if you try to accept a bet when there is no bet available yet", function(){
    return BetList.deployed().then(function(instance) {
      BetListInstance = instance;
      return BetListInstance.acceptBet(1, {
        from: accepter,
        value: web3.toWei(betPrice, "ether")
      });
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return BetListInstance.getNumberOfBets();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "Total number of bets must be 0");
    });
  });


  // Test for exception when the accepted bet does not exist
  it("should throw an exception if you try to accept a bet that does not exist", function(){
    return BetList.deployed().then(function(instance) {
      BetListInstance = instance;
      return BetListInstance.publishBet (betName, betConditions, web3.toWei(betPrice, "ether"), {from: challenger, value: web3.toWei(betPrice, "ether")});
    }).then(function(receipt) {
      return BetListInstance.acceptBet(2, {from: challenger, value: web3.toWei(betPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return BetListInstance.bets(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "bet id must be 1");
      assert.equal(data[1], challenger, "challenger must be " + challenger);
      assert.equal(data[2], 0x0, "accepter must be empty");
      assert.equal(data[3], betName, "bet name must be " + betName);
      assert.equal(data[4], betConditions, "bet conditions must be " + betConditions);
      assert.equal(data[5].toNumber(), web3.toWei(betPrice, "ether"), "bet price must be " + web3.toWei(betPrice, "ether"));
    });
  });


  // Test for exception when accepting a self published bet
  it("should throw an exception if you try to accept your own bet", function() {
    return BetList.deployed().then(function(instance) {
      BetListInstance = instace;
      return BetListInstance.acceptBet(1, {from: challenger, value: web3.toWei(betPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return BetListInstance.bets(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "bet id must be 1");
      assert.equal(data[1], challenger, "challenger must be " + challenger);
      assert.equal(data[2], 0x0, "accepter must be empty");
      assert.equal(data[3], betName, "bet name must be empty " + betName);
      assert.equal(data[4], betConditions, "bet conditions must be " + betConditions);
      assert.equal(data[5].toNumber(), web3.toWei(betPrice, "ether"), "bet price must be zero");
    });
  });


  // Test for exception when accepting a bet with incorrect value
  it("should throw an exception if you try to accept a bet for a value different from it's price", function() {
    return BetList.deployed().then(function(instance) {
      BetListInstance = instance;
      return BetListInstance.acceptBet(1, {from: accepter, value: web3.toWei(betPrice + 1, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return BetListInstance.bets(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "bet id must be 1");
      assert.equal(data[1], challenger, "challenger must be " + challenger);
      assert.equal(data[2], 0x0, "accepter must be empty");
      assert.equal(data[3], betName, "bet name must be empty " + betName);
      assert.equal(data[4], betConditions, "bet conditions must be " + betConditions);
      assert.equal(data[5].toNumber(), web3.toWei(betPrice, "ether"), "bet price must be zero");
    });
  });


  // Test for exception when accepting a bet which has already been accepted
  it("should throw an exception if you try to accept a bet that has already been accepted", function() {
    return BetList.deployed().then(function(instance) {
      BetListInstance = instance;
      return BetListInstance.acceptBet(1, {from: accepter, value: web3.toWei(betPrice, "ether")});
    }).then(function() {
      return BetListInstance.acceptBet(1, {from: web3.eth.accounts[0], value: web3.toWei(betPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return BetListInstance.bets(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "bet id must be 1");
      assert.equal(data[1], challenger, "challenger must be " + challenger);
      assert.equal(data[2], accepter, "accepter must be " + accepter);
      assert.equal(data[3], betName, "bet name must be empty " + betName);
      assert.equal(data[4], betConditions, "bet conditions must be " + betConditions);
      assert.equal(data[5].toNumber(), web3.toWei(betPrice, "ether"), "bet price must be " + web3.toWei(betPrice, "ether"));
    });
  });


  // Test for exception if a non-referee tries to resolve a bet
  it("should throw an exception if a non-referee tries to resolve a bet", function() {
    return BetList.deployed().then(function(instance) {
      BetListInstance = instance;
      return BetListInstance.resolveBet(1, true, {from: challenger});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return BetListInstance.bets(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "bet id must be 1");
      assert.equal(data[1], challenger, "challenger must be " + challenger);
      assert.equal(data[2], accepter, "accepter must be " + accepter);
      assert.equal(data[3], betName, "bet name must be empty " + betName);
      assert.equal(data[4], betConditions, "bet conditions must be " + betConditions);
      assert.equal(data[5].toNumber(), web3.toWei(betPrice, "ether"), "bet price must be " + web3.toWei(betPrice, "ether"));
    });
  });

});
