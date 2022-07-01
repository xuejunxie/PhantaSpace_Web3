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
import { PHANTON_TAB, ASK_USER_FOR_EMAIL } from "redux/types";

import ReactECharts from "echarts-for-react";
import Item from "antd/lib/list/Item";

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
  const [inputWarning, setInputWarning] = useState("");

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

  const [boxInput, setBoxInput] = useState("1");
  const [slideInput, setSlideInput] = useState(0);
  const [contractFund, setContractFund] = useState("0");

  useEffect(() => {
    const fundValue = parseFloat(Math.exp(slideInput).toFixed(1));
    setFund(fundValue);
    setBoxInput(fundValue.toString());
    setContractFund(fundValue.toString());
  }, [slideInput]);

  useEffect(() => {
    if (isNumeric(boxInput)) {
      const parsedValue = parseFloat(boxInput);
      if (parsedValue > 0) {
        setFund(parsedValue);
        setContractFund(boxInput);
        if (parsedValue >= 0.1) {
          setSlideInput(Math.log(parsedValue));
        }
      }
    } else {
      if (boxInput) {
        setInputWarning("Invalid number");
        return;
      }
    }
    if (boxInput) {
      setInputWarning("");
    }
  }, [boxInput]);

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n.match(/^[0-9]*\.?[0-9]*$/); // '1e2' like number will not pass this test
  }

  const buyContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_PHANTON_ADDRESS,
    functionName: "seedSale",
    msgValue: web3.utils.toWei(contractFund, "ether"),
  });

  const [loadingBuy, setLoadingBuy] = useState(false);
  const onBuy = async () => {
    setLoadingBuy(true);
    buyContract.runContractFunction().then(async (result) => {
      if (result === undefined) {
        setLoadingBuy(false);
        fetchFundInfo();
        dispatch({ type: PHANTON_TAB, payload: "wallet" });

        return;
      }
    });
  };

  useEffect(() => {
    setTokenYouGet(0.1 * maximumSupply * (1 / (fundRaised / 800 + 1) - 1 / ((fund + fundRaised) / 800 + 1)));
  }, [fundRaised, fund]);

  function phantonToken(x) {
    return (10 / (x / 800 + 1)).toPrecision(3);
  }

  function generateData(min, max) {
    let data = [];
    for (let i = min; i <= max; i += (max - min) / 50) {
      data.push([i.toFixed(0), phantonToken(i)]);
    }
    return data;
  }

  const options = {
    darkMode: true,
    backgroundColor: "#373a3c",
    xAxis: {
      type: "value",
      axisLabel: {
        color: "#fff",
      },
      axisLine: {
        lineStyle: {
          color: "#fff",
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#fff",
          type: "dotted",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#fff",
      },
      axisLine: {
        lineStyle: {
          color: "#fff",
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#fff",
          type: "dotted",
        },
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        return `${params[0].value[1]}% left at<br/>${params[0].value[0]} ETH raised`;
      },
    },
    series: [
      // blue line
      {
        data: generateData(0, Math.max(800, fundRaised + fund)),
        type: "line",
        showSymbol: false,
        lineStyle: {
          color: "#95D2EC",
        },
        markPoint: {
          symbol: "pin",
          data: [
            {
              name: "current position",
              coord: [fundRaised.toString(), phantonToken(fundRaised).toString()],
            },
          ],
          label: {
            formatter: (params) => {
              return "Left";
            },
          },
          itemStyle: {
            color: "#95D2EC",
          },
        },
        animation: false,
      },
      // red line
      {
        name: "%",

        data: generateData(fundRaised, fundRaised + fund),

        type: "line",
        showSymbol: false,
        lineStyle: {
          color: "#FF4242",
        },
        markPoint: {
          symbolRotate: 180,
          data: [
            {
              name: "your position",
              coord: [(fundRaised + fund).toString(), phantonToken(fundRaised + fund).toString()],
            },
          ],
          label: {
            formatter: (params) => {
              return "Buy";
            },
            offset: [0, 12],
          },
          itemStyle: {
            color: "#FF4242",
          },
          animation: false,
        },
        animation: false,
      },
    ],
  };

  return (
    <div className="bg-dark text-light col">
      <a href="https://whitepaper.phanta.space">
        <h5 className="mt-3"> Check out our whitepaper</h5>
      </a>
      <h5 className="mt-2">Slide or type in the ETH amount you like to invest</h5>
      <div className="row  justify-content-center mt-2 ml-2 mr-2">
        <input
          type="range"
          min="-2"
          max="10"
          step="0.001"
          value={slideInput}
          className="custom-range "
          id="slide"
          onChange={(e) => setSlideInput(e.target.value)}
        />
      </div>
      <div className="row  justify-content-center mt-2  ">
        <input
          type="number"
          className="form-control col-6 rounded"
          id="input"
          placeholder="Enter your ETH"
          value={boxInput}
          onChange={(e) => {
            setBoxInput(e.target.value);
          }}
        />
        <div type="number" className=" col bg-dark col-3  align-self-end ">
          <h5> ETH </h5>
        </div>
      </div>
      <div className=" row justify-content-start bg-dark mt-1">
        <div className="col-9 justify-content-center">{inputWarning}</div>
      </div>
      <div className="row  mt-2 ml-1">
        <h5>you will get:</h5>
      </div>
      <div className="row  justify-content-center  ">
        <h5>{tokenYouGet.toLocaleString(undefined, { maximumFractionDigits: 5 })} Phanton</h5>
      </div>

      <div className="row  justify-content-center  ">
        <h5> = {((tokenYouGet / maximumSupply) * 100).toFixed(5)} % x</h5>
      </div>

      <div className="row  justify-content-center  ">
        <h5>{maximumSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })} (maximum)</h5>
      </div>

      <div className="row justify-content-center  ">
        <h5>with a market cap of</h5>
      </div>

      <div className="row justify-content-center  ">
        <h5>{((fund / tokenYouGet) * maximumSupply).toLocaleString(undefined, { maximumFractionDigits: 0 })} ETH</h5>
      </div>

      <div className="row  justify-content-center ">
        <button type="button" className="btn btn-light rounded" onClick={() => onBuy()}>
          {loadingBuy ? (
            <div className="row">
              <div className="spinner-border spinner-border-sm ml-2 mt-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <div className="ml-2 mr-2">Buying</div>
            </div>
          ) : (
            <div>Buy</div>
          )}
        </button>
      </div>
      <div className="row  justify-content-center   mt-2 ">
        <h5>Phanton seed sale pool is governed by this plot: </h5>
      </div>

      <ReactECharts option={options} />
      <div className="row  justify-content-center  ">
        <h5> Formulated as: </h5>
      </div>
      <div className="row  justify-content-center  ">
        <Latex>{String.raw`$ Phanton = \frac {10 \% * T_{max}} {ETH/800 + 1} $ `}</Latex>
      </div>
    </div>
  );
}
