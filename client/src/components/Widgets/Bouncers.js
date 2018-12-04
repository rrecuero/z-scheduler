import React, { Component } from 'react';
import { Blockie } from "dapparatus";
import Widget from '../Widget/';
import styles from './Bouncers.module.scss';

export default class Bouncers extends Component {

  constructor(props) {
    super(props);
    this.pollInterval = null;
    this.state = {
      bouncer: ""
    };
  }

  handleBouncer(e){
    this.updateBouncer(e.target.value);
  }

  updateBouncer(bouncer){
    this.setState({ bouncer });
  }

  addBouncer() {
    const { tx,contract } = this.props;
    console.log("Add Bouncer ", this.state.bouncer);
    tx(contract.addSigner(this.state.bouncer), 55000, (receipt) => {
      this.updateBouncer(null);
      console.log("~~~~ BOUNCER ADDED:", receipt);
    });
  }

  render() {
    const { bouncers } = this.props;
    return (
      <Widget
        title="Bouncers">
        <div className={styles.bouncers}>
          <input
            type="text" name="addBouncer"
            value={this.props.bouncer}
            onChange={this.handleBouncer.bind(this)}
          />
          <button className="pink" disabled={!this.state.bouncer} onClick={() => this.addBouncer()}>
            Add Bouncer
          </button>
          <h4> {bouncers.length > 0 ? 'Added Bouncers' : 'No bouncers yet'} </h4>
          {bouncers && [...new Set(bouncers)].map((bouncer)=> (
            <div className={styles.bouncer} key={bouncer}>
              <Blockie address={bouncer} />
              <span>{bouncer}</span>
            </div>
          ))}
        </div>
      </Widget>
    );
  }
}
