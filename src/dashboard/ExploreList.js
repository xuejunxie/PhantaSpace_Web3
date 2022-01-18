import React, { useEffect, createRef } from "react";
import "./CreateList.css";
import { useDispatch, useSelector } from "react-redux";
import Moralis from "moralis";
import { useMoralis, useNewMoralisObject } from "react-moralis";
import { LOAD_ALL, LOOK } from "../redux/types";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
var refs = {};

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

export default function ExploreList() {
  const { user } = useMoralis();
  const { isSaving, error, save } = useNewMoralisObject("allNFT");
  const dispatch = useDispatch();
  const NFTs = useSelector((state) => state.map.all);
  const click = useSelector((state) => state.map.click);

  console.log(click);

  useEffect(() => {
    async function fetchData() {
      const dataClass = Moralis.Object.extend("allNFT");
      const query = new Moralis.Query(dataClass);
      query.find().then((results) => {
        const allNFT = results.map((item) => item.attributes);
        dispatch({ type: LOAD_ALL, payload: allNFT });
      });
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (click) {
      refs[click].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [click]);

  const onSelect = (nft) => {
    dispatch({ type: LOOK, payload: nft });
  };

  return (
    <div className="bg-dark text-light" id="accordionParent">
      {NFTs.map((nft) => {
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
                <img className="img-thumbnail rounded-pill" src={nft.metadata.image_thumbnail_url} alt="nft" />
              </a>
              <h5 className="text-center ">{nft.name}</h5>
            </div>
            <div className="collapse" id={"collapse" + nft.NFTid} data-parent="#accordionParent">
              <a href={nft.metadata.permalink} className="text-light  justify-content-center" target="_blank">
                {nft.metadata.description}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
