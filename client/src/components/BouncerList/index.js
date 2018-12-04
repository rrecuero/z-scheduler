import React, { Component } from 'react';
import { Blockie } from "dapparatus"
import axios from 'axios';
import styles from './BouncerList.module.scss';

const POLL_TIME = 15500;

export default class BouncerList extends Component {
  constructor(props) {
    super(props);
    this.pollInterval = null;
    this.state = {
      contracts: []
    };
  }

  componentDidMount() {
    this.pollInterval = setInterval(this.loadBouncers.bind(this), POLL_TIME);
    this.loadBouncers();
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  async loadBouncers(){
    axios.get(this.props.backendUrl+"contracts")
    .then((response) => {
      this.setState({ contracts: response.data });
    })
    .catch((error) => {
      console.error('Error loading bouncers', error);
    });
  }
  render() {
    if(!this.state.contracts || this.state.contracts.length === 0){
      return (<div />);
    }
    return (
      <div className={styles.bouncerList}>
        <h3>Deployed Bouncer Proxy Contracts</h3>
        <div className={styles.list}>
          {[...new Set(this.state.contracts)].map((contract) => (
            <div className={styles.bouncerItem} key={contract} >
              <a href={"/"+contract}>
                <Blockie address={contract.toLowerCase()} config={{size:6}}/>
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
