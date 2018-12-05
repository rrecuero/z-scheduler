pragma solidity ^0.4.24;

import "contracts/BouncerWithNonce/BouncerWithNonce.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
contract BouncerWithReward is BouncerWithNonce {

  modifier withReward(address rewardToken, uint rewardAmount) {
    _;
    //make sure the signer pays in whatever token (or ether) the sender and signer agreed to
    // or skip this if the sender is incentivized in other ways and there is no need for a token
    //to meet @avsa's example, 0 means ether and 0 rewardAmount means free metatx
    if(rewardToken == address(0)){
      if(rewardAmount > 0){
        //REWARD ETHER
        require(msg.sender.call.value(rewardAmount).gas(36000)());
      }
    }else{
      //REWARD TOKEN
      require((IERC20(rewardToken)).transfer(msg.sender,rewardAmount));
    }
  }
  function forward(address destination, uint value, bytes data, uint nonce, address rewardToken, uint rewardAmount) onlyValidSignatureAndData withNonce(destination, nonce) withReward(rewardToken, rewardAmount) public {
      require(executeCall(destination, value, data));
      emit Forwarded(destination, value, data);
  }
}
