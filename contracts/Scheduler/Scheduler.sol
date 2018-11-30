pragma solidity ^0.4.24;

import "contracts/BouncerWithReward/BouncerWithReward.sol";
contract Scheduler is BouncerWithReward {
  modifier afterBlock(uint minBlock) {
    // if they specify a minimum block, make sure the current block is on or after the requirement
    require(block.number > minBlock, "Invalid Block");
    _;
  }
  function forward(address destination, uint value, bytes data,
    uint nonce, address rewardToken, uint rewardAmount, uint minBlock)
    onlyValidSignatureAndData
    withNonce(msg.sender, minBlock * 1000 + nonce)
    withReward(rewardToken, rewardAmount)
    afterBlock(minBlock)
    public
  {
      require(executeCall(destination, value, data));
      emit Forwarded(destination, value, data);
  }
}
