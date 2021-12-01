import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {

  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");

  let getMessage = document.getElementsByClassName("filter")[0];

  /*  
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0xCD9642bB8745E9836a649c2D83b04593a67d2604";

  const [isLoading, setLoading] = useState(false);

  /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

   /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
        * Execute the actual wave from your smart contract
        */
        setLoading(true);

        const waveTxn = await wavePortalContract.wave(getMessage.value.toString(), { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setLoading(false);
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {

      setLoading(false);
      console.log(error)
    }
  }

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
 * Listen in for emitter events!
 */
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on('NewWave', onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);



  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    
    <div className="mainContainer">
      <div className="dataContainer">
        {isLoading &&
          (<div className="loader"></div>)
        }
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          <strong> I am Hussain </strong>, A Fullstack Web/Blockchain Developer. so that's pretty cool right? 
          Connect your Ethereum wallet and wave at me!
        </div>
        <div className="bio">
          <a href="https://facebook.com/HussainMAuwal" className="fa fa-facebook"></a>
          <a href="https://twitter.com/HussainMAuwal" className="fa fa-twitter"></a>
          <a href="mailTo: hauwal4969@gmail.com" class="fa fa-google"></a>
          <a href="https://www.linkedin.com/in/hussainmauwal/" className="fa fa-linkedin"></a>
          <a href="https://instagram.com/hussainmauwal01" className="fa fa-instagram"></a>
        </div>
        <label>{"Drop a Message here!!!"}</label>
        <textarea className={"filter"}/>
        <button className="waveButton" onClick={wave}>
          <span>Wave at Me</span>
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            <span>Connect Wallet</span>
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px", marginLeft: "30px", marginRight: "30px"}}>
              <div>Address: {wave.address}</div><br/>
              <div>Time: {wave.timestamp.toString()}</div><br/>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App