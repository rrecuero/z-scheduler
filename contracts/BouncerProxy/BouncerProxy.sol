pragma solidity ^0.4.24;

/*
  Bouncer identity proxy that executes meta transactions for etherless accounts.

  Purpose:
  I wanted a way for etherless accounts to transact with the blockchain through an identity proxy without paying gas.
  I'm sure there are many examples of something like this already deployed that work a lot better, this is just me learning.
    (I would love feedback: https://twitter.com/austingriffith)

  1) An etherless account crafts a meta transaction and signs it
  2) A (properly incentivized) relay account submits the transaction to the BouncerProxy and pays the gas
  3) If the meta transaction is valid AND the etherless account is a valid 'Bouncer', the transaction is executed
      (and the sender is paid in arbitrary tokens from the signer)

  Inspired by:
    @avsa - https://www.youtube.com/watch?v=qF2lhJzngto found this later: https://github.com/status-im/contracts/blob/73-economic-abstraction/contracts/identity/IdentityGasRelay.sol
    @mattgcondon - https://twitter.com/mattgcondon/status/1022287545139449856 && https://twitter.com/mattgcondon/status/1021984009428107264
    @owocki - https://twitter.com/owocki/status/1021859962882908160
    @danfinlay - https://twitter.com/danfinlay/status/1022271384938983424
    @PhABCD - https://twitter.com/PhABCD/status/1021974772786319361
    gnosis-safe
    uport-identity

*/

//new use case: something very similar to the eth alarm clock dudes
// gitcoin wants to run a subscription like service and have all the trasacions
// run as meta trasactions so accounts don't have to worry about getting on at
// a certain time to push a tx through every month, week, day, hour, etc
// we'll use a minBlock requirement and have a nonce for each minBlock so
// other transactions can still come through normally with minBlock=0 but
// you also want to avoid replay attacks for specific minBlocks


//use case 1:
//you deploy the bouncer proxy and use it as a standard identity for your own etherless accounts
//  (multiple devices you don't want to store eth on or move private keys to will need to be added as Bouncers)
//you run your own relayer and the rewardToken is 0

//use case 2:
//you deploy the bouncer proxy and use it as a standard identity for your own etherless accounts
//  (multiple devices you don't want to store eth on or move private keys to will need to be added as Bouncers)
//  a community if relayers are incentivized by the rewardToken to pay the gas to run your transactions for you
//SEE: universal logins via @avsa

//use case 3:
//you deploy the bouncer proxy and use it to let third parties submit transactions as a standard identity
//  (multiple developer accounts will need to be added as Bouncers to 'whitelist' them to make meta transactions)
//you run your own relayer and pay for all of their transactions, revoking any bad actors if needed
//SEE: GitCoin (via @owocki) wants to pay for some of the initial transactions of their Developers to lower the barrier to entry

//use case 4:
//you deploy the bouncer proxy and use it to let third parties submit transactions as a standard identity
//  (multiple developer accounts will need to be added as Bouncers to 'whitelist' them to make meta transactions)
//you run your own relayer and pay for all of their transactions, revoking any bad actors if needed

import "contracts/SignatureBouncer/SignatureBouncer.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
contract BouncerProxy is SignatureBouncer, Ownable {
  constructor() public { }
  // copied from https://github.com/uport-project/uport-identity/blob/develop/contracts/Proxy.sol
  function () payable public { emit Received(msg.sender, msg.value); }

  event Received (address indexed sender, uint value);
  event Forwarded (address destination, uint value, bytes data);

  // original forward function copied from https://github.com/uport-project/uport-identity/blob/develop/contracts/Proxy.sol
  function forward(address destination, uint value, bytes data) onlyValidSignatureAndData public {
      require(executeCall(destination, value, data));
      emit Forwarded(destination, value, data);
  }

  // copied from https://github.com/uport-project/uport-identity/blob/develop/contracts/Proxy.sol
  // which was copied from GnosisSafe
  // https://github.com/gnosis/gnosis-safe-contracts/blob/master/contracts/GnosisSafe.sol
  function executeCall(address to, uint256 value, bytes data) internal returns (bool success) {
    assembly {
       success := call(gas, to, value, add(data, 0x20), mload(data), 0, 0)
    }
  }
}
