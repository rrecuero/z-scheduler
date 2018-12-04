import React, { Component } from 'react';
import { Address } from "dapparatus"
import axios from 'axios';
import styles from './Miner.module.scss';

const POLL_TIME_MS = 5000;

export default class Miner extends Component {
  constructor(props) {
    super(props);
    this.pollInterval = null;
    this.state = {
      address:false
    };
  }
  componentDidMount(){
    this.pollInterval = setInterval(this.load.bind(this), POLL_TIME_MS);
    this.load();
  }
  componentWillUnmount(){
    clearInterval(this.pollInterval);
  }

  async load() {
    axios.get(this.props.backendUrl+"miner").then((response) => {
      //console.log(response)
      this.setState({ address: response.data.address });
    })
    .catch((error) => {
      console.error('Error loading miner', error);
    });
  }
  render() {
    return (
      <div className={styles.miner}>
        {!this.state.address && (
          <span> Loading ... </span>
        )}
        {this.state.address && (
          <Address
            {...this.props}
            address={this.state.address}
          />
        )}
      </div>
    );
  }
}
