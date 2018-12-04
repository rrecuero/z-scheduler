import React, { Component } from 'react';
import { Address } from "dapparatus";
import Widget from '../Widget/';
import styles from './ContractDetails.module.scss';

const POLL_TIME = 5009;

export default class ContractDetails extends Component {

  constructor(props) {
    super(props);
    this.pollInterval = null;
    this.state = {
      tokenBalance: 0,
      minBlock: props.block
    };
  }

  componentDidMount() {
    this.pollInterval = setInterval(this.loadCount.bind(this), POLL_TIME);
    this.loadCount();
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  async loadCount(){
    const { contracts, contract } = this.props;
    const tokenBalance = await contracts.SomeToken.balanceOf(contract._address).call();
    this.setState({ tokenBalance });
  }

  render() {
    return (
      <Widget
        title="Contract Details">
        <div className={styles.details}>
          <span> Contract Address </span>
          <Address {...this.props} address={this.props.contract._address} />
          <div className={styles.tokenBalance}>
            <div className={styles.bold}>{this.state.tokenBalance}</div> SomeToken (ERC-20) 
          </div>
          <span> Contract Owner </span>
          <Address {...this.props} address={this.props.owner}/>
        </div>
      </Widget>
    );
  }
}
