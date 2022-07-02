import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMoralisQuery, useMoralis, useWeb3Contract } from "react-moralis";
import { ASK_USER_FOR_EMAIL } from "redux/types";

import abi from "./abi.json";

export default function PhantonWallet() {
  const dispatch = useDispatch();

  const [balance, setBalance] = useState(0);
  const account = useSelector((state) => state.account.account);
  const { isAuthenticated, web3, user, refetchUserData } = useMoralis();
  const phanton_tab = useSelector((state) => state.phanton.phanton_tab);

  const getBalance = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_PHANTON_ADDRESS,
    functionName: "balanceOf",
    params: {
      account: account,
    },
  });

  useEffect(() => {
    getBalance.runContractFunction();
  }, [web3, isAuthenticated, phanton_tab]);

  const getBalanceData = getBalance.data;

  useEffect(() => {
    if (getBalanceData) {
      setBalance(getBalanceData / 10 ** 18);
    }
  }, [getBalanceData]);

  const onAdd = async () => {
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: process.env.REACT_APP_PHANTON_ADDRESS, // The address that the token is at.
            symbol: "Phanton", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
            image: "https://phanta.space/favicon.png", // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log("Thanks for your interest!");
      } else {
        console.log("Your loss!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const ask_user_for_email = useSelector((state) => state.sidebar.ask_user_for_email);

  return (
    <div className="col">
      <div className="row text-light justify-content-center mt-4 ">
        <h5>Balance: </h5>
      </div>
      <div className="row text-light justify-content-center">
        <h5>{balance.toLocaleString(undefined, { maximumFractionDigits: 5 })} Phanton</h5>
      </div>
      <div className="row text-light justify-content-center mt-4">
        <h5>Don't see Phanton in your wallet?</h5>
      </div>
      <div className="row justify-content-center ">
        <button
          type="button"
          className="btn btn-light rounded"
          // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
          onClick={() => onAdd()}
        >
          Add Phanton to your wallet
        </button>
      </div>
      <div className="row justify-content-center mt-4">
        <button
          type="button"
          className="btn btn-light rounded"
          // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
          onClick={() => {
            dispatch({ type: ASK_USER_FOR_EMAIL, payload: ask_user_for_email + 1 });
          }}
        >
          Update your info to receive news
        </button>
      </div>
    </div>
  );
}
