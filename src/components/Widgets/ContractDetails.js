import React, { Component } from 'react';
import { Address } from "dapparatus";
import Widget from '../Widget/';
import styles from './ContractDetails.module.scss';

export default class ContractDetails extends Component {
  render() {
    return (
      <Widget
        title="Contract Details">
        <div className={styles.details}>
          <span> Contract Address </span>
          <Address {...this.props} address={this.props.contract._address} />
          <span> Contract Owner </span>
          <Address {...this.props} address={this.props.owner}/>
        </div>
      </Widget>
    );
  }
}
