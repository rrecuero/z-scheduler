# Meta Tx & Scheduler Playground

[Check it live here](https://metatx.dapis.io)

Interact with several sample smart contracts with etherless accounts and even accounts without Metamask. You can interact with several smart contracts through
different Bouncer Proxies.

- [BouncerProxy](https://github.com/rrecuero/z-scheduler/blob/master/client/contracts/BouncerProxy/BouncerProxy.sol): Simple proxy that forwards requests.
- [BouncerProxyWithNonce](https://github.com/rrecuero/z-scheduler/blob/master/client/contracts/BouncerWithNonce/BouncerWithNonce.sol): Adds nonce check.
- [BouncerProxyWithReward](https://github.com/rrecuero/z-scheduler/blob/master/client/contracts/BouncerWithReward/BouncerWithReward.sol): Adds reward for the miner that sends the transaction.
- [Scheduler](https://github.com/rrecuero/z-scheduler/blob/master/client/contracts/Scheduler/Scheduler.sol): BouncerProxyWithReward that forwards the transaction only after
a particular minBlock.

There are some sample smart contracts to interact with:

- [Example](https://github.com/rrecuero/z-scheduler/blob/master/client/contracts/Example/Example.sol): Simple contract with a counter. You can increase the counter.
- [SomeToken(ERC-20)](https://github.com/rrecuero/z-scheduler/blob/master/client/contracts/SomeToken/SomeToken.sol): Send tokens to other address.
- Send ETH: Standard ETH send functionality.
- (TODO) Call any contract through the UI without ether or Metamask.

## How to use (UI steps)

1. Click on the Deploy button to deploy your own proxy contract.
2. Once deployed, open the new url with the contract with a different account, even in incognito to use it without metamask.
3. Sign the contract in the new window.
4. Back in the original window, add the other account as a bouncer proxy.
5. In the User view, you can now interact with the different contracts without ether
and without Metamask.

## Inspirations

Heavily inspired by the work @austintgriffith and Metacartel around meta transactions.

Here are some links to dive deeper:

- [Harbour MVP](https://github.com/Meta-tx/Harbour-MVP/wiki/Resources)
- [BuidlGuidl](https://medium.com/@austin_48503/buidlguidl-0x2-meta-transactions-be3ea1d076a6)
- [UniversalLogins](https://medium.com/@avsa/1dc8b17a8de7)

Smart contract References:
- [GnosisSafe](https://github.com/gnosis/safe-contracts)
- [OpenZeppelin Signature Bouncer](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/7ef273050697178b74dd4530d4b0eb4e5127a8f5/contracts/drafts/SignatureBouncer.sol#L100-L103)

## Requirements

- Install latest Node (8+) & npm
- Install babel
`npm install --global babel-cli`

- Install eslint
`npm install -g eslint`

- Install clevis
`npm install -g clevis`

- Install Ganache
`npm install -g ganache-cli`

- Install create-react-app
`npm install -g create-react-app`

- Install heroku (on MacOs)
```
brew install heroku/brew/heroku
```

## Quick Start

Run npm install in every folder:
```
cd client && npm install
cd backend && npm install
```

Run garnache, backend and frontend in different terminals:
```
ganache-cli -b 3
cd backend && npm run dev
cd client && npm run start
```

The dApp should be running here `http://localhost:3000`.

## Deploying to heroku

`git push heroku master`

## Tests

In order to run the smart contract tests run inside the client folder:

`clevis test test`

Inside the backend, you can run tests with:

`npm run test`

## Technologies used

- Frontend: React/Redux, ES6, SASS
- Smart Contracts: Clevis, Ganache, OpenZeppelin
- Backend: Node JS, Express, Redis
- Cloud: Heroku, Cloudflare

See more info here:
- [Open Zeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity)
- [Create React App](https://github.com/facebookincubator/create-react-app)
- [Heroku app setup for both apps](https://github.com/mars/heroku-cra-node)

## Folder Organization

- `client/`: React/Redux frontend app. Node package.
- `client/contracts/`: Contains smart contracts. Clevis setup.
- `backend/`: Node API backend. Node package.

## TODO
- No eth/tokens in proxy error
