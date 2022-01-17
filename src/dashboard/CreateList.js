import React, { useState, useEffect } from "react";
import "./CreateList.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import Moralis from "moralis";
import { useMoralis } from "react-moralis";
import { LOAD_OWNED, REMOVE, SELECT, UPDATE, PLACE, DONE, LOAD_ALL } from "../redux/types";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

export default function CreateList() {
  const { user } = useMoralis();
  const dispatch = useDispatch();
  const NFTs = useSelector((state) => state.map.owned);
  const allNFTs = useSelector((state) => state.map.all);
  var account = "";

  // var NFTs = [];
  useEffect(() => {
    async function fetchData() {
      if (allNFTs.length === 0) {
        const dataClass = Moralis.Object.extend("allNFT");
        const query = new Moralis.Query(dataClass);
        query.find().then((results) => {
          const allNFT = results.map((item) => item.attributes);
          dispatch({ type: LOAD_ALL, payload: allNFT });
        });
      }

      if (user) {
        account = user.attributes.accounts[0];
        // account = "0xe9956cf72cc8e49d903478142dc8dadb4ee328ff";
        var ownedNFTs = [];
        axios
          .get("https://api.opensea.io/api/v1/assets?owner=" + account)
          .then((res) => {
            ownedNFTs = res.data.assets;
          })
          .then((res) => {
            if (ownedNFTs.length > 0) {
              var gltfNFTs = [];
              ownedNFTs.map((nft) => {
                var url = null;
                // find the glb gltf URL in description of the NFT
                var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
                if (nft.description) {
                  var urls = nft.description.match(urlRegex);
                  if (urls) {
                    urls.map((resUrl) => {
                      if (resUrl.includes(".glb") || resUrl.includes(".gltf")) {
                        url = resUrl;
                      }
                    });
                  }
                }

                // find the glb gltf URL in animation_url of the NFT
                if (nft.animation_url) {
                  if (nft.animation_url.includes(".glb") || nft.animation_url.includes(".gltf")) {
                    url = nft.animation_url;
                  }
                }
                if (url) {
                  const id = nft.asset_contract.address + "-" + nft.token_id;
                  const existingNFT = allNFTs.find((nft) => nft.NFTid === id);
                  gltfNFTs.push({
                    metadata: nft,
                    url: url,
                    NFTid: id,
                    selected: false,
                    editing: false,
                    placed: existingNFT ? true : false,
                    longitude: existingNFT ? existingNFT.longitude : 0,
                    latitude: existingNFT ? existingNFT.latitude : 0,
                    height: existingNFT ? existingNFT.height : 0,
                    scale: existingNFT ? existingNFT.scale : 100,
                    heading: existingNFT ? existingNFT.heading : 0,
                    pitch: existingNFT ? existingNFT.pitch : 0,
                    roll: existingNFT ? existingNFT.roll : 0,
                  });
                }
              });

              dispatch({ type: LOAD_OWNED, payload: gltfNFTs });
            }
          });

        // wash NFTs and add to redux
      }
    }
    fetchData();
  }, [user]);

  const onDone = async (nft) => {
    dispatch({ type: DONE, payload: nft });
    // create moralis object
    const dataClass = Moralis.Object.extend("allNFT");
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
      {NFTs.map((nft) => {
        return (
          <div className="card  bg-dark" key={nft.NFTid}>
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
      })}
    </div>
  );
}
