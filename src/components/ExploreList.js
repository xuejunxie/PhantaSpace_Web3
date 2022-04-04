import React, { useEffect, createRef } from "react";
import "./CreateList.css";
import { useDispatch, useSelector } from "react-redux";
import { LOOK, EXPLORE } from "../redux/types";
import { useParams } from "react-router-dom";

var refs = {};

export default function ExploreList() {
  const dispatch = useDispatch();
  const NFTid = useParams().NFTid;
  const NFTs = useSelector((state) => state.map.all);
  const click = useSelector((state) => state.map.click);
  const loadingAll = useSelector((state) => state.sidebar.loadingAll);

  useEffect(() => {
    dispatch({ type: EXPLORE });
  }, []);

  useEffect(() => {
    if (NFTid && !loadingAll) {
      dispatch({ type: LOOK, payload: { NFTid: NFTid } });
    }
  }, [NFTid, loadingAll]);

  useEffect(() => {
    if (click) {
      if (refs[click]) {
        refs[click].current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [click]);

  const onSelect = (nft) => {
    dispatch({ type: LOOK, payload: { NFTid: nft.NFTid } });
    window.history.pushState("", "", `#/explore/${nft.NFTid}`);
  };

  return (
    <div className="bg-dark text-light" id="ExploreListAccordion">
      {NFTs.slice(0)
        .reverse()
        .map((nft) => {
          refs[nft.NFTid] = createRef();
          return (
            <div className="card  bg-dark" key={nft.NFTid} ref={refs[nft.NFTid]}>
              <div className="card-body text-center ">
                <a
                  className="btn rounded-pill"
                  data-toggle="collapse"
                  href={"#collapse" + nft.NFTid}
                  role="button"
                  aria-expanded="false"
                  aria-controls={"collapse" + nft.NFTid}
                  onClick={() => onSelect(nft)}
                >
                  {nft.thumbnail ? (
                    <div>
                      <img className="img-thumbnail rounded-pill" src={nft.thumbnail} alt="nft" />
                      <h5 className="text-light">{nft.metadata.name}</h5>
                    </div>
                  ) : (
                    <h5 className="text-light">{nft.metadata.name}</h5>
                  )}
                </a>
                <h5 className="text-center ">{nft.name}</h5>
              </div>
              <div className="collapse" id={"collapse" + nft.NFTid} data-parent="#ExploreListAccordion">
                <a href={nft.metadata.permalink} className="text-light  justify-content-center" target="_blank">
                  {nft.metadata.description ? nft.metadata.description : "Check out the source for description"}
                </a>
              </div>
            </div>
          );
        })}
    </div>
  );
}
