import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Tab, Tabs } from "react-bootstrap";
import { PHANTON } from "redux/types";
import PhantonBuy from "./PhantonBuy";
import PhantonWallet from "./PhantonWallet";

export default function Phanton() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: PHANTON });
  }, []);
  return (
    <div>
      <Tabs>
        <Tab eventKey="buy" title="Buy" tabClassName="text-light ml-1">
          <PhantonBuy />
        </Tab>
        <Tab eventKey="wallet" title="Wallet" tabClassName="text-light">
          <PhantonWallet />
        </Tab>
      </Tabs>
    </div>
  );
}
