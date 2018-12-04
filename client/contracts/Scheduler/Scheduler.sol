pragma solidity ^0.4.24;

import "contracts/BouncerWithReward/BouncerWithReward.sol";
contract Scheduler is BouncerWithReward {
  modifier afterBlock(uint minBlock) {
    // if they specify a minimum block, make sure the current block is on or after the requirement
    require(block.number > minBlock, "Invalid Block");
    _;
  }
  function schedule(address destination, uint value, bytes data,
    uint nonce, address rewardToken, uint rewardAmount, uint minBlock)
    afterBlock(minBlock)
    public
  {
      forward(destination, value, data, nonce, rewardToken, rewardAmount);
  }
}
