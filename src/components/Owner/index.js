import React, { Component } from 'react';
import { Events, Blockie, Button } from "dapparatus";
import Widget from '../Widget';
import ContractDetails from '../Widgets/ContractDetails.js';
import RelayerDetails from '../Widgets/RelayerDetails.js';
import SignButton from '../SignButton';
import styles from './Owner.module.scss';

const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

class Owner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bouncer: "",
      bouncers: []
    }
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
    return (
      <div className={styles.owner}>
        <h1 className={styles.title}>
          Owner View
        </h1>
        <div className={styles.widgets}>
          <Widget
            title="Bouncers">
            <input
              style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="addBouncer"
              value={this.props.bouncer}
              onChange={this.handleBouncer.bind(this)}
            />
            <Blockie
              address={(this.props.bouncer && this.props.bouncer.length) ?
                this.props.bouncer.toLowerCase() : DEFAULT_ADDRESS} />
            <Button color="blue" disabled={!this.state.bouncer} onClick={() => this.addBouncer()}>
              Add Bouncer
            </Button>
            {this.state.bouncers && this.state.bouncers.map((bouncer)=> (
              <div key={bouncer}>
                <Blockie address={bouncer} />
                {bouncer}
              </div>
            ))}
          </Widget>
          <Widget
            title="Signers">
            {this.props.contract &&
              <SignButton
                address={this.props.address}
                ownerBouncer={this.props.owner.toLowerCase() ===
                  this.props.account.toLowerCase()}
                backendUrl={this.props.backendUrl} />
            }
          </Widget>
          <ContractDetails {...this.props} />
          <RelayerDetails {...this.props} />
          <Widget
            title="Signer Events">
            <Events
              config={{ hide: false, DEBUG: true }}
              contract={this.props.contract}
              eventName={"SignerAdded"}
              block={this.props.block}
              onUpdate={(eventData,allEvents) => {
                console.log("SignerAdded", eventData);
                this.state.bouncers.push(eventData.account.toLowerCase());
                this.setState({ bouncers: this.state.bouncers });
              }}
            />
            <Events
              config={{hide:false}}
              contract={this.props.contract}
              eventName={"SignerRemoved"}
              block={this.props.block}
              onUpdate={(eventData,allEvents) => {
                console.log("SignerRemoved", eventData);
                this.setState({ bouncers: this.state.bouncers.filter((b) =>
                  this.state.bouncers[b] !== eventData.account.toLowerCase())
                });
              }}
            />
          </Widget>
          <Widget
            title="Forward Events">
            <Events
              config={{hide:false}}
              contract={this.props.contract}
              eventName={"Forwarded"}
              block={this.props.block}
              onUpdate={(eventData,allEvents)=>{
                console.log("Forwarded", eventData);
              }}
            />
            {this.state.metaContract && (
              <Events
                config={{hide:false}}
                  contract={this.state.metaContract}
                  eventName={"Forwarded"}
                  block={this.state.block}
                  onUpdate={(eventData,allEvents)=>{
                    console.log("Forwarded",eventData)
                    this.setState({ MetaForwards: allEvents.reverse() });
                  }}
              />
            )}
          </Widget>
        </div>
      </div>
    );
  }
}

export default Owner;
