import React, { PureComponent } from "react";
import "./CreateList.css";

import { getDefaultProvider } from "ethers";
import { NftProvider, useNft, FetchWrapper } from "use-nft";

const fetcher = ["ethers", { provider: getDefaultProvider() }];

const fetchWrapper = new FetchWrapper(fetcher);

export default class CreateList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loadNFT: {},
      contractAddress: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
      tokenID: "97681",
    };
  }
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = (e) => {
    e.preventDefault();
  };
  onAdd = (e) => {};

  onLoad = (e) => {
    console.log("loading");
    fetchWrapper
      .fetchNft(this.state.contractAddress, this.state.tokenID)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const addButton = (
      <div className="row justify-content-center">
        <button type="button" className="btn btn-primary btn-circle btn-lg" onClick={this.onAdd}>
          <b>+</b>
        </button>
      </div>
    );
    return (
      <div>
        <form onSubmit={this.onSubmit} className="card p-3 m-3 rounded">
          <div className="form-group">
            <input
              type="text"
              className="form-control rounded"
              name="contractAddress"
              placeholder="Contract address"
              onChange={this.onChange}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control rounded"
              name="tokenID"
              placeholder="Token ID"
              onChange={this.onChange}
            />
          </div>

          <div className="form-group row justify-content-center">
            <button type="load" className="col-auto btn btn-primary rounded m-2" onClick={this.onLoad}>
              load
            </button>
            <button type="submit" className="col-auto btn btn-primary rounded m-2">
              submit
            </button>
            <button type="remove" className="col-auto btn btn-danger rounded m-2">
              remove
            </button>
          </div>
        </form>
        {addButton}
      </div>
    );
  }
}
