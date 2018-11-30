pragma solidity ^0.4.24;

import "contracts/BouncerWithReward/BouncerWithReward.sol";
contract Scheduler is BouncerWithReward {
  modifier afterBlock(uint minBlock) {
    //if they specify a minimum block, make sure the current block is on or after the requirement
    //eventually typedef the minblock to a uint64... no need to be 256bits
    //this min block could have a second use... uPort reported nonces getting weird when a bunch of transactions fire at once
    // well if you are about to do ten transactions, you could use the minblock as almost like a namespace
    // use the minBlock=1 nonce for one transactions and minBlock=2 for another... then they could be run
    // in either order but only once  eh? eh? maybe... idk...
    require(block.number > minBlock, "Invalid Block");
    _;
  }
  function forward(address destination, uint value, bytes data,
    uint nonce, address rewardToken, uint rewardAmount, uint minBlock)
    onlyValidSignatureAndData
    withNonce(msg.sender, nonce)
    withReward(rewardToken, rewardAmount)
    afterBlock(minBlock)
    public
  {
      require(executeCall(destination, value, data));
      emit Forwarded(destination, value, data);
  }
}
