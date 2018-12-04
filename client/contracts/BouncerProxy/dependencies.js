const fs = require('fs');
module.exports = {
  'openzeppelin-solidity/contracts/access/roles/SignerRole.sol': fs.readFileSync('openzeppelin-solidity/contracts/access/roles/SignerRole.sol', 'utf8'),
  'openzeppelin-solidity/contracts/access/Roles.sol': fs.readFileSync('openzeppelin-solidity/contracts/access/Roles.sol', 'utf8'),
  'openzeppelin-solidity/contracts/cryptography/ECDSA.sol': fs.readFileSync('openzeppelin-solidity/contracts/cryptography/ECDSA.sol', 'utf8'),
  'openzeppelin-solidity/contracts/ownership/Ownable.sol': fs.readFileSync('openzeppelin-solidity/contracts/ownership/Ownable.sol', 'utf8'),
  'contracts/SignatureBouncer/SignatureBouncer.sol': fs.readFileSync('contracts/SignatureBouncer/SignatureBouncer.sol', 'utf8'),
}
