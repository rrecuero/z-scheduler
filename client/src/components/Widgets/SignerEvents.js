import React, { Component } from 'react';
import { Events } from "dapparatus";
import Widget from '../Widget/';
import styles from './SignerEvents.module.scss';

export default class SignerEvents extends Component {

  renderEvents(eventName, add) {
    const { updateBouncers } = this.props;
    return (
      <Events
        config={{ hide: false }}
        contract={this.props.contract}
        eventName={eventName}
        block={this.props.block}
        onUpdate={(eventData,allEvents) => {
          console.log(eventName, eventData);
          let bouncers = this.props.bouncers;
          if (add) {
            bouncers.push(eventData.account.toLowerCase());
          } else {
            bouncers = this.props.bouncers.filter((b) =>
              b !== eventData.account.toLowerCase());
          }
          updateBouncers(bouncers);
        }}
      />
    );
  }

  render() {
    return (
      <Widget
        title="Signer Events">
        <div className={styles.events}>
          {this.renderEvents("SignerAdded", true)}
          {this.renderEvents("SignerRemoved", true)}
        </div>
      </Widget>
    );
  }
}
