import React, { Component } from 'react';
import { Blockie } from "dapparatus"
import axios from 'axios';
import styles from './SignButton.module.scss';

const POLL_TIME = 15000;

class SignButton extends Component {
  constructor(props) {
    super(props);
    this.pollInterval = null;
    this.state = {
      sigs: []
    };
  }

  componentDidMount() {
    this.pollInterval = setInterval(this.loadSignatures.bind(this), POLL_TIME);
    this.loadSignatures();
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  loadSignatures() {
    axios.get(`${this.props.backendUrl}sigs/${this.props.address}`).then((response) => {
      console.log('response', response);
      this.setState({sigs: JSON.parse(response.data) });
    })
    .catch((error) => {
      console.error('Error loading backend', error);
    });
  }

  async signContract() {
    let timestamp = Date.now();
    let message = `${this.props.account} trusts bouncer proxy
      ${this.props.address} at ${timestamp}`;
    let sig = null;
    if (this.props.metaAccount) {
      sig = this.props.web3.eth.accounts.sign(message,
        this.props.metaAccount.privateKey).signature;
    } else {
      sig = await this.props.web3.eth.personal.sign(
        message, this.props.account);
    }
    let data = JSON.stringify({
      address: this.props.address,
      account: this.props.account,
      timestamp,
      message,
      sig
    });
    axios.post(`${this.props.backendUrl}sign`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      console.log("Signature added", response);
    })
    .catch((error) => {
      console.error("Error signing", error);
    });
  }
  render() {
    const alreadySigned = this.state.sigs.find((sig) => sig === this.props.account);
    return (
      <div className={styles.signWrapper}>
        <h3> Signers Added </h3>
        <div className={styles.signers}>
          {this.state.sigs && this.state.sigs.map((sig) => (
            <span
              key={"sig"+sig} style={{padding:3,cursor:"pointer"}}>
              <Blockie address={sig} config={{size:5}} />
            </span>
          ))}
        </div>
        {(!alreadySigned && !this.props.ownerBouncer) && (
          <button className={'purple'} onClick={this.signContract.bind(this)}>
            Sign
          </button>
        )}
        {(alreadySigned && !this.props.ownerBouncer) && (
          <span>{'You already signed'}</span>
        )}
      </div>
    );
  }
}

export default SignButton;
