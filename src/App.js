import React, { Component } from 'react';
import { Metamask,
  Gas, ContractLoader,
  Transactions,
  Scaler,
  Address, Button } from "dapparatus"
import Web3 from 'web3';
import styles from './App.css';
import Owner from "./components/owner.js"
import AllBouncers from "./components/allBouncers.js"
import Bouncer from "./components/bouncer.js"
import Backend from "./components/backend.js"
import Miner from "./components/miner.js"
import QRCode from 'qrcode.react';
import axios from 'axios';

let backendUrl = "http://localhost:4000/api/relayer/";
if (window.location.href.indexOf("metatx.dapis.io") >= 0) {
  backendUrl = "https://metatx.dapis.io/api/relayer/";
}

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
     address: window.location.pathname.replace("/",""),
     contract: false,
     owner: "",
     bouncer: ""
   }
  }

  deployBouncerProxy(bouncerKey) {
    const { tx, contracts } = this.state;
    tx(
      contracts[bouncerKey]._contract.deploy(
        { data: contractsCode[bouncerKey] }),
      1220000,
      (receipt) => {
      if (receipt.contractAddress) {
        axios.post(backendUrl + 'deploy', receipt, {
          headers: {
              'Content-Type': 'application/json',
          }
        }).then((response) => {
          window.location.href = "/" + receipt.contractAddress;
        })
        .catch((error) => {
          console.error('Error deploying contract', error);
        })
      }
    })
  }

  updateBouncer(bouncer){
    this.setState({ bouncer });
  }

  renderConnectedDisplay() {
    const { web3, account,
      gwei, block, avgBlockTime, etherscan } = this.state;
    return (
      <div>
        {web3 &&
          <div className={styles.dapparatusWrapper}>
            <ContractLoader
              config={{DEBUG:true}}
              web3={web3}
              require={path => {return require(`${__dirname}/${path}`)}}
              onReady={(contracts, customLoader) => {
                console.log("contracts loaded", contracts);
                this.setState({ contracts }, async () =>{
                  if (this.state.address) {
                    console.log("Loading dyamic contract " + this.state.address);
                    const dynamicContract = customLoader("BouncerProxy", this.state.address);
                    const owner = await dynamicContract.owner().call()
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
              onReady={(state)=>{
                console.log("Transactions component is ready:",state);
                this.setState(state)
              }}
              onReceipt={(transaction,receipt)=>{
                // this is one way to get the deployed contract address, but instead I'll switch
                //  to a more straight forward callback system above
                console.log("Transaction Receipt",transaction,receipt);
                /*if(receipt.contractAddress){
                  window.location = "/"+receipt.contractAddress
                }*/
              }}
            />
            <Gas
              onUpdate={(state)=>{
                console.log("Gas price update:",state)
                this.setState(state,()=>{
                  console.log("GWEI set:",this.state)
                })
              }}
            />
          </div>
        }
      </div>
    );
  }

  renderQR() {
    return (
      <div style={{position:"fixed",top:100,right:20}}>
          <Scaler config={{startZoomAt:900,origin:"150px 0px"}}>
            <QRCode value={window.location.toString()} />
          </Scaler>
      </div>
    );
  }

  renderBackend() {
    return (
      <Backend
        {...this.state}
        backendUrl={backendUrl}
        updateBouncer={this.updateBouncer.bind(this)}
      />
    );
  }

  renderHome() {
    return (
      <div className="titleCenter" style={{marginTop:-50,width:"100%"}}>
        <Scaler config={{origin:"50px center"}}>
        <div style={{width:"100%",textAlign:"center",fontSize:150}}>
         metatx.io
        </div>
        <div style={{width:"100%",textAlign:"center",fontSize:14,marginBottom:20}}>
         exploring etherless meta transactions and universal logins in ethereum
        </div>
        <div style={{width:"100%",textAlign:"center"}}>
          <Button size="2" onClick={()=>{
            window.location = "https://github.com/austintgriffith/bouncer-proxy/blob/master/README.md"
          }}>
          LEARN MORE
          </Button>
          <Button color="green" size="2" onClick={() => this.deployBouncerProxy('BouncerProxy')}>
            DEPLOY
          </Button>
        </div>
        <div style={{marginTop:150}}>
          <AllBouncers
            backendUrl={backendUrl}
          />
        </div>
        </Scaler>
      </div>
    );
  }

  renderContractDisplay() {
    const { web3, contracts } = this.state;
    if (web3 && contracts) {
      if (!this.state.contract) {
        return(
          <div style={{padding:20}}>
            Connecting to {this.state.address}
          </div>
        );
      } else  {
        const ownerBouncer = this.state.owner.toLowerCase() ===
          this.state.account.toLowerCase();
        return (
          <div style={{padding:20}}>
            <Miner backendUrl={backendUrl} {...this.state} />
            <Scaler config={{startZoomAt:900}}>
              <h1><a href="/">metatx.io</a></h1>
              <div>
                <Address
                  {...this.state}
                  address={this.state.contract._address}
                />
              </div>
              <div>
                <Address
                  {...this.state}
                  address={this.state.owner}
                />
              </div>
            </Scaler>
            {ownerBouncer && (
              <Owner
                {...this.state}
                onUpdate={(bouncerUpdate)=>{
                  console.log("bouncerUpdate",bouncerUpdate)
                  this.setState(bouncerUpdate)
                }}
                updateBouncer={this.updateBouncer.bind(this)}
              />
            )}
            {!ownerBouncer && (
              <Bouncer
                {...this.state}
                backendUrl={backendUrl}
              />
            )}
          </div>
        );
      }
    } else  {
      return (
        <div style={{padding:20}}>
          <div className="titleCenter" style={{marginTop:-50}}>
            <Scaler config={{origin:"center center"}}>
            <div style={{width:"100%",textAlign:"center",fontSize:150}}>
             metatx.io
            </div>
            <div style={{width:"100%",textAlign:"center",fontSize:14,marginBottom:20}}>
             please unlock metamask or mobile web3 provider
            </div>
            <div style={{width:"100%",textAlign:"center"}}>
              <Button size="2" onClick={()=>{
                window.location = "https://github.com/austintgriffith/bouncer-proxy/blob/master/README.md"
              }}>
              LEARN MORE
              </Button>
              <Button color="orange" size="2" onClick={()=>{
                alert("Please unlock Metamask or install web3 or mobile ethereum wallet.")
              }}>
              DEPLOY
              </Button>
            </div>
            </Scaler>
          </div>
        </div>
      );
    }
  }

  render() {
    const metamask = (
      <Metamask
        config={{requiredNetwork: ['Unknown', 'Rinkeby']}}
        onUpdate={(state) => {
          if(state.web3Provider) {
            state.web3 = new Web3(state.web3Provider);
            this.setState(state);
          }
        }}
      />
    );

    return (
      <div className="App">
        {metamask}
        {this.renderConnectedDisplay()}
        {!this.state.address && this.state.contracts && this.renderHome()}
        {this.renderContractDisplay()}
        {this.state.contract && this.renderQR()}
        {this.state.contract && this.renderBackend()}
      </div>
    );
  }
}

export default App;
