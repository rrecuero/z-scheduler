pragma solidity ^0.4.24;

contract BouncerWithNonceTracking is SignatureBouncer {
  mapping(address => uint256) internal nonces;

  modifier withNonce(address _actor, uint256 _nonce) {
    require(_nonce > nonces[_actor], "INVALID_NONCE");
    _;
    nonces[_actor] = _nonce;
  }
}
