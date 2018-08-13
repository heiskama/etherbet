// The contract to be tested (normal flow)
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
  var betName2 = "Bet 2";
  var betConditions2 = "Conditions for bet 2";
  var betPrice2 = 2;
  var challengerBalanceBeforePublish, challengerBalanceAfterPublish;
  var accepterBalanceBeforeAccept, accepterBalanceAfterAccept;
  var challengerBalanceBeforeResolve, challengerBalanceAfterResolve;
  var accepterBalanceBeforeResolve, accepterBalanceAfterResolve;


  it("Should be initialized with empty values", function() {
    return BetList.deployed().then(function(instance) {
      BetListInstance = instance;
      return BetListInstance.getNumberOfBets();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "total number of bets must be zero");
      return BetListInstance.getAvailableBets();
    }).then(function(data) {
      assert.equal(data.length, 0, "there shouldn't by any bets available");
    });
  });


  // Publish a bet
  it("should publish a bet", function() {
    return BetList.deployed().then(function(instance) {
      BetListInstance = instance;
      challengerBalanceBeforePublish = web3.fromWei(web3.eth.getBalance(challenger), "ether").toNumber();
      return BetListInstance.publishBet(
        betName,
        betConditions,
        web3.toWei(betPrice, "ether"),
        {from: challenger, value: web3.toWei(betPrice, "ether")}
      );
    }).then(function(receipt) {
      // Check the event
      assert.equal(receipt.logs.length, 1, "One event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogPublishBet", "event should be LogPublishBet");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._challenger, challenger, "event challenger must be " + challenger);
      assert.equal(receipt.logs[0].args._name, betName, "event bet name must be " + betName);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(betPrice, "ether"), "event bet price must be " + web3.toWei(betPrice, "ether"));

      // Check the effect of publish on balance of challenger, accounting for gas
      challengerBalanceAfterPublish = web3.fromWei(web3.eth.getBalance(challenger), "ether").toNumber();
      assert(challengerBalanceAfterPublish <= challengerBalanceBeforePublish - betPrice, "challenger should have spent at least " + betPrice + " ETH");

      return BetListInstance.getNumberOfBets();
    }).then(function(data) {
      assert.equal(data, 1, "number of bets must be 1");
      return BetListInstance.getAvailableBets();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one bet available");
      assert.equal(data[0].toNumber(), 1, "bet id must be 1");
      return BetListInstance.bets(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "bet id must be 1");
      assert.equal(data[1], challenger, "challenger must be " + challenger);
      assert.equal(data[2], 0x0, "accepter must be empty");
      assert.equal(data[3], betName, "bet name must be " + betName);
      assert.equal(data[4], betConditions, "bet conditions must be " + betConditions);
      assert.equal(data[5].toNumber(), web3.toWei(betPrice, "ether"), "bet price must be " + web3.toWei(betPrice, "ether"));
    });
  });


  // Publish a second bet
  it("should publish a second bet", function() {
    return BetList.deployed().then(function(instance) {
      BetListInstance = instance;
      challengerBalanceBeforePublish = web3.fromWei(web3.eth.getBalance(challenger), "ether").toNumber();
      return BetListInstance.publishBet(
        betName2,
        betConditions2,
        web3.toWei(betPrice2, "ether"),
        {from: challenger, value: web3.toWei(betPrice2, "ether")}
      );
    }).then(function(receipt) {
      // Check the event
      assert.equal(receipt.logs.length, 1, "One event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogPublishBet", "event should be LogPublishBet");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._challenger, challenger, "event challenger must be " + challenger);
      assert.equal(receipt.logs[0].args._name, betName2, "event bet name must be " + betName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(betPrice2, "ether"), "event bet price must be " + web3.toWei(betPrice2, "ether"));

      // Check the effect of publish on balance of challenger, accounting for gas
      challengerBalanceAfterPublish = web3.fromWei(web3.eth.getBalance(challenger), "ether").toNumber();
      assert(challengerBalanceAfterPublish <= challengerBalanceBeforePublish - betPrice, "challenger should have spent at least " + betPrice + " ETH");

      return BetListInstance.getNumberOfBets();
    }).then(function(data) {
      assert.equal(data, 2, "total number of bets must be 2");
      return BetListInstance.getAvailableBets();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two bets available");
      assert.equal(data[1].toNumber(), 2, "bet id must be 2");
      return BetListInstance.bets(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "bet id must be 2");
      assert.equal(data[1], challenger, "challenger must be " + challenger);
      assert.equal(data[2], 0x0, "accepter must be empty");
      assert.equal(data[3], betName2, "bet name must be " + betName2);
      assert.equal(data[4], betConditions2, "bet conditions must be " + betConditions2);
      assert.equal(data[5].toNumber(), web3.toWei(betPrice2, "ether"), "bet price must be " + web3.toWei(betPrice2, "ether"));
    });
  });


  // Accept the first bet
  it("should accept the first bet", function() {
    return BetList.deployed().then(function(instance) {
        BetListInstance = instance;
        accepterBalanceBeforeAccept = web3.fromWei(web3.eth.getBalance(accepter), "ether").toNumber();
        return BetListInstance.acceptBet(1, {
          from: accepter,
          value: web3.toWei(betPrice, "ether")
        });
      }).then(function(receipt) {
        // Check the event
        assert.equal(receipt.logs.length, 1, "One event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogAcceptBet", "event should be LogAcceptBet");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "bet id must be 1");
        assert.equal(receipt.logs[0].args._challenger, challenger, "event challenger must be " + challenger);
        assert.equal(receipt.logs[0].args._accepter, accepter, "event accepter must be " + accepter);
        assert.equal(receipt.logs[0].args._name, betName, "event bet name must be " + betName);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(betPrice, "ether"), "event bet price must be " + web3.toWei(betPrice, "ether"));

        // Check the effect of accept on balance of accepter, accounting for gas
        accepterBalanceAfterAccept = web3.fromWei(web3.eth.getBalance(accepter), "ether").toNumber();
        assert(accepterBalanceAfterAccept <= accepterBalanceBeforeAccept - betPrice, "accepter should have spent at least " + betPrice + " ETH");

        return BetListInstance.getAvailableBets();
      }).then(function(data) {
        assert.equal(data.length, 1, "there should now be only one bet available");
        assert.equal(data[0].toNumber(), 2, "bet 2 should be the only bet available");
        return BetListInstance.getNumberOfBets();
      }).then(function(data) {
        assert.equal(data.toNumber(), 2, "there should still be two bets in total");
      });
  });


  // Accept the second bet
  it("should accept the second bet", function() {
    return BetList.deployed().then(function(instance) {
        BetListInstance = instance;
        accepterBalanceBeforeAccept = web3.fromWei(web3.eth.getBalance(accepter), "ether").toNumber();
        return BetListInstance.acceptBet(2, {
          from: accepter,
          value: web3.toWei(betPrice2, "ether")
        });
      }).then(function(receipt) {
        // Check the event
        assert.equal(receipt.logs.length, 1, "One event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogAcceptBet", "event should be LogAcceptBet");
        assert.equal(receipt.logs[0].args._id.toNumber(), 2, "bet id must be 2");
        assert.equal(receipt.logs[0].args._challenger, challenger, "event challenger must be " + challenger);
        assert.equal(receipt.logs[0].args._accepter, accepter, "event accepter must be " + accepter);
        assert.equal(receipt.logs[0].args._name, betName2, "event bet name must be " + betName2);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(betPrice2, "ether"), "event bet price must be " + web3.toWei(betPrice2, "ether"));

        // Check the effect of accept on balance of accepter, accounting for gas
        accepterBalanceAfterAccept = web3.fromWei(web3.eth.getBalance(accepter), "ether").toNumber();
        assert(accepterBalanceAfterAccept <= accepterBalanceBeforeAccept - betPrice2, "accepter should have spent at least " + betPrice2 + " ETH");

        return BetListInstance.getAvailableBets();
      }).then(function(data) {
        assert.equal(data.length, 0, "there should now be no bets available");
        return BetListInstance.getNumberOfBets();
      }).then(function(data) {
        assert.equal(data.toNumber(), 2, "there should still be two bets in total");
      });
  });


  // Resolve the first bet
  it("should resolve the first bet", function() {
    return BetList.deployed().then(function(instance) {
        BetListInstance = instance;
        challengerBalanceBeforeResolve = web3.fromWei(web3.eth.getBalance(challenger), "ether").toNumber();
        return BetListInstance.resolveBet(1, true, { // challenger wins
          from: referee
        });
      }).then(function(receipt) {
        // Check the event
        assert.equal(receipt.logs.length, 1, "One event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogResolveBet", "event should be LogResolveBet");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "bet id must be 1");
        assert.equal(receipt.logs[0].args._challenger, challenger, "event challenger must be " + challenger);
        assert.equal(receipt.logs[0].args._accepter, accepter, "event accepter must be " + accepter);
        assert.equal(receipt.logs[0].args._name, betName, "event bet name must be " + betName);
        assert.equal(receipt.logs[0].args._payout.toNumber(), web3.toWei(betPrice*2, "ether"), "event bet payout must be " + web3.toWei(betPrice*2, "ether"));

        // Check the effect of resolve on balance of challenger, accounting for gas
        challengerBalanceAfterResolve = web3.fromWei(web3.eth.getBalance(challenger), "ether").toNumber();
        assert(challengerBalanceAfterResolve == challengerBalanceBeforeResolve + (betPrice * 2), "challenger should have gained " + (betPrice * 2) + " ETH");

        return BetListInstance.getAvailableBets();
      }).then(function(data) {
        assert.equal(data.length, 0, "there should now be no bets available");
        return BetListInstance.getNumberOfBets();
      }).then(function(data) {
        assert.equal(data.toNumber(), 2, "there should still be two bets in total");
      });
  });


  // Resolve the second bet
  it("should resolve the second bet", function() {
    return BetList.deployed().then(function(instance) {
        BetListInstance = instance;
        accepterBalanceBeforeResolve = web3.fromWei(web3.eth.getBalance(accepter), "ether").toNumber();
        return BetListInstance.resolveBet(2, false, { // accepter wins
          from: referee
        });
      }).then(function(receipt) {
        // Check the event
        assert.equal(receipt.logs.length, 1, "One event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogResolveBet", "event should be LogResolveBet");
        assert.equal(receipt.logs[0].args._id.toNumber(), 2, "bet id must be 2");
        assert.equal(receipt.logs[0].args._challenger, challenger, "event challenger must be " + challenger);
        assert.equal(receipt.logs[0].args._accepter, accepter, "event accepter must be " + accepter);
        assert.equal(receipt.logs[0].args._name, betName2, "event bet name must be " + betName2);
        assert.equal(receipt.logs[0].args._payout.toNumber(), web3.toWei(betPrice2*2, "ether"), "event bet payout must be " + web3.toWei(betPrice2*2, "ether"));

        // Check the effect of resolve on balance of accepter, accounting for gas
        accepterBalanceAfterResolve = web3.fromWei(web3.eth.getBalance(accepter), "ether").toNumber();
        assert(accepterBalanceAfterResolve == accepterBalanceBeforeResolve + (betPrice2 * 2), "accepter should have gained " + (betPrice2 * 2) + " ETH");

        return BetListInstance.getAvailableBets();
      }).then(function(data) {
        assert.equal(data.length, 0, "there should now be no bets available");
        return BetListInstance.getNumberOfBets();
      }).then(function(data) {
        assert.equal(data.toNumber(), 2, "there should still be two bets in total");
      });
  });

});
