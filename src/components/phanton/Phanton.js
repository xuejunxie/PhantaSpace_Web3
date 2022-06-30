import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tab, Tabs } from "react-bootstrap";
import { ASK_USER_FOR_EMAIL, PHANTON, PHANTON_TAB } from "redux/types";
import PhantonBuy from "./PhantonBuy";
import PhantonWallet from "./PhantonWallet";
import { useMoralis } from "react-moralis";

export default function Phanton() {
  const dispatch = useDispatch();
  const phanton_tab = useSelector((state) => state.phanton.phanton_tab);
  const { isAuthenticated, web3, user } = useMoralis();

  useEffect(() => {
    dispatch({ type: PHANTON });
  }, []);

  return (
    <div>
      {isAuthenticated ? (
        <Tabs
          activeKey={phanton_tab}
          onSelect={(k) => {
            dispatch({ type: PHANTON_TAB, payload: k });
          }}
        >
          <Tab eventKey="buy" title="Buy" tabClassName="text-light ml-1">
            <PhantonBuy />
          </Tab>
          <Tab eventKey="wallet" title="Wallet" tabClassName="text-light">
            <PhantonWallet />
          </Tab>
        </Tabs>
      ) : (
        <div className="text-light mt-5">
          <h4>Connect your wallet to buy Phanton</h4>
        </div>
      )}
    </div>
  );
}
