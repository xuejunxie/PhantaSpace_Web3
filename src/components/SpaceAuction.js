import React, { useEffect, useState } from "react";
import { useMoralisQuery } from "react-moralis";
import { useDispatch, useSelector } from "react-redux";
import { SHOW_SPACE, SELECT_SPACE, CLEAN_OWNED_SPACE } from "redux/types";
const imageBaseURL = "http://phantaspace.com/thumbnails/";

export default function SpaceAuction() {
  const [limit, setLimit] = useState(10000);
  const [auctionList, setAuctionList] = useState([]);
  const dispatch = useDispatch();

  const { data, error, isLoading } = useMoralisQuery(
    "auction",
    (query) =>
      // query all
      query.limit(limit),
    [limit],
    {
      live: true,
    }
  );

  useEffect(() => {
    console.log("data", data);
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

  return (
    <div className="bg-dark text-light" id="accordionParent">
      {auctionList.map((auction) => {
        return (
          <div className="card  bg-dark" key={auction.geocode}>
            <div className="card-body text-center ">
              <a
                className="btn rounded-pill"
                data-toggle="collapse"
                href={"#collapse" + auction.geocode}
                role="button"
                aria-expanded="false"
                aria-controls={"collapse" + auction.geocode}
                onClick={() => onSelect(auction.geocode)}
              >
                <div>
                  <img
                    className="img-thumbnail rounded-pill"
                    src={imageBaseURL + auction.geocode + ".jpg"}
                    alt="auction"
                  />
                  <h5 className="text-light">{auction.geocode}</h5>
                </div>
              </a>
            </div>
            <div className="collapse" id={"collapse" + auction.geocode} data-parent="#accordionParent">
              <div className="card card-body bg-dark">
                <div className="row justify-content-center">
                  <button type="button" className="  btn btn-light rounded">
                    Bid
                  </button>
                  <button type="button" className="  btn btn-light rounded ml-1">
                    Claim
                  </button>
                  <button type="button" className="  btn btn-light rounded ml-1">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
