import React, { useEffect, useState } from "react";
import { useMoralisQuery, useMoralis, useWeb3Contract } from "react-moralis";
import { useDispatch, useSelector } from "react-redux";
import { SHOW_SPACE, SELECT_SPACE, CLEAN_OWNED_SPACE } from "redux/types";
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
  const [cleanBid, setCleanBid] = useState("0");
  const selected_space = useSelector((state) => state.sidebar.selected_space);
  const [loadingBid, setLoadingBid] = useState(false);
  const [userBids, setUserBids] = useState([]);
  // deal with time
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
      account = user.attributes.accounts[0];
      //   account = user.attributes.ethAddress;
      setUserBids(user.get("auction"));
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
    msgValue: web3.utils.toWei(cleanBid, "ether"),
    params: {
      geocode: selected_space ? selected_space.geocode : "",
    },
  });

  const increaseBid = async (currentUserBid) => {
    console.log(selected_space.geocode);
    setLoadingBid(true);
    bidContract.runContractFunction().then(async (res) => {
      console.log(res);
      const newUserBids = userBids.map((bid) => {
        if (bid.geocode === selected_space.geocode) {
          const newBid = parseFloat(currentUserBid) + parseFloat(cleanBid);
          bid.bid = web3.utils.toWei(newBid.toFixed(10).toString(), "ether");
        }
        return bid;
      });
      console.log("newUserBids", newUserBids);
      setUserBids(newUserBids);
      user.set("auction", newUserBids);
      user.save();
      setLoadingBid(false);
    });
  };

  useEffect(() => {
    if (isNumeric(bid)) {
      setBidWarning(" ");
      setCleanBid(bid.toString());
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
            const currentUserBid = web3.utils.fromWei(userBids.find((bid) => bid.geocode === geocode).bid, "ether");
            //   userBids !== undefined ? web3.utils.fromWei(auction.currentUserBid.toString(), "ether") : 0;
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
                          {currentUserBid ? (
                            <div className="row justify-content-center">
                              <div type="number" className="h5 bg-dark mt-1">
                                Your bid: {currentUserBid} ETH
                              </div>
                            </div>
                          ) : null}
                          <div className="row justify-content-center">
                            <div type="number" className=" bg-dark col h3">
                              +
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
                            onClick={() => increaseBid(currentUserBid)}
                          >
                            {loadingBid ? (
                              <div className="row">
                                <div className="spinner-border spinner-border-sm mr-1 ml-2 mt-1" role="status">
                                  <span className="sr-only">Loading...</span>
                                </div>
                                <div className="mr-2">Bidding</div>
                              </div>
                            ) : (
                              <div className="ml-2 mr-2">Increase bid</div>
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
