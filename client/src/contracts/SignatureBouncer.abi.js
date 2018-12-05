module.exports = [{"constant":true,"inputs":[{"name":"account","type":"address"},{"name":"signature","type":"bytes"}],"name":"isValidSignatureAndData","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"isSigner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceSigner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"}],"name":"addSigner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"signature","type":"bytes"}],"name":"AccountRetrieved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"signer","type":"address"}],"name":"Signer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"account","type":"address"}],"name":"SignerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"account","type":"address"}],"name":"SignerRemoved","type":"event"}]