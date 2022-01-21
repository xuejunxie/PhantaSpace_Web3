import React, { useEffect, createRef } from "react";
import "./CreateList.css";
import { useDispatch, useSelector } from "react-redux";
import Moralis from "moralis";
import { useMoralis } from "react-moralis";
import { REMOVE, SELECT, UPDATE, PLACE, DONE, CREATE } from "../redux/types";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;
const dataClass = Moralis.Object.extend("allNFT");
var refs = {};

export default function CreateList() {
  const dispatch = useDispatch();
  const NFTs = useSelector((state) => state.map.owned);
  const loading = useSelector((state) => state.sidebar.loading);
  const click = useSelector((state) => state.map.click);

  // var NFTs = [];
  useEffect(() => {
    dispatch({ type: CREATE });
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

    data.set({
      NFTid: nft.NFTid,
      url: nft.url,
      thumbnail: nft.thumbnail,
      metadata: nft.metadata,
      longitude: nft.longitude,
      latitude: nft.latitude,
      height: nft.height,
      scale: nft.scale,
      heading: nft.heading,
      pitch: nft.pitch,
      roll: nft.roll,
      placed: nft.placed,
    });

    data.save();
  };

  const onRemove = (nft) => {
    dispatch({ type: REMOVE, payload: nft });
    const query = new Moralis.Query(dataClass);
    query.equalTo("NFTid", nft.NFTid);
    query.find().then((results) => {
      const data = results[0];
      data.destroy();
    });
  };

  const onSelect = (nft) => {
    dispatch({ type: SELECT, payload: nft });
  };

  const onEdit = (nft) => {
    dispatch({ type: PLACE, payload: nft });
  };

  const height = (value, nft) => {
    nft.height = parseInt(value, 10);
    dispatch({ type: UPDATE, payload: nft });
  };

  const scale = (value, nft) => {
    nft.scale = parseInt(value, 10);
    dispatch({ type: UPDATE, payload: nft });
  };

  const heading = (value, nft) => {
    nft.heading = parseInt(value, 10);
    dispatch({ type: UPDATE, payload: nft });
  };

  const pitch = (value, nft) => {
    nft.pitch = parseInt(value, 10);
    dispatch({ type: UPDATE, payload: nft });
  };

  const roll = (value, nft) => {
    nft.roll = parseInt(value, 10);
    dispatch({ type: UPDATE, payload: nft });
  };

  return (
    <div className="bg-dark text-light" id="accordionParent">
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
                  <img className="img-thumbnail rounded-pill" src={nft.thumbnail} alt="nft" />
                </a>
                <h5 className="text-center ">{nft.name}</h5>
              </div>
              <div className="collapse" id={"collapse" + nft.NFTid} data-parent="#accordionParent">
                {nft.placed ? (
                  nft.editing ? (
                    <div className="card card-body bg-dark">
                      <div className="row justify-content-center">Click on the map to relocate</div>

                      <label className="form-label">Height</label>
                      <input
                        type="range"
                        min="1"
                        max="5000"
                        value={nft.height}
                        className="custom-range"
                        id="Height"
                        onChange={(e) => height(e.target.value, nft)}
                      />
                      <label className="form-label">Scale</label>
                      <input
                        type="range"
                        min="1"
                        max="500"
                        value={nft.scale}
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
                        <button type="button" className="  btn btn-primary rounded mr-5" onClick={() => onDone(nft)}>
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
                        <button type="button" className="  btn btn-primary rounded" onClick={() => onEdit(nft)}>
                          Edit
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
            <h5>Looks like you don't have NFTs in gltf or glb format in your wallet</h5>
          </div>
        </div>
      )}
      {loading ? (
        <div className="card card-body bg-dark">
          <div className="row justify-content-center">
            Checked {loading} NFTs from your account for gltf or glb files
          </div>
        </div>
      ) : null}
    </div>
  );
}
