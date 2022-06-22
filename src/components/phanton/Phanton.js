import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import PhantonBuy from "./PhantonBuy";

export default function Phanton() {
  return (
    <div>
      <Tabs>
        <Tab eventKey="buy" title="Buy" tabClassName="text-light ml-1">
          <PhantonBuy />
        </Tab>
        <Tab eventKey="wallet" title="Wallet" tabClassName="text-light"></Tab>
      </Tabs>
    </div>
  );
}
