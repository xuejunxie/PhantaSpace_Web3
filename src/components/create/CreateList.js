import React, { useEffect, createRef, useState } from "react";
import "../List.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Moralis from "moralis";
import { useMoralis } from "react-moralis";
import { REMOVE, SELECT, UPDATE, PLACE, DONE, CREATE, LOOK } from "../../redux/types";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;
const dataClass = Moralis.Object.extend("allNFT");
var refs = {};

export default function CreateList() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useMoralis();
  const NFTs = useSelector((state) => state.map.owned);
  const loading = useSelector((state) => state.sidebar.loading);
  const click = useSelector((state) => state.map.click);
  const [videoList, setVideoList] = useState([]);

  // var NFTs = [];
  useEffect(() => {
    dispatch({ type: CREATE, payload: true });
  }, []);

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

  const onDone = async (nft) => {
    dispatch({ type: DONE, payload: nft });
    // create moralis object
    const query = new Moralis.Query(dataClass);
    query.equalTo("NFTid", nft.NFTid);
    const result = await query.find();
    if (result.length > 0) {
      var data = result[0];

      await data.save();
    } else {
      var data = new dataClass();
    }
    var date = new Date().toISOString();

    var created = null;
    var updated = null;
    var removed = "9999-08-02T00:00:00Z";
    if (nft.created) {
      updated = date;
      created = nft.created;
    } else {
      created = date;
    }
    data.set({
      NFTid: nft.NFTid,
      model: nft.model,
      video: nft.video,
      image: nft.image,
      metadata: nft.metadata,
      longitude: nft.longitude,
      latitude: nft.latitude,
      height: nft.height,
      scale: nft.scale,
      heading: nft.heading,
      pitch: nft.pitch,
      wide: nft.wide,
      tall: nft.tall,
      roll: nft.roll,
      placed: true,
      created: created,
      updated: updated,
      removed: removed,
    });

    data.save();
  };

  const onRemove = (nft) => {
    dispatch({ type: REMOVE, payload: nft });
    const query = new Moralis.Query(dataClass);
    query.equalTo("NFTid", nft.NFTid);
    query.find().then((results) => {
      const data = results[0];
      if (data) {
        data.destroy();
      }
    });
  };

  const onSelect = (nft) => {
    dispatch({ type: CREATE, payload: "select" });
    var newNft = { ...nft };

    // test if  the url works or not
    // axios.get(nft.model).then((response) => {
    //   newNft.model = nft.model;
    // });
    // axios.get(nft.metadata.animation_original_url).then((response) => {
    //   newNft.model = nft.metadata.animation_original_url;
    // });
    // axios.get(nft.metadata.animation_url).then((response) => {
    //   newNft.model = nft.metadata.animation_url;
    // });

    const image = new Image();
    image.src = nft.image;
    image.onload = () => {
      newNft.wide = image.width / 100;
      newNft.tall = image.height / 100;
      newNft.height = newNft.tall;
      newNft.placed = true;
      dispatch({ type: LOOK, payload: newNft });
      dispatch({ type: SELECT, payload: newNft });
      if (newNft.video) {
        setVideoList((videoList) => [...videoList, { NFTid: newNft.NFTid, video: newNft.video }]);
      }
    };
  };

  const onEdit = (nft) => {
    dispatch({ type: PLACE, payload: nft });
  };

  const height = (value, nft) => {
    nft.height = Math.exp(parseFloat(value, 10));
    dispatch({ type: UPDATE, payload: nft });
  };

  const scale = (value, nft) => {
    nft.scale = Math.exp(parseFloat(value, 10));
    dispatch({ type: UPDATE, payload: nft });
  };

  const heading = (value, nft) => {
    nft.heading = parseFloat(value, 10);
    dispatch({ type: UPDATE, payload: nft });
  };

  const pitch = (value, nft) => {
    nft.pitch = parseFloat(value, 10);
    dispatch({ type: UPDATE, payload: nft });
  };

  const roll = (value, nft) => {
    nft.roll = parseFloat(value, 10);
    dispatch({ type: UPDATE, payload: nft });
  };

  return (
    <div className="bg-dark text-light" id="CreateListAccordion">
      {NFTs.length > 0 || loading ? (
        NFTs.map((nft) => {
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
                  {nft.image ? (
                    <div>
                      <img className="img-thumbnail rounded-pill" src={nft.image} alt="nft" />
                      <h5 className="text-light">{nft.metadata.name}</h5>
                    </div>
                  ) : (
                    <h5 className="text-light">{nft.metadata.name}</h5>
                  )}
                </a>
              </div>
              <div className="collapse" id={"collapse" + nft.NFTid} data-parent="#CreateListAccordion">
                {nft.placed ? (
                  nft.editing ? (
                    <div className="card card-body bg-dark">
                      <div className="row justify-content-center">
                        Double click on the map to place the NFT. Drag to relocate
                      </div>

                      <label className="form-label mt-1">Height</label>
                      <input
                        type="range"
                        min="-1"
                        max="11"
                        step="0.01"
                        value={Math.log(nft.height)}
                        className="custom-range"
                        id="Height"
                        onChange={(e) => height(e.target.value, nft)}
                      />
                      <label className="form-label">Scale</label>
                      <input
                        type="range"
                        min="-5"
                        max="7"
                        step="0.01"
                        value={Math.log(nft.scale)}
                        className="custom-range"
                        id="Scale"
                        onChange={(e) => scale(e.target.value, nft)}
                      />
                      <label className="form-label">Heading</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={nft.heading}
                        className="custom-range"
                        id="Heading"
                        onChange={(e) => heading(e.target.value, nft)}
                      />
                      <label className="form-label">Pitch</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={nft.pitch}
                        className="custom-range"
                        id="Pitch"
                        onChange={(e) => pitch(e.target.value, nft)}
                      />
                      <label className="form-label">Roll</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={nft.roll}
                        className="custom-range"
                        id="Roll"
                        onChange={(e) => roll(e.target.value, nft)}
                      />
                      <hr />
                      <div className="row justify-content-center">
                        <button type="button" className="  btn btn-light rounded mr-5" onClick={() => onDone(nft)}>
                          Done
                        </button>
                        <button type="button" className="  btn btn-danger rounded" onClick={() => onRemove(nft)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card card-body bg-dark">
                      <div className="row justify-content-center">
                        <button type="button" className="  btn btn-light rounded" onClick={() => onEdit(nft)}>
                          Place
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="card card-body bg-dark">
                    <div className="row justify-content-center">Double click on the map to place the NFT</div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="card card-body bg-dark">
          <div className="row justify-content-center">
            {isAuthenticated ? (
              <h5>Hmmmmm...looks like you don't have NFTs in your wallet.</h5>
            ) : (
              <h5>
                If you connect your wallet, your NFTs will beautifully show up here. Then you can place NFT on the map.
              </h5>
            )}
          </div>
        </div>
      )}
      <div className="card card-body bg-dark">
        <div className="row justify-content-center">
          {loading ? (
            loading === "error" ? (
              <h5>Oops. We got some error on the server side. You may have too many NFTs. Refresh later.</h5>
            ) : (
              <h5> Checking {loading} NFTs from your account</h5>
            )
          ) : null}
        </div>
      </div>
      {videoList.map((item) => {
        return (
          <div
            style={{ display: "none" }} // display none will stop the video from playing
            key={item.NFTid}
            dangerouslySetInnerHTML={{
              __html: `
          <video
            id=${item.NFTid + "-video"}
            muted 
            autoplay
            playsinline
            loop 
            crossorigin="anonymous"
          >
            <source src=${item.video} type="video/mp4" />
          </video>
          `,
            }}
          ></div>
        );
      })}
    </div>
  );
}
