pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/access/roles/SignerRole.sol";

/**
 * @title SignatureBouncer
 * @author PhABC, Shrugs and aflesher
 * @dev SignatureBouncer allows users to submit a signature as a permission to
 * do an action.
 * If the signature is from one of the authorized signer addresses, the
 * signature is valid.
 * Note that SignatureBouncer offers no protection against replay attacks, users
 * must add this themselves!
 *
 * Signer addresses can be individual servers signing grants or different
 * users within a decentralized club that have permission to invite other
 * members. This technique is useful for whitelists and airdrops; instead of
 * putting all valid addresses on-chain, simply sign a grant of the form
 * keccak256(abi.encodePacked(`:contractAddress` + `:granteeAddress`)) using a
 * valid signer address.
 * Then restrict access to your crowdsale/whitelist/airdrop using the
 * `onlyValidSignature` modifier (or implement your own using _isValidSignature).
 * In addition to `onlyValidSignature`, `onlyValidSignatureAndMethod` and
 * `onlyValidSignatureAndData` can be used to restrict access to only a given
 * method or a given method with given parameters respectively.
 * See the tests in SignatureBouncer.test.js for specific usage examples.
 *
 * @notice A method that uses the `onlyValidSignatureAndData` modifier must make
 * the _signature parameter the "last" parameter. You cannot sign a message that
 * has its own signature in it so the last 128 bytes of msg.data (which
 * represents the length of the _signature data and the _signaature data itself)
 * is ignored when validating. Also non fixed sized parameters make constructing
 * the data in the signature much more complex.
 * See https://ethereum.stackexchange.com/a/50616 for more details.
 */

contract SignatureBouncer is SignerRole {
    using ECDSA for bytes32;

    // Function selectors are 4 bytes long, as documented in
    // https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector
    uint256 private constant _METHOD_ID_SIZE = 4;
    // Signature size is 65 bytes (tightly packed v + r + s)
    uint256 private constant _SIGNATURE_SIZE = 65;
    // Signer size is 20 bytes
    uint256 private constant _SIGNER_SIZE = 20;

    event AccountRetrieved (address indexed sender, bytes signature);
    /**
     * @dev requires that a valid signature with a specifed method and params of a signer was provided
     */
    modifier onlyValidSignatureAndData() {
        bytes memory signature = new bytes(_SIGNATURE_SIZE);
        for (uint j = 0; j < signature.length; j++) {
          signature[j] = msg.data[j + msg.data.length - _SIGNATURE_SIZE - _SIGNER_SIZE];
        }
        bytes memory signer = new bytes(_SIGNER_SIZE);
        for (uint i = 0; i < signer.length; i++) {
          signer[i] = msg.data[i + msg.data.length - _SIGNER_SIZE];
        }
        emit AccountRetrieved(bytesToAddress(signer), signature);
        require(isValidSignatureAndData(bytesToAddress(signer), signature));
        _;
    }

    function bytesToAddress(bytes bys) private pure returns (address addr) {
      assembly {
        addr := mload(add(bys,20))
      }
    }

    /**
        * @dev signature + signer are added at the end of msg.data
        * @return bool
        */
    function isValidSignatureAndData(address account, bytes signature) public view returns (bool) {
        require(msg.data.length > (_SIGNATURE_SIZE + _SIGNER_SIZE));

        bytes memory data = new bytes(msg.data.length - _SIGNATURE_SIZE - _SIGNER_SIZE);
        for (uint i = 0; i < data.length; i++) {
            data[i] = msg.data[i];
        }

        return _isValidDataHash(keccak256(abi.encodePacked(address(this), account, data)), signature);
    }

    /**
     * @dev internal function to convert a hash to an eth signed message
     * and then recover the signature and check it against the signer role
     * @return bool
     */
    function _isValidDataHash(bytes32 hash, bytes signature) internal view returns (bool) {
        address signer = hash.toEthSignedMessageHash().recover(signature);
        return signer != address(0) && isSigner(signer);
        // return signer != address(0);
    }
}
