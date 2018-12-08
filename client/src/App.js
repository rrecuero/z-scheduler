import React, { Component } from 'react';
import {
  Dapparatus,
  Gas, ContractLoader,
  Transactions,
} from "dapparatus"
import Web3 from 'web3';
import styles from './App.module.scss';
import OwnerPanel from "./components/OwnerPanel/index.js";
import BouncerList from "./components/BouncerList/index.js";
import Dashboard from "./components/Dashboard/index.js";
import Screen from "./components/Screen/index.js";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import cx from 'classnames';
import axios from 'axios';

let backendUrl = "http://localhost:4000/api/relayer/";
if (window.location.href.indexOf("metatx.dapis.io") >= 0) {
  backendUrl = "https://metatx.dapis.io/api/relayer/";
}
const BOUNCER_KEY = process.env.REACT_APP_BOUNCER || 'BouncerProxy';
const FALLBACK_WEB3_PROVIDER = process.env.REACT_APP_NETWORK || 'http://0.0.0.0:8545';

const METATX = {
  endpoint: backendUrl,
  contract: require(`./contracts/${BOUNCER_KEY}.address.js`)
};

const contractsCode = {
  BouncerProxy: require("./contracts/BouncerProxy.bytecode.js"),
  BouncerWithNonce: require("./contracts/BouncerWithNonce.bytecode.js"),
  BouncerWithReward: require("./contracts/BouncerWithReward.bytecode.js"),
  Scheduler: require("./contracts/Scheduler.bytecode.js"),
};

class App extends Component {

  constructor(props) {
   super(props);
   this.state = {
     web3: false,
     account: false,
     gwei: 4,
     bouncerKey: BOUNCER_KEY,
     address: window.location.pathname.replace("/",""),
     contract: false,
     owner: ""
   }
  }

  deployBouncerProxy(bouncerKey) {
    const { tx, contracts } = this.state;
    tx(
      contracts[bouncerKey]._contract.deploy(
        { data: contractsCode[bouncerKey] }),
      3220000,
      (receipt) => {
      if (receipt.contractAddress) {
        axios.post(`${backendUrl}deploy`, receipt, {
          headers: {
              'Content-Type': 'application/json',
          }
        }).then((response) => {
          window.location.href = `/${receipt.contractAddress}`;
        })
        .catch((error) => {
          console.error('Error deploying contract', error);
        })
      }
    })
  }

  renderConnectedDisplay() {
    const { web3, account,
      gwei, block, avgBlockTime, etherscan } = this.state;
    return (
      <div>
        {web3 &&
          <div className={styles.transactionsWrapper}>
            <ContractLoader
              config={{DEBUG:true}}
              web3={web3}
              require={path => {return require(`${__dirname}/${path}`)}}
              onReady={(contracts, customLoader) => {
                this.setState({ contracts, metaContract: contracts[this.state.bouncerKey] }, async () =>{
                  if (this.state.address) {
                    console.log("Loading dyamic contract " + this.state.address);
                    const dynamicContract = customLoader(this.state.bouncerKey, this.state.address);
                    const owner = await dynamicContract.owner().call();
                    this.setState({
                      contract: dynamicContract,
                      owner
                    });
                  }
                })
              }}
            />
            <Transactions
              config={{DEBUG:false}}
              account={account}
              gwei={gwei}
              web3={web3}
              block={block}
              avgBlockTime={avgBlockTime}
              etherscan={etherscan}
              metaAccount={this.state.metaAccount}
              metaContract={this.state.metaContract}
              metatx={METATX}
              balance={this.state.balance} /* so we can metatx if balance 0 */
              metaTxParts = {(proxyAddress,fromAddress,toAddress,value,txData,nonce)=>{
                return [
                  proxyAddress,
                  fromAddress,
                  toAddress,
                  web3.utils.toTwosComplement(value),
                  txData,
                  web3.utils.toTwosComplement(nonce),
                ]
              }}
              onReady={(state)=>{
                console.log("Transactions component is ready:",state);
                this.setState(state);
              }}
              onReceipt={(transaction,receipt)=>{
                // this is one way to get the deployed contract address, but instead I'll switch
                //  to a more straight forward callback system above
                console.log("Transaction Receipt", transaction, receipt);
              }}
            />
            <Gas
              onUpdate={(state)=>{
                this.setState(state, () => {
                  console.log("GWEI set:", this.state);
                })
              }}
            />
          </div>
        }
      </div>
    );
  }

  renderHome() {
    const { web3, contracts } = this.state;
    return (
      <Screen>
        <div className={styles.home}>
          <h1 className={styles.title}>
            Meta Scheduler
          </h1>
          <h3 className={styles.subtitle}>
            Exploring etherless meta transactions, scheduled tx
            and different bouncer proxies.
          </h3>
          <div className={styles.buttons}>
            <button className={cx('pink')} onClick={()=>{
              window.open("https://github.com/rrecuero/z-scheduler");
            }}>
              Learn more
            </button>
            {web3 && contracts && (
              <button className={cx('purple')} onClick={() => this.deployBouncerProxy(this.state.bouncerKey)}>
                Deploy
              </button>
            )}
            {(!web3 || !contracts) && (
              <button className={cx('yellow')} onClick={()=>{
                alert("Please unlock Metamask or install web3 or mobile ethereum wallet.")
              }}>
                Loading...
              </button>
            )}
          </div>
          <BouncerList backendUrl={backendUrl} />
        </div>
      </Screen>
    );
  }

  renderContractDisplay() {
    const { web3, contracts } = this.state;
    if (web3 && contracts) {
      if (!this.state.contract) {
        if (this.state.address) {
          return(
            <div style={{padding:20}}>
              Connecting to {this.state.address}
            </div>
          );
        }
      } else  {
        const ownerBouncer = this.state.owner.toLowerCase() ===
          this.state.account.toLowerCase();
        return (
          <Screen>
            {ownerBouncer && (
              <OwnerPanel
                backendUrl={backendUrl}
                {...this.state}
              />
            )}
            {!ownerBouncer && (
              <Dashboard
                {...this.state}
                backendUrl={backendUrl}
              />
            )}
          </Screen>
        );
      }
    } else  {
      return this.renderHome();
    }
  }

  render() {
    return (
      <div className={styles.app}>
        <Header />
        <div className={styles.dapparatusWrapper}>
          <Dapparatus
            metaTx={METATX}
            config={{requiredNetwork:['Unknown','Rinkeby']}}
            fallbackWeb3Provider={new Web3.providers.HttpProvider(FALLBACK_WEB3_PROVIDER)}
            onUpdate={(state)=>{
             if(state.web3Provider) {
               state.web3 = new Web3(state.web3Provider);
               this.setState(state);
             }
            }}
          />
        </div>
        {this.renderConnectedDisplay()}
        {!this.state.address && this.state.contracts && this.renderHome()}
        {this.renderContractDisplay()}
        <Footer />
      </div>
    );
  }
}

export default App;
