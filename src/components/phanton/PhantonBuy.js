import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import MailchimpSubscribe from "react-mailchimp-subscribe";
import { useSelector, useDispatch } from "react-redux";

import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

import { XYChart, BarSeries, CrossHair, XAxis, YAxis, LinearGradient } from "@data-ui/xy-chart";

export default function PhantonBuy() {
  const dispatch = useDispatch();
  const [fund, setFund] = useState(1);
  const [fundRaised, setFundRaised] = useState(0);
  const [tokenSold, setTokenSold] = useState(0);
  const [tokenYouGet, setTokenYouGet] = useState(0);
  const [totalSupply, setTotalSupply] = useState(1);
  const [valuation, setValuation] = useState(1);

  const fundInput = (value) => {
    const fundValue = Math.exp(parseFloat(value, 10)).toFixed(1);
    setFund(fundValue);
  };

  return (
    <div className="text-light col mt-5">
      <h5>Slide or type in the ETH you like to invest</h5>
      <div className="row  justify-content-center mt-4 ml-2 mr-2">
        <input
          type="range"
          min="-1"
          max="20"
          step="0.0001"
          value={Math.log(fund)}
          className="custom-range ml-2 mr-2"
          id="slide"
          onChange={(e) => fundInput(e.target.value)}
        />
      </div>
      <div className="row  justify-content-center   mt-4 ">
        <input
          type="number"
          className="form-control col-6 rounded"
          id="input"
          placeholder="Enter your ETH"
          value={fund}
          onChange={(e) => setFund(e.target.value)}
        />
        <div type="number" className=" col bg-dark col-3  align-self-end ">
          <h5> ETH </h5>
        </div>
      </div>
      <div className="row  justify-content-center   mt-4 ">
        <h5> The Phaton sale pool is governed by this equation: </h5>
      </div>
      <div className="row  justify-content-center  ">
        <Latex>{String.raw`$ Phanton = \frac {10 \% * T_{total}} {ETH/800 + 1} $ `}</Latex>
      </div>
    </div>
  );
}
