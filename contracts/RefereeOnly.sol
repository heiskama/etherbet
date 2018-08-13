pragma solidity ^0.4.24;

contract RefereeOnly {

  address referee;

  modifier refereeOnly() {
    require(msg.sender == referee);
    _;
  }

  constructor() public {
    referee = msg.sender;
  }
}
