"use client"

import { useEffect, useState } from "react";
import abi from '../utils/buy-me-a-coffe.json';
import { ethers } from "ethers";
import { toast } from "react-toastify";

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x8954aB4F4FD365131CFD9c27Fc3bCAF76154B6DF";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onNameChange = (event: any) => {
    setName(event.target.value);
  }

  const onMessageChange = (event: any) => {
    setMessage(event.target.value);
  }

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window as any;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window as any;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const {ethereum} = window as any;

      if (ethereum && currentAccount && name && message) {
        setIsLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          {value: ethers.utils.parseEther("0.0001")}
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn);

        console.log("coffee purchased!");

        toast('☕ Coffee purchased!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });

        setName("");
        setMessage("");
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMemos = async () => {
    try {
      const { ethereum } = window as any;
      
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        console.log(memos);
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    getMemos();
    },[]);

  return (
    <main className="w-screen flex justify-center items-center min-h-screen bg-[url('/img/coffee-bg.jpg')] bg-center bg-cover text-black font-mono font-semibold">
      <div className='mt-[-25vh] bg-white bg-opacity-50 p-4 rounded-xl flex flex-col items-center w-[90%] max-w-lg'>
        <h1 className="text-4xl text-center ">Buy me a coffee</h1>

        <div className="mt-4 w-full">
          <label className=" text-lg">Name</label>
          <input
            value={name}
            onChange={onNameChange}
            type="text"
            className="shadow-lg hover:shadow-xl bg-white mt-1 w-full p-2 rounded-lg text-lg outline-none"
            placeholder="John Doe"
          />
        </div>
        
        <div className="mt-4 w-full">
          <label className="text-lg">Message</label>
          <textarea
          value={message}
            onChange={onMessageChange}
            className="shadow-lg hover:shadow-xl bg-white mt-1 w-full p-2 rounded-lg text-lg outline-none"
            placeholder="Enjoy your coffee :)"
          />
        </div>

        {!currentAccount ? (
          <button onClick={connectWallet} className='shadow-lg bg-white mt-4 w-full p-2 rounded-lg text-lg max-w-[200px] button'>Connect wallet</button>
        ) : (
          <button onClick={buyCoffee} className='shadow-lg bg-white mt-4 w-full p-2 rounded-lg text-lg max-w-[200px] button'>{isLoading ? "Loading..." : "Send ☕"}</button>
        )}
      </div>

    </main>
  )
}
