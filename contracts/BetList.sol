pragma solidity ^0.4.24;

import './RefereeOnly.sol';

contract BetList is RefereeOnly {

  struct Bet {
    uint id;
    address challenger;
    address accepter;
    string name;
    string conditions;
    uint256 price;
  }

  mapping (uint => Bet) public bets;
  uint betCounter;


  event LogPublishBet(
    uint indexed _id,
    address indexed _challenger,
    string _name,
    uint256 _price
  );

  event LogAcceptBet(
    uint indexed _id,
    address indexed _challenger,
    address indexed _accepter,
    string _name,
    uint256 _price
  );

  event LogResolveBet(
    uint indexed _id,
    address indexed _challenger,
    address indexed _accepter,
    string _name,
    uint256 _payout
  );


  // Publish a new bet
  function publishBet(string _name, string _conditions, uint256 _price) payable public {
    // The challenger must deposit his bet
    require(_price > 0 && msg.value == _price);

    // A new bet
    betCounter++;

    // Store this bet into the contract
    bets[betCounter] = Bet(
      betCounter,
      msg.sender,
      0x0,
      _name,
      _conditions,
      _price
    );

    // Trigger a log event
    emit LogPublishBet(betCounter, msg.sender, _name, _price);
  }


  // Fetch the total number of bets in the contract
  function getNumberOfBets() public view returns (uint) {
    return betCounter;
  }


  // Fetch and return all bet IDs for bets that are still available
  function getAvailableBets() public view returns (uint[]) {
    uint[] memory betIds = new uint[](betCounter);
    uint numberOfAvailableBets = 0;

    // Iterate over all bets
    for(uint i = 1; i <= betCounter; i++) {
      // Keep the ID if the bet is still available
      if(bets[i].accepter == 0x0) {
        betIds[numberOfAvailableBets] = bets[i].id;
        numberOfAvailableBets++;
      }
    }

    uint[] memory availableBets = new uint[](numberOfAvailableBets);

    // Copy the betIds array into a smaller availableBets array to get rid of empty indexes
    for(uint j = 0; j < numberOfAvailableBets; j++) {
      availableBets[j] = betIds[j];
    }

    return availableBets;
  }


  // Accept a bet
  function acceptBet(uint _id) payable public {
    // Check whether there is a bet published
    require(betCounter > 0);

    // Check that the bet exists
    require(_id > 0 && _id <= betCounter);

    // Retrieve the bet
    Bet storage bet = bets[_id];

    // Check that the bet has not been accepted yet
    require(bet.accepter == 0x0);

    // Don't allow the challenger to accept his own bet
    require(msg.sender != bet.challenger);

    // The accepter must deposit his bet
    require(msg.value == bet.price);

    bet.accepter = msg.sender;

    // Trigger a log event
    emit LogAcceptBet(_id, bet.challenger, bet.accepter, bet.name, bet.price);

  }


  // Only the referee can resolve bets
  function resolveBet(uint _id, bool challengerWins) refereeOnly public {
    // Retrieve the bet
    Bet storage bet = bets[_id];

    // The bet must not be open
    require(bet.accepter != 0x0);

    // The bet must not have been paid out yet
    require(bet.price > 0);

    // Execute payout
    if (challengerWins) { // challenger wins
      bet.challenger.transfer(bet.price * 2);
    } else { // accepter wins
      bet.accepter.transfer(bet.price * 2);
    }

    // Set the bet status as paid out (price = 0)
    uint256 payout = bet.price * 2;
    bet.price = 0;

    // Trigger a log event
    emit LogResolveBet(_id, bet.challenger, bet.accepter, bet.name, payout);
  }


  // Only the referee can terminate this contract
  function terminate() refereeOnly public {

    // Cancel all open bets and return the deposits
    for(uint i = 1; i <= betCounter; i++) {
      if(bets[i].price > 0) { // The bet has not yet been paid out
        if(bets[i].accepter == 0x0) { // The bet has only a challenger. Return ether to him.
          bets[i].challenger.transfer(bets[i].price);
        } else {
          // bet has both a challenger and an accepter, but is not yet resolved. Cancel the bet and return deposits to both.
          bets[i].challenger.transfer(bets[i].price);
          bets[i].accepter.transfer(bets[i].price);
        }
      }
    }

    selfdestruct(referee);
  }

}
