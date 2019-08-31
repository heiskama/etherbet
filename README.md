# BetList

Solidity smart contract for peer-to-peer betting. Current features:

* Players can view bets
* Players can post and accept each other's bets
* The contract deployer acts as a referee who can resolve the bets
* The referee can terminate the contract. All remaining bets are cancelled and deposits returned.

## Tests

To run the tests:

1. Start Ganache on localhost:7545
2. Run `truffle test --network ganache`

## Test frontend

A test frontend is available at http://etherbet.one

## TODO

* Let the challenger cancel a bet if no one accepts it
* Referee can post bets willing to referee. Attached bets are resolved when the referee resolves the bet.
* Deploy contract to Rinkeby test net?
* ...

