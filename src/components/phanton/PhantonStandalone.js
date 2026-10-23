import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tab, Tabs } from "react-bootstrap";
import { ASK_USER_FOR_EMAIL, PHANTON, PHANTON_TAB } from "redux/types";
import PhantonBuy from "./PhantonBuy";
import PhantonWallet from "./PhantonWallet";
import { useMoralis } from "react-moralis";
import { useAuth } from "../../supabase";
import "../../App.css";
import Account from "../../web3Parts/Account/Account";

export default function PhantonStandalone() {
  const dispatch = useDispatch();
  const phanton_tab = useSelector((state) => state.phanton.phanton_tab);
  const { enableWeb3 } = useMoralis();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    dispatch({ type: PHANTON });
    enableWeb3();
  }, []);

  return (
    <div className="bg-dark">
      <nav
        className="navbar navbar-expand-sm navbar-dark bg-dark justify-content-center"
        style={{ height: "var(--navBarHeight)" }}
      >
        <Account />
      </nav>
      <div className="text-light overflow-auto" style={{ height: "calc(100vh - var(--navBarHeight)" }}>
        {isAuthenticated ? (
          <Tabs
            activeKey={phanton_tab}
            defaultActiveKey="wallet"
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
    </div>
  );
}
