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
          <span> Relayer Address </span>
          <Miner backendUrl={this.props.backendUrl} {...this.props} />
        </div>
      </Widget>
    );
  }
}
