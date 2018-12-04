pragma solidity ^0.4.24;

import "contracts/BouncerProxy/BouncerProxy.sol";
contract BouncerWithNonce is BouncerProxy {
  mapping(address => uint256) internal nonces;

  modifier withNonce(address _actor, uint256 _nonce) {
    require(_nonce > nonces[_actor], "INVALID_NONCE");
    _;
    nonces[_actor] = _nonce;
  }

  function forward(address destination, uint value, bytes data, uint nonce) onlyValidSignatureAndData withNonce(msg.sender, nonce) public {
      require(executeCall(destination, value, data));
      emit Forwarded(destination, value, data);
  }
}
