import React, { useEffect, useState } from "react";
import { useMoralisQuery, useMoralis, useWeb3Contract } from "react-moralis";
import { useDispatch, useSelector } from "react-redux";
import { SHOW_SPACE, SELECT_SPACE, SET_SPACE_TAB, UPDATE_USER_BIDS, ADD_USER_BID, LOAD_USER_BIDS } from "redux/types";
import abi from "./abi.json";

const imageBaseURL = "http://phantaspace.com/thumbnails/";

var account;

export default function SpaceAuction() {
  const limit = 10000;
  const [auctionList, setAuctionList] = useState();
  const dispatch = useDispatch();
  const { isAuthenticated, web3, user } = useMoralis();
  const [bidWarning, setBidWarning] = useState("");
  const [bid, setBid] = useState("0");
  const [cleanBidWei, setCleanBidWei] = useState("0");
  const selected_space = useSelector((state) => state.sidebar.selected_space);
  const [loadingBid, setLoadingBid] = useState(false);
  const userBids = useSelector((state) => state.space.userBids);
  // deal with time
  var BN = web3.utils.BN;

  const [date, setDate] = useState(new Date());

  function refreshClock() {
    setDate(new Date());
  }

  function timeString(time) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor((time / 60) % 60);
    const hours = Math.floor(time / 60 / 60);

    return `${hours}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    const timerId = setInterval(refreshClock, 1000);
    return function cleanup() {
      clearInterval(timerId);
    };
  }, []);

  // deal with user
  useEffect(async () => {
    if (user) {
      //   account = user.attributes.accounts[0];
      account = user.get("ethAddress");

      //   account = user.attributes.ethAddress;
      const getUserAuction = await user.get("auction");
      console.log(getUserAuction);
      if (getUserAuction && getUserAuction.length > 0) {
        dispatch({ type: LOAD_USER_BIDS, payload: getUserAuction });
      }
    }
  }, [user]);

  // get live with auction list
  const { data, error, isLoading } = useMoralisQuery(
    "auction",
    (query) =>
      // query all
      query.limit(limit),
    [limit],
    {
      live: true,
      onLiveEnter: (entity, all) => [...all, entity],
      onLiveCreate: (entity, all) => [...all, entity],
      onLiveDelete: (entity, all) => all.filter((e) => e.id !== entity.id),
      onLiveLeave: (entity, all) => all.filter((e) => e.id !== entity.id),
      onLiveUpdate: (entity, all) => all.map((e) => (e.id === entity.id ? entity : e)),
    }
  );

  useEffect(async () => {
    const list = [];
    if (data) {
      data.map((auction) => {
        list.push(auction.attributes); // attributes has auctionEndTime, geocode, highestBid, highestBidder, createdAT, updatedAT
      });
    }
    setAuctionList(list);
  }, [data]);

  const onSelect = (geocode) => {
    dispatch({ type: SHOW_SPACE, payload: { geocode: geocode } });
    dispatch({ type: SELECT_SPACE, payload: { geocode: geocode } });
  };

  const bidContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "bid",
    msgValue: cleanBidWei,
    params: {
      geocode: selected_space ? selected_space.geocode : "",
    },
  });

  const increaseBid = async (userBidEther) => {
    setLoadingBid(true);

    bidContract.runContractFunction().then(async (res) => {
      if (userBidEther) {
        const userBidWei = web3.utils.toWei(userBidEther, "ether");
        console.log("userBidWei", userBidWei);
        const newBidInWei = new BN(userBidWei).add(new BN(cleanBidWei)).toString();
        console.log("newBidInWei", newBidInWei);
        dispatch({ type: UPDATE_USER_BIDS, payload: { geocode: selected_space.geocode, bid: newBidInWei } });
      } else {
        dispatch({ type: ADD_USER_BID, payload: { geocode: selected_space.geocode, bid: cleanBidWei } });
      }

      user.set("auction", userBids);
      user.save();
      setLoadingBid(false);
      dispatch({ type: SET_SPACE_TAB, payload: "auction" });
    });
  };

  useEffect(() => {
    if (isNumeric(bid)) {
      setBidWarning(" ");
      setCleanBidWei(web3.utils.toWei(bid.toString(), "ether"));
      const userBidWei = web3.utils.toWei(bid, "ether");
      const newBidInWei = new BN(userBidWei).add(new BN(cleanBidWei)).toString();
      console.log(newBidInWei);
    } else {
      if (bid) {
        setBidWarning("Invalid number");
      }
    }
  }, [bid]);

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n.match(/^[0-9]*\.?[0-9]*$/); // '1e2' like number will not pass this test
  }

  if (auctionList && auctionList.length > 0) {
    return (
      <div
        className="bg-dark text-light overflow-auto accordion"
        style={{ maxHeight: "calc(100vh - var(--navBarHeight) - var(--navTabHeight))" }}
        id="SpaceAuctionAccordion"
      >
        {auctionList
          .slice(0)
          .reverse()
          .map((auction) => {
            const geocode = auction.geocode;
            const timeLeft = parseInt(auction.auctionEndTime) - date / 1000;
            const imageURL = imageBaseURL + geocode + ".jpg";
            const highestBid =
              auction.highestBid !== undefined ? web3.utils.fromWei(auction.highestBid.toString(), "ether") : 0;
            const userBid = userBids ? userBids.find((bid) => bid.geocode === geocode) : null;
            const userBidEther = userBid ? web3.utils.fromWei(userBid.bid, "ether") : 0;
            //   userBids !== undefined ? web3.utils.fromWei(auction.userBidEther.toString(), "ether") : 0;
            //   console.log(auction.highestBidder, account);
            return (
              <div className="card  bg-dark" key={geocode}>
                <div className="card-body text-center ">
                  <a
                    className="btn rounded-pill"
                    data-toggle="collapse"
                    href={"#collapse" + geocode}
                    role="button"
                    aria-expanded="false"
                    aria-controls={"collapse" + geocode}
                    onClick={() => onSelect(geocode)}
                  >
                    <div>
                      <img
                        className="img-thumbnail rounded-pill"
                        src={imageURL}
                        onError={(e) => {
                          e.target.src = "faviconS.gif";
                        }}
                        onLoadStart={(e) => {
                          e.target.src = "faviconS.gif";
                        }}
                        alt="auction"
                      />
                      <h5 className="text-light">{geocode}</h5>
                      <h5 className="text-light">Highest bid: </h5>
                      <h5 className="text-light"> {highestBid} ETH</h5>
                      <h5 className="text-light">{timeLeft > 0 ? timeString(timeLeft) : "Ended"} </h5>
                      <h5 className="text-light">{} </h5>
                    </div>
                  </a>
                </div>
                <div className="collapse" id={"collapse" + geocode} data-parent="#SpaceAuctionAccordion">
                  <div className="card card-body bg-dark">
                    <div className=" justify-content-center">
                      {timeLeft > 0 ? (
                        <div className="  justify-content-center">
                          {userBid && (
                            <div className="row justify-content-center">
                              <div type="number" className="h5 bg-dark mt-1">
                                Your bid: {userBidEther} ETH
                              </div>
                            </div>
                          )}
                          <div className="row justify-content-center">
                            <div type="number" className=" bg-dark col h3">
                              {userBid && "+"}
                            </div>
                            <input
                              type="number"
                              className="form-control col-6 col rounded "
                              id="bid"
                              placeholder="Enter amount"
                              value={bid}
                              onChange={(e) => setBid(e.target.value)}
                            />
                            <div type="number" className="h5 col bg-dark  mt-1">
                              ETH
                            </div>
                          </div>

                          <div className=" row justify-content-start bg-dark mt-1">
                            <div className="col-9 justify-content-center">{bidWarning}</div>
                          </div>
                          <button
                            type="button"
                            className="  btn btn-light rounded mt-1"
                            onClick={() => increaseBid(userBidEther)}
                          >
                            {loadingBid ? (
                              <div className="row">
                                <div className="spinner-border spinner-border-sm mr-1 ml-2 mt-1" role="status">
                                  <span className="sr-only">Loading...</span>
                                </div>
                                <div className="mr-2">Bidding</div>
                              </div>
                            ) : (
                              <div className="ml-2 mr-2">{userBid ? "Increase bid" : "Bid"}</div>
                            )}
                          </button>
                        </div>
                      ) : auction.highestBidder == account ? (
                        <button type="button" className="  btn btn-light rounded ml-1">
                          Claim
                        </button>
                      ) : (
                        <button type="button" className="  btn btn-light rounded ml-1">
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  } else {
    return <div className="text-light">Loading...</div>;
  }
}
