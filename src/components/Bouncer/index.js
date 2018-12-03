import React, { Component } from 'react';
import { Button } from "dapparatus"
import { soliditySha3 } from 'web3-utils';
import axios from 'axios';
import Widget from '../Widget';
import ContractDetails from '../Widgets/ContractDetails.js';
import SignButton from '../SignButton';
import styles from './Bouncer.module.scss';

const POLL_TIME = 5009;

export default class Bouncer extends Component {
  constructor(props) {
    super(props);
    this.pollInterval = null;
    this.state = {
      count: "loading...",
      gasLimit: 920000,
      minBlock: props.block
    };
  }

  handleInput(e){
    let update = {};
    update[e.target.name] = e.target.value;
    this.setState(update);
  }

  componentDidMount() {
    this.pollInterval = setInterval(this.loadCount.bind(this), POLL_TIME);
    this.loadCount();
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  async loadCount(){
    let {contracts} = this.props;
    const count = await contracts.Example.count().call();
    this.setState({ count });
  }

  addAmountMeta(amount) {
    const { contracts,contract,account}  = this.props;
    var data = contracts.Example.addAmount(amount).encodeABI();
    this.sendMetaTx(
      contract._address,
      account,
      contracts.Example._address,
      0,
      data,
      this.state.minBlock
    );
  }

  sendEther(){
    let { contract,account,web3 } = this.props;
    const wei = web3.utils.toWei(this.state.sendEther+"", 'ether')
    console.log("SENDING WEI:", wei);
    this.setState({ sendEther: "", toAddress: "" });
    this.sendMetaTx(
      contract._address,
      account,
      this.state.toAddress,
      wei,
      "0x00",
      this.state.minBlock
    );
  }

  async sendToken(){
    let { contracts,contract,account } = this.props;
    var data = contracts.SomeToken.transfer(
      this.state.tokenToAddress,
      this.state.sendToken).encodeABI();
    console.log("SENDING ",
      this.state.sendToken,
      " tokens at address "+this.state.sendTokenAddress+" to address "+this.state.tokenToAddress);
    this.setState({ sendToken:"", sendTokenAddress:"", tokenToAddress:"" });
    this.sendMetaTx(
      contract._address,account,
      this.state.sendTokenAddress,
      0,
      data,
      this.state.minBlock
    );
  }

  async sendMetaTx(proxyAddress,fromAddress,toAddress,value,txData,minBlock){
    const { contract, account, web3 } = this.props;
    if(!minBlock) minBlock = 0;
    let nonce = 0;
    if (contract.nonce) {
      nonce = await contract.nonce(fromAddress, minBlock).call();
    }
    console.log("Current nonce for "+fromAddress+" is ",nonce)
    let rewardAddress = "0x0000000000000000000000000000000000000000";
    let rewardAmount = 0
    if (this.state.rewardTokenAddress) {
      if(this.state.rewardTokenAddress === "0" || this.state.rewardTokenAddress === "0x0000000000000000000000000000000000000000"){
        this.setState({rewardTokenAddress: rewardAddress});
        rewardAmount = web3.utils.toWei(this.state.rewardToken+"", 'ether')
        console.log("rewardAmount",rewardAmount)
      }else{
        rewardAddress = this.state.rewardTokenAddress
        rewardAmount = this.state.rewardToken
      }
    }

    console.log("Reward: "+rewardAmount+" tokens at address "+rewardAddress)
    const parts = [
      proxyAddress,
      fromAddress,
      toAddress,
      web3.utils.toTwosComplement(value),
      txData,
      rewardAddress,
      web3.utils.toTwosComplement(rewardAmount),
      web3.utils.toTwosComplement(minBlock),
      web3.utils.toTwosComplement(nonce),
    ];
    /*web3.utils.padLeft("0x"+nonce,64),*/
    console.log("PARTS", parts);
    const message = soliditySha3(...parts);
    console.log("sign", message);
    let sig;
    if (this.props.metaAccount) {
      sig = this.props.web3.eth.accounts.sign(message,
        this.props.metaAccount.privateKey).signature;
    } else {
      sig = await this.props.web3.eth.personal.sign(
        message, account);
    }
    console.log("SIG",sig);
    let postData = {
      gas: this.state.gasLimit,
      message,
      parts,
      sig
    };
    axios.post(this.props.backendUrl+'tx', postData, {
      headers: {
          'Content-Type': 'application/json',
      }
    }).then((response)=>{
      console.log("TX RESULT",response);
    })
    .catch((error)=>{
      console.log(error);
    });
  }

  render() {
    return (
      <div className={styles.bouncer}>
        <h1> User View</h1>
        <div className={styles.widgets}>
          <SignButton
            {...this.props}
            address={this.props.address}
            ownerBouncer={this.props.owner.toLowerCase() ===
              this.props.account.toLowerCase()}
            backendUrl={this.props.backendUrl} />
          <ContractDetails {...this.props} />
          <Widget
            title="Example Contract">
            <div>
              Example Contract Count: {this.state.count}
            </div>
            <Button onClick={() => this.addAmountMeta(5)}>
              meta addAmount(5)
            </Button>
          </Widget>
          <Widget
            title="Send Ether or Tokens">
            Send
            <input
                style={{verticalAlign:"middle",width:50,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="sendEther" value={this.state.sendEther} onChange={this.handleInput.bind(this)}
            /> ether to <input
                style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="toAddress" value={this.state.toAddress} onChange={this.handleInput.bind(this)}
            />
            <button className={'pink'} onClick={this.sendEther.bind(this)}>
             Send
            </button>
          </Widget>
          <Widget
            title="Schedule Transaction">
            Send
            <input
                style={{verticalAlign:"middle",width:50,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="sendToken" value={this.state.sendToken} onChange={this.handleInput.bind(this)}
            /> of token <input
                style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="sendTokenAddress" value={this.state.sendTokenAddress} onChange={this.handleInput.bind(this)}
            />  to address <input
                style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="tokenToAddress" value={this.state.tokenToAddress} onChange={this.handleInput.bind(this)}
            />
            <Button onClick={this.sendToken.bind(this)}>
              Send Token
            </Button>
            <div style={{width:800,borderTop:"1px solid #BBBBBB",marginTop:25,paddingTop:15}}>
              Gas Limit: <input
                style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="gasLimit" value={this.state.gasLimit} onChange={this.handleInput.bind(this)} />
            </div>
            <div>
              Minimum Block: <input
                style={{verticalAlign:"middle",width:100,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="minBlock" value={this.state.minBlock} onChange={this.handleInput.bind(this)} />
              <input type="button" value="now" onClick={()=>{this.setState({minBlock:this.props.block})}} /> +
              <input type="button" value="minute" onClick={()=>{this.setState({minBlock:this.state.minBlock+4})}} />
              <input type="button" value="hour" onClick={()=>{this.setState({minBlock:this.state.minBlock+240})}} />
              <input type="button" value="day" onClick={()=>{this.setState({minBlock:this.state.minBlock+5760})}} />
              <input type="button" value="week" onClick={()=>{this.setState({minBlock:this.state.minBlock+40320})}} />
            </div>
            <div>
              Reward:
              <input
                  style={{verticalAlign:"middle",width:200,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                  type="text" name="rewardToken" value={this.state.rewardToken} onChange={this.handleInput.bind(this)}
              /> of token <input
                  style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                  type="text" name="rewardTokenAddress" value={this.state.rewardTokenAddress} onChange={this.handleInput.bind(this)}
              />
            </div>
          </Widget>
        </div>
      </div>
    );
  }
}
