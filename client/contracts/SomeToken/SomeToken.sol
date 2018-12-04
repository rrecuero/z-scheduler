pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract SomeToken is ERC20Mintable{

  string public name = "SomeToken";
  string public symbol = "ST";
  uint8 public decimals = 18;

  constructor() public { }

}
