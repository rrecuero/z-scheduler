import React, { Component } from 'react';
import Widget from '../Widget';
import ContractDetails from '../Widgets/ContractDetails.js';
import RelayerDetails from '../Widgets/RelayerDetails.js';
import SignerEvents from '../Widgets/SignerEvents.js';
import ForwardEvents from '../Widgets/ForwardEvents.js';
import Bouncers from '../Widgets/Bouncers.js';
import SignButton from '../SignButton';
import styles from './OwnerPanel.module.scss';

class OwnerPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bouncers: []
    }
  }

  updateBouncers(bouncers) {
    console.log('bouncers', bouncers);
    this.setState({ bouncers });
  }

  render() {
    return (
      <div className={styles.owner}>
        <h1 className={styles.title}>
          Owner View
        </h1>
        <div className={styles.widgets}>
          <ContractDetails {...this.props} />
          <RelayerDetails {...this.props} />
          <Bouncers {...this.props} bouncers={this.state.bouncers} />
          <Widget
            title="Signers">
            {this.props.contract &&
              <SignButton
                {...this.props}
                address={this.props.address}
                ownerBouncer={this.props.owner.toLowerCase() ===
                  this.props.account.toLowerCase()}
                backendUrl={this.props.backendUrl} />
            }
          </Widget>
          <SignerEvents
            bouncers={this.state.bouncers}
            updateBouncers={(bouncers)=> this.updateBouncers(bouncers)}
            {...this.props} />
          <ForwardEvents
            {...this.props} />
        </div>
      </div>
    );
  }
}

export default OwnerPanel;
