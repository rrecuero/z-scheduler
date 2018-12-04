import React, { Component } from 'react';
import { Events } from "dapparatus";
import Widget from '../Widget/';
import styles from './SignerEvents.module.scss';

export default class ForwardEvents extends Component {

  render() {
    return (
      <Widget
        title="Forward Events">
        <div className={styles.events}>
          <Events
            config={{hide:false}}
            contract={this.props.contract}
            eventName={"Forwarded"}
            block={this.props.block}
            onUpdate={(eventData,allEvents)=>{
              console.log("Forwarded", eventData);
            }}
          />
          {this.props.metaContract && (
            <Events
              config={{hide:false}}
                contract={this.props.metaContract}
                eventName={"Forwarded"}
                block={this.props.block}
                onUpdate={(eventData,allEvents)=>{
                  console.log("Forwarded",eventData)
                  this.setState({ MetaForwards: allEvents.reverse() });
                }}
            />
          )}
        </div>
      </Widget>
    );
  }
}
