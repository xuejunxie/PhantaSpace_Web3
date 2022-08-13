import React, { useEffect, useState, createRef } from "react";
import { useMoralisQuery, useMoralis, useWeb3Contract } from "react-moralis";
import { useDispatch, useSelector } from "react-redux";
import { SHOW_SPACE, SELECT_SPACE, SET_SPACE_TAB, LOAD_USER_BIDS, ASK_USER_TO_CONNECT } from "redux/types";
import abi from "./abi.json";
import { Tab, Tabs } from "react-bootstrap";

const image_server_url = "http://phantaspace.com/thumbnails/";

const opense_asset_url = process.env.REACT_APP_OPENSEA_URL + "/assets/";

const getPermalink = (geocode) => {
  return opense_asset_url + process.env.REACT_APP_CONTRACT_ADDRESS + "/" + geocode;
};

var account;

export default function SpaceAuction() {
  const limit = 10000;
  const [auctionList, setAuctionList] = useState();
  const dispatch = useDispatch();
  const { isAuthenticated, web3, user, refetchUserData } = useMoralis();
  const [bidWarning, setBidWarning] = useState("");
  const [bid, setBid] = useState("0");
  const [cleanBidWei, setCleanBidWei] = useState("0");
  const selected_space = useSelector((state) => state.sidebar.selected_space);
  const [loadingBid, setLoadingBid] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [loadingClaim, setLoadingClaim] = useState(false);
  const userBids = useSelector((state) => state.space.userBids);
  const all_spaces = useSelector((state) => state.space.all);
  const ask_user_to_connect = useSelector((state) => state.sidebar.ask_user_to_connect);
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
      //   account = user.attributes.accounts[0];
      account = user.get("ethAddress");

      //   account = user.attributes.ethAddress;
      const getUserAuction = await user.get("auction");
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
        list.push(auction.attributes); // attributes has auctionEndTime, geocode, highestBid, highestBidder, createdAT, updatedAT, claimed
      });
    }
    setAuctionList(list);
    if (user) {
      await refetchUserData();
      const getUserAuction = await user.get("auction");
      if (getUserAuction && getUserAuction.length > 0) {
        dispatch({ type: LOAD_USER_BIDS, payload: getUserAuction });
      }
    }
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

  const increaseBid = async (userOldBidEther) => {
    setLoadingBid(true);
    if (!isAuthenticated) {
      dispatch({ type: ASK_USER_TO_CONNECT, payload: ask_user_to_connect + 1 });
    }
    bidContract.runContractFunction().then(async (res) => {
      // if (userOldBidEther > 0) {
      //   const userOldBidWei = web3.utils.toWei(userOldBidEther, "ether");
      //   const totalBidWei = new BN(userOldBidWei).add(new BN(cleanBidWei)).toString();
      //   dispatch({ type: UPDATE_USER_BIDS, payload: { geocode: selected_space.geocode, bid: totalBidWei } });
      // } else {
      //   dispatch({ type: ADD_USER_BID, payload: { geocode: selected_space.geocode, bid: cleanBidWei } });
      // }
      console.log("done");

      setLoadingBid(false);
    });
  };

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n.match(/^[0-9]*\.?[0-9]*$/); // '1e2' like number will not pass this test
  }

  useEffect(() => {
    if (isNumeric(bid)) {
      setBidWarning(" ");
      setCleanBidWei(web3.utils.toWei(bid.toString(), "ether"));
    } else {
      if (bid) {
        setBidWarning("Invalid number");
      }
    }
  }, [bid]);

  const withdrawContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "withdraw",
    params: {
      geocode: selected_space ? selected_space.geocode : "",
    },
  });

  const withdraw = async (geocode) => {
    setLoadingWithdraw(true);
    withdrawContract.runContractFunction().then(async (res) => {
      setLoadingWithdraw(false);

      await refetchUserData();
      const getUserAuction = await user.get("auction");
      if (getUserAuction && getUserAuction.length > 0) {
        dispatch({ type: LOAD_USER_BIDS, payload: getUserAuction });
      }
    });
  };

  const claimContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "genesisAuctionEnd",
    params: {
      geocode: selected_space ? selected_space.geocode : "",
    },
  });

  const claim = async (geocode) => {
    setLoadingClaim(true);
    claimContract.runContractFunction().then(async (res) => {
      setLoadingClaim(false);
      dispatch({ type: SET_SPACE_TAB, payload: "owned" });
      // user.set(
      //   "auction",
      //   userBids.map((bid) => {
      //     if (bid.geocode == geocode) {
      //       bid.claimed = true;
      //       return bid;
      //     } else {
      //       return bid;
      //     }
      //   })
      // );
      // user.save();
      await refetchUserData();
      const getUserAuction = await user.get("auction");
      if (getUserAuction && getUserAuction.length > 0) {
        dispatch({ type: LOAD_USER_BIDS, payload: getUserAuction });
      }
    });
  };

  const [key, setKey] = useState("active");

  const getThumbnail = (geocode) => {
    return image_server_url + geocode + ".jpg";
  };

  useEffect(() => {
    if (selected_space && refs[selected_space.geocode]) {
      refs[selected_space.geocode].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selected_space]);

  var refs = {};

  function renderAuctionCard(auction) {
    const geocode = auction.geocode;
    const timeLeft = parseInt(auction.auctionEndTime) - date / 1000;
    const highestBid =
      auction.highestBid !== undefined ? web3.utils.fromWei(auction.highestBid.toString(), "ether") : 0;
    const userBidded = userBids ? userBids.find((bid) => bid.geocode === geocode) : null;
    const userBidEther = userBidded ? web3.utils.fromWei(userBidded.bid, "ether") : 0;
    //   userBids !== undefined ? web3.utils.fromWei(auction.userBidEther.toString(), "ether") : 0;
    //   console.log(auction.highestBidder, account);
    refs[geocode] = createRef();

    return (
      <div className="card  bg-dark" key={geocode} ref={refs[geocode]}>
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
                src={getThumbnail(geocode)}
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

              <h5 className="text-light">
                {timeLeft > 0
                  ? timeString(timeLeft)
                  : userBidded && userBidded.claimed
                  ? "Claimed"
                  : userBidded && userBidded.withdraw
                  ? "Withdrawn"
                  : userBidded && userBidded.bid < highestBid
                  ? "Lost"
                  : "Ended"}
              </h5>
            </div>
          </a>
        </div>
        <div className="collapse" id={"collapse" + geocode} data-parent="#SpaceAuctionAccordion">
          <div className="card card-body bg-dark">
            <div className=" justify-content-center">
              {timeLeft > 0 ? (
                <div className="  justify-content-center">
                  {userBidded && (
                    <div className="row justify-content-center">
                      <div type="number" className="h5 bg-dark mt-1">
                        {userBidEther >= highestBid ? "Your are the highest bidder" : "Your are lossing"}
                      </div>
                      <div type="number" className="h5 bg-dark mt-1">
                        Your bid: {userBidEther} ETH
                      </div>
                    </div>
                  )}
                  <div className="row justify-content-center">
                    <div type="number" className=" bg-dark col h3">
                      {userBidded && "+"}
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
                      <div className="ml-2 mr-2">{userBidded ? "Increase bid" : "Bid"}</div>
                    )}
                  </button>
                </div>
              ) : (
                userBidded &&
                (auction.highestBidder == account ? (
                  userBidded.claimed ? null : (
                    <button type="button" className="  btn btn-light rounded ml-1" onClick={() => claim(geocode)}>
                      {loadingClaim ? (
                        <div className="row">
                          <div className="spinner-border spinner-border-sm mr-1 ml-2 mt-1" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                          <div className="mr-2">Claiming</div>
                        </div>
                      ) : (
                        <div className="ml-2 mr-2">Claim</div>
                      )}
                    </button>
                  )
                ) : userBidded.withdraw ? null : (
                  <button type="button" className="  btn btn-light rounded ml-1" onClick={() => withdraw(geocode)}>
                    {loadingWithdraw ? (
                      <div className="row">
                        <div className="spinner-border spinner-border-sm mr-1 ml-2 mt-1" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <div className="mr-2">Withdrawing</div>
                      </div>
                    ) : (
                      <div className="ml-2 mr-2">Withdraw</div>
                    )}
                  </button>
                ))
              )}
              {auction.claimed && (
                <a href={getPermalink(auction.geocode)} className="text-light  justify-content-center" target="_blank">
                  <button type="button" className="  btn btn-light rounded">
                    See it on Opensea
                  </button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (auctionList && auctionList.length > 0) {
    return (
      <div
        className="bg-dark text-light overflow-auto accordion"
        style={{ maxHeight: "calc(100vh - var(--navBarHeight) - var(--navTabHeight))" }}
        id="SpaceAuctionAccordion"
      >
        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)}>
          <Tab eventKey="active" title="Active" tabClassName="text-light ml-1">
            <div
              className="bg-dark text-light overflow-auto "
              style={{ maxHeight: "calc(100vh - var(--navBarHeight) - 2* var(--navTabHeight))" }}
            >
              {auctionList
                .slice(0)
                .reverse()
                .map((auction) => {
                  const timeLeft = parseInt(auction.auctionEndTime) - date / 1000;
                  if (timeLeft > 0) {
                    return renderAuctionCard(auction);
                  }
                })}
            </div>
          </Tab>

          {isAuthenticated ? (
            <Tab eventKey="bidded" title="Bidded" tabClassName="text-light">
              <div
                className="bg-dark text-light overflow-auto "
                style={{ maxHeight: "calc(100vh - var(--navBarHeight) - 2* var(--navTabHeight))" }}
              >
                {auctionList
                  .slice(0)
                  .reverse()
                  .map((auction) => {
                    const geocode = auction.geocode;

                    if (userBids.find((bid) => bid.geocode == geocode)) {
                      return renderAuctionCard(auction);
                    }
                  })}
              </div>
            </Tab>
          ) : null}
          <Tab eventKey="ended" title="Ended" tabClassName="text-light">
            <div
              className="bg-dark text-light overflow-auto "
              style={{ maxHeight: "calc(100vh - var(--navBarHeight) - 2* var(--navTabHeight))" }}
            >
              {auctionList
                .slice(0)
                .reverse()
                .map((auction) => {
                  const timeLeft = parseInt(auction.auctionEndTime) - date / 1000;
                  if (timeLeft < 0) {
                    return renderAuctionCard(auction);
                  }
                })}
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  } else {
    return <div className="text-light"></div>;
  }
}
