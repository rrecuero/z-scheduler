import React, { Component } from 'react';
import { Blockie, Scaler, Button } from "dapparatus"
import axios from 'axios';

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
      this.setState({sigs: response.data });
    })
    .catch((error) => {
      console.error('Error loading backend', error);
    });
  }

  async signContract() {
    let timestamp = Date.now();
    let message = `${this.props.account} trusts bouncer proxy
      ${this.props.address} at ${timestamp}`;
    let sig = await this.props.web3.eth.personal.sign(
      message, this.props.account);
    console.log("SIG", sig);
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
      console.log("SIGN SIG", response);
    })
    .catch((error) => {
      console.error("Error signing", error);
    });
  }
  render() {
    return (
      <div style={{position:"fixed",bottom:20,left:20}}>
        <Scaler config={{startZoomAt:900,origin:"0px 100px",adjustedZoom:1.2}}>
          <div style={{paddingLeft:20}}>
            {this.state.sigs && this.state.sigs.map((sig) => (
              <span key={"sig"+sig} style={{padding:3,cursor:"pointer"}}>
                <Blockie address={sig} config={{size:5}} />
              </span>
            ))}
          </div>
          <Button size="2" onClick={this.signContract.bind(this)}>
            Sign
          </Button>
        </Scaler>
      </div>
    );
  }
}

export default SignButton;
