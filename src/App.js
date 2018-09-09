import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Hls from 'hls.js'

const TX = require('ethereumjs-tx')
const Web3 = require('web3')
const contractAbi = require('./LedgerChannel.json').abi

const contractAddress = '0xb80996993505eb2d95efb775333b1a5c2708086f'
const ingridAddress = '0x8ec75ef3adf6c953775d0738e0e7bd60e647e5ef'
const ingridKey = '0xf0f18fd1df636821d2d6a04b4d4f4c76fc33eb66c253ae1e4028bf33c48622bc'
const channelId = '0xc053f0bac5feb9fd8d527d0d7c4880420563b8cbfb5bead85515401723cbb651'

function hexToBuffer(hexString) {
  return new Buffer(hexString.substr(2, hexString.length), 'hex')
}

function bufferToHex(buffer) {
  return '0x' + buffer.toString('hex')
}

const STREAM_ID = 'd8072aae72b84c63f1136e6a525dfef04e2ca5f39f232874da4a4a45372b2ebd'
const SOURCE = 'http://localhost:8935/stream/' + STREAM_ID + '.m3u8'

class App extends Component {
  constructor( ) {
    super()
    window.web3.eth.getAccounts((err, ac) => {
      this.setState({ masterAccount: ac[0] })
      // init contract
      this.web3 = window.web3
      this.masterContract = this.web3.eth.contract(contractAbi).at(contractAddress)
    })
    window.delegateWeb3.eth.getAccounts((err, ac) => {
      this.delegateWeb3 = window.delegateWeb3
      this.delegateContract = this.delegateWeb3.eth.contract(contractAbi).at(contractAddress)
      this.setState({ delegateAccount: ac[0] })
    })
    this.state = {
      masterAccount: '0x',
      delegateAccount: '0x',
        videoStyle: {display: 'hidden'}
    }
    this.videoRef = React.createRef()
  }

  registerDelegateKey = async () => {
    let tx = await new Promise((resolve, reject) => {
      this.masterContract.registerDelegateKey(
        this.state.delegateAccount,
        { from: this.state.masterAccount },
        (err, tx) => {
          err ? reject(err) : resolve(tx)
        }
      )
    })
    console.log(tx)
  }

  createChannel = async () => {
    const lcId = Web3.utils.sha3('1111' + Math.random(), { encoding: 'hex' })
    console.log('channelId', lcId)
    const callData = this.masterContract['createChannel'].getData(
      lcId,
      this.state.masterAccount,
      '0',
      '0',
      [Web3.utils.toWei('0.05'), '0']
    )

    console.log('callData', callData)
    this.web3.eth.getTransactionCount(ingridAddress, async (err, nonce) => {
      const rawTx = {
        nonce: await this.web3.toHex(nonce),
        gasPrice: await this.web3.toHex(Web3.utils.toWei('0.000000005')),
        gasLimit: await this.web3.toHex(250000),
        to: contractAddress,
        value: await this.web3.toHex(Web3.utils.toWei('0.05')),
        data: callData,
        from: ingridAddress
      }
      console.log('rawTx', rawTx)
      const tx = new TX(rawTx)
      tx.sign(hexToBuffer(ingridKey))
      const serialziedData = tx.serialize()
      this.web3.eth.sendRawTransaction(bufferToHex(serialziedData), (err, res) => {
        console.error(err)
        console.log('create',res)
      })

    })
  }

    testTransactionn = () => {
      const txData = '0xf86480843b9aca0083200b20944619133e56101975e1eed8fd3bf54c32e1e859030a801ca0df5e4818d8b4e190555fccf7715ae08fa5bb43a62358033dcb06d07f5ef9ba41a05abc5391a3f0fed6c8343cbfcb66edc1afbb98bf901d959945d76ac94015255c'
      this.web3.eth.sendRawTransaction(txData, (err, res) => {
        console.error(err)
        console.log('testTransactionn', res)
      })
    }
  // createChannel = async () => {
  //   const lcId = Web3.utils.sha3('1111' + Math.random(), { encoding: 'hex' })
  //   console.log('lcId', lcId)//0xb042c1d41af331615fcce63f7aecae8a608ccbf200eeb71b9586fd83c35a1453
  //   const balances = [Web3.utils.toWei('0.05'), '0']
  //   console.log('balances', balances)
  //   let tx = await new Promise((resolve, reject) => {
  //     this.contract.createChannel(
  //       lcId,
  //       ingridAddress,
  //       '0',
  //       '0',
  //       balances,
  //       { from: this.state.masterAccount, value: Web3.utils.toWei('0.05') },
  //       (err, tx) => {
  //         console.error(err)
  //         err ? reject(err) : resolve(tx)
  //       }
  //     )
  //   })
  //   console.log(tx)
  // }

  joinChannel = async () => {
    const callData = this.delegateContract['joinChannel'].getData(channelId,
      [Web3.utils.toWei('0.05'), '0'])

    console.log('callData', callData)
    this.delegateWeb3.eth.getTransactionCount(this.state.delegateAccount, (err, nonce) => {
      console.log('nonce', nonce)
      this.delegateWeb3.eth.sendTransaction({
        nonce:  this.web3.toHex(nonce),
        gasPrice:  this.web3.toHex(Web3.utils.toWei('0.000000005')),
        gasLimit:  this.web3.toHex(250000),
        to: contractAddress,
        value:  this.web3.toHex(Web3.utils.toWei('0.05')),
        data: callData,
        from: this.state.delegateAccount
      }, (err, tx) => { console.log('tx', err, tx) })
    })
  }

  // joinChannel = async () => {
  //   const balances = [Web3.utils.toWei('0.05'), '0']
  //   console.log('joinChannel', channelId)
  //   let tx = await new Promise((resolve, reject) => {
  //     this.delegateContract.joinChannel(
  //       channelId,
  //       balances,
  //       { from: this.state.delegateAccount, value: Web3.utils.toWei('0.05') },
  //       (err, data) => {
  //         console.error(err)
  //         err ? reject(err) : resolve(data)
  //       }
  //     )
  //   })
  //   console.log('join', tx)
  // }

  getChannnel = async () => {
    let tx = await new Promise((resolve, reject) => {
      this.masterContract.getChannel(
        channelId,
        { from: this.state.masterAccount },
        (err, tx) => {
          console.error(err)
          err ? reject(err) : resolve(tx)
        }
      )
    })
    console.log('getChannel', tx)
  }

  deposit = async () => {
    let tx = await new Promise((resolve, reject) => {
      this.delegateContract.deposit(
        channelId,
        this.state.masterAccount,
        Web3.utils.toWei('0.05'),
        false,
        { from: this.state.delegateAccount, value: Web3.utils.toWei('0.05') },
        (err, tx) => {
          console.error(err)
          err ? reject(err) : resolve(tx)
        }
      )
    })
    console.log(tx)
      this.setState({
          videoStyle: {display: 'block'}
      })
  }

  componentDidMount () {
      if(Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource(SOURCE);
          hls.attachMedia(this.videoRef.current);
      }
  }

  handlePlay () {
      let video = this.videoRef.current
      video.play()
  }

  getParty = async () => {
    let tx = await new Promise((resolve, reject) => {
      this.masterContract.getPartyByDelegateKey(
        this.state.delegateAccount,
        { from: this.state.masterAccount },
        (err, tx) => {
          console.error(err)
          err ? reject(err) : resolve(tx)
        }
      )
    })
    console.log('getParty', tx)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          Master Account: {this.state.masterAccount}
        </p>
        <p className="App-intro">
          Delegate Account: {this.state.delegateAccount}
        </p>
        <p className="App-intro">
          Ingrid Account: {ingridAddress}
        </p>
        <button onClick={this.registerDelegateKey}>Register Delegate Key</button>
        <hr />
          <div style={this.state.videoStyle}>
            <button onClick={this.handlePlay.bind(this)}>Play</button>
            <div className='video-container'>
                <video ref={this.videoRef}/>
            </div>
          </div>
        <button onClick={this.createChannel}>Create Channel</button>
        <button onClick={this.joinChannel}>Join Channel</button>
        <button onClick={this.getChannnel}>Get Channel</button>
        <button onClick={this.deposit}>Deposit</button>
        <button onClick={this.getParty}>Check Delegate Key</button>
        <button onClick={this.testTransactionn}>Test</button>
      </div>
    );
  }
}

export default App;
