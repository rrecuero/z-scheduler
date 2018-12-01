import React, { Component } from 'react';
import { Blockie } from "dapparatus"
import axios from 'axios';
import StackGrid from "react-stack-grid";

const POLL_TIME = 15500;

class allBouncers extends Component {
  constructor(props) {
    super(props);
    this.pollInterval = null;
    this.state = {
      contracts: []
    };
  }

  componentDidMount() {
    this.pollInterval = setInterval(this.load.bind(this), POLL_TIME);
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
    if(!this.state.contracts){
      return (<div />);
    }
    return (
      <StackGrid columnWidth={60}>
        {this.state.contracts.map((contract) => (
          <div key={contract} >
            <a href={"/"+contract}>
              <Blockie address={contract.toLowerCase()} config={{size:6}}/>
            </a>
          </div>
        ))}
      </StackGrid>
    );
  }
}

export default allBouncers;
