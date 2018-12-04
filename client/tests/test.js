const clevis = require("./clevis.js")
// add account with index 1 as a bouncer
// this means they can sign meta transactions that any other account can pay to submit
clevis.addBouncer(0, 1);
clevis.addBouncer(0, 2);
//mint SomeToken to account 1 from account 0 (this will be used to incentive other accounts to send the meta trasaction)
clevis.mintSomeToken(0, 1, 99);

//use account 2 to send a tx to the Example contract as account 1
// clevis.fwd(2, 1, 'BouncerProxy')
// clevis.fwd(2, 1, 'BouncerWithNonce')
// clevis.fwd(2, 1, 'BouncerWithReward')
clevis.fwd(2, 1, 'Scheduler')
// clevis.fwdToken(3,1, 'BouncerProxy', 1)
// clevis.fwdSendEther(3,1, 'BouncerProxy', 1, 0.1)
//
