import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import MailchimpSubscribe from "react-mailchimp-subscribe";
import { useSelector, useDispatch } from "react-redux";
import { useMoralisQuery, useMoralis, useWeb3Contract, useMoralisSubscription } from "react-moralis";
import abi from "./abi.json";
import "../List.css";

import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

const showDecimals = 5;

export default function PhantonBuy() {
  const dispatch = useDispatch();
  const [fund, setFund] = useState(1);
  const [fundRaised, setFundRaised] = useState(0);
  const [tokenSold, setTokenSold] = useState(0);
  const [tokenYouGet, setTokenYouGet] = useState(0);
  const [totalSupply, setTotalSupply] = useState(1);
  const [valuation, setValuation] = useState(1);
  const [maximumSupply, setMaximumSupply] = useState(10000000000);
  const { isAuthenticated, web3, user, refetchUserData } = useMoralis();

  const getMaximumSupply = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_PHANTON_ADDRESS,
    functionName: "maximumSupply",
  });

  const getTokenSold = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_PHANTON_ADDRESS,
    functionName: "seedTokenSold",
  });

  const getFundRaised = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_PHANTON_ADDRESS,
    functionName: "seedFundRaised",
  });

  const fetchFundInfo = () => {
    getMaximumSupply.runContractFunction();
    getTokenSold.runContractFunction();
    getFundRaised.runContractFunction();
  };

  useEffect(() => {
    fetchFundInfo();
  }, [web3, isAuthenticated]);

  const getMaximumSupplyData = getMaximumSupply.data;
  const getTokenSoldData = getTokenSold.data;
  const getFundRaisedData = getFundRaised.data;

  useEffect(() => {
    if (getMaximumSupplyData) {
      setMaximumSupply(getMaximumSupplyData / 10 ** 18);
    }

    if (getTokenSoldData) {
      setTokenSold(getTokenSoldData / 10 ** 18);
    }

    if (getFundRaisedData) {
      setFundRaised(getFundRaisedData / 10 ** 18);
    }
  }, [getMaximumSupplyData, getTokenSoldData, getFundRaisedData]);

  // get live fund raised data
  const limit = 5;
  const { data, error, isLoading } = useMoralisQuery(
    "seedFundIncreased",
    (query) =>
      // query all
      query.descending("block_number"),
    [limit],
    {
      live: true,
      onLiveEnter: (entity, all) => [...all, entity],
      onLiveCreate: (entity, all) => [...all, entity],
      onLiveDelete: (entity, all) => all.filter((e) => e.id !== entity.id),
      onLiveLeave: (entity, all) => all.filter((e) => e.id !== entity.id),
      onLiveUpdate: (entity, all) => [...all, entity],
    }
  );

  useEffect(async () => {
    fetchFundInfo();
    // Moralis live query can not get synced data, so we need to fetch data manually
  }, [data]);

  const fundInput = (value) => {
    const fundValue = parseFloat(Math.exp(parseFloat(value, 10)).toFixed(1));
    setFund(fundValue);
  };

  const buyContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_PHANTON_ADDRESS,
    functionName: "seedSale",
    msgValue: web3.utils.toWei(fund.toString(), "ether"),
  });

  useEffect(() => {
    console.log(buyContract.data, buyContract.error);
  }, [buyContract.data, buyContract.error]);

  const [loadingBuy, setLoadingBuy] = useState(false);
  const onBuy = async () => {
    setLoadingBuy(true);
    buyContract.runContractFunction().then(async (result) => {
      console.log(buyContract.data);

      if (result === undefined) {
        setLoadingBuy(false);
        fetchFundInfo();
        return;
      }
    });
  };

  useEffect(() => {
    setTokenYouGet(0.1 * maximumSupply * (1 / (fundRaised / 800 + 1) - 1 / ((fund + fundRaised) / 800 + 1)));
  }, [fundRaised, fund]);

  return (
    <div className="text-light col mt-5">
      <h5>Slide or type in the ETH amount you like to invest</h5>
      <div className="row  justify-content-center mt-4 ml-2 mr-2">
        <input
          type="range"
          min="-2"
          max="20"
          step="0.0001"
          value={Math.log(fund)}
          className="custom-range "
          id="slide"
          onChange={(e) => fundInput(e.target.value)}
        />
      </div>
      <div className="row  justify-content-center mt-3  ">
        <input
          type="number"
          className="form-control col-6 rounded"
          id="input"
          placeholder="Enter your ETH"
          value={fund}
          onChange={(e) => setFund(parseFloat(e.target.value))}
        />
        <div type="number" className=" col bg-dark col-3  align-self-end ">
          <h5> ETH </h5>
        </div>
      </div>
      <div className="row  mt-3 ">
        <h6>you will get:</h6>
      </div>
      <div className="row  justify-content-center  ">
        <h6>{tokenYouGet.toLocaleString(undefined, { maximumFractionDigits: 5 })} Phanton</h6>
      </div>

      <div className="row">
        <h6>The maximum supply is capped at:</h6>
      </div>

      <div className="row  justify-content-center  ">
        <h6>{maximumSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })} Phanton</h6>
      </div>
      <div className="row  justify-content-center  ">
        <h6>
          That's {((tokenYouGet / maximumSupply) * 100).toFixed(5)} % maximum supply at market cap of{" "}
          {((fund / tokenYouGet) * maximumSupply).toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH
        </h6>
      </div>
      <div className="row  justify-content-center ">
        <button
          type="button"
          className="btn btn-light rounded"
          // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
          onClick={() => onBuy()}
        >
          {loadingBuy ? (
            <div className="row">
              <div className="spinner-border spinner-border-sm ml-2 mt-1" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <div className="ml-2 mr-2">Buying</div>
            </div>
          ) : (
            <div>Buy</div>
          )}
        </button>
      </div>
      <div className="row  justify-content-center   mt-4 ">
        <h5> The Phanton sale pool is governed by this equation: </h5>
      </div>
      <div className="row  justify-content-center  ">
        <Latex>{String.raw`$ Phanton = \frac {10 \% * T_{max}} {ETH/800 + 1} $ `}</Latex>
      </div>
      <div className="row  justify-content-center  ">
        <Latex>{String.raw`$ T_{max} = $ `}</Latex>
        {maximumSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>

      <div className="row  mt-3">
        <h6>Token sold: </h6>
      </div>

      <div className="row  justify-content-center  ">
        <h6>{tokenSold.toLocaleString(undefined, { maximumFractionDigits: 5 })} Phanton</h6>
      </div>
      <div className="row  ">
        <h6>Fund raised:</h6>
      </div>

      <div className="row  justify-content-center  ">
        <h6>{fundRaised} ETH</h6>
      </div>
    </div>
  );
}
