import React, { Component } from 'react';
import Widget from '../Widget/';
import Miner from '../Miner/';
import styles from './RelayerDetails.module.scss';

export default class RelayerDetails extends Component {
  render() {
    return (
      <Widget
        title="Relayer Details">
        <div className={styles.details}>
          <h4> Relayer Address </h4>
          <Miner backendUrl={this.props.backendUrl} {...this.props} />
          <h4> API URL </h4>
          <span> {this.props.backendUrl}</span>
        </div>
      </Widget>
    );
  }
}
