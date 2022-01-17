import React, { useState, useEffect } from "react";
import "./CreateList.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { useMoralis } from "react-moralis";
import { LOAD_OWNED, REMOVE, SELECT, UPDATE, PLACE, DONE } from "../redux/types";

export default function CreateList() {
  const { user } = useMoralis();
  const dispatch = useDispatch();
  const NFTs = useSelector((state) => state.map.owned);
  var account = "";

  // var NFTs = [];
  useEffect(() => {
    async function fetchData() {
      if (1) {
        // account = user.attributes.accounts[0];
        account = "0xe9956cf72cc8e49d903478142dc8dadb4ee328ff";
        var allNFTs = [];
        axios
          .get("https://api.opensea.io/api/v1/assets?owner=" + account)
          .then((res) => {
            allNFTs = res.data.assets;
          })
          .then((res) => {
            if (allNFTs.length > 0) {
              var gltfNFTs = [];
              allNFTs.map((nft) => {
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

                  gltfNFTs.push({
                    metadata: nft,
                    url: url,
                    id: id,
                    selected: false,
                    editing: false,
                    placed: false,
                    longitude: 0,
                    latitude: 0,
                    height: 0,
                    scale: 1,
                    heading: 0,
                    pitch: 0,
                    roll: 0,
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

  const onDone = (nft) => {
    dispatch({ type: DONE, payload: nft });
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

  const height = (data, nft) => {
    nft.height = data * 10;
    dispatch({ type: UPDATE, payload: nft });
  };

  const scale = (data, nft) => {
    nft.scale = data;
    dispatch({ type: UPDATE, payload: nft });
  };

  const heading = (data, nft) => {
    console.log(data);
  };

  const pitch = (data, nft) => {
    console.log(data);
  };

  const roll = (data, nft) => {
    console.log(data);
  };

  return (
    <div className="bg-dark text-light" id="accordionParent">
      {NFTs.map((nft) => {
        return (
          <div className="card  bg-dark" key={nft.id}>
            <div className="card-body text-center ">
              <a
                className="btn rounded-pill"
                data-toggle="collapse"
                href={"#collapse" + nft.id}
                role="button"
                aria-expanded="false"
                aria-controls={"collapse" + nft.id}
                onClick={() => onSelect(nft)}
              >
                <img className="img-thumbnail rounded-pill" src={nft.metadata.image_thumbnail_url} alt="nft" />
              </a>
              <h5 className="text-center ">{nft.name}</h5>
            </div>
            <div className="collapse" id={"collapse" + nft.id} data-parent="#accordionParent">
              {nft.placed ? (
                nft.editing ? (
                  <div className="card card-body bg-dark">
                    <label className="form-label">Height</label>
                    <input
                      type="range"
                      className="custom-range"
                      id="Height"
                      onChange={(e) => height(e.target.value, nft)}
                    />
                    <label className="form-label">Scale</label>
                    <input
                      type="range"
                      className="custom-range"
                      id="Scale"
                      onChange={(e) => scale(e.target.value, nft)}
                    />
                    <label className="form-label">Heading</label>
                    <input
                      type="range"
                      className="custom-range"
                      id="Heading"
                      onChange={(e) => heading(e.target.value, nft)}
                    />
                    <label className="form-label">Pitch</label>
                    <input
                      type="range"
                      className="custom-range"
                      id="Pitch"
                      onChange={(e) => pitch(e.target.value, nft)}
                    />
                    <label className="form-label">Roll</label>
                    <input
                      type="range"
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
                  <div className="row justify-content-center">Double click on the map to locate the NFT</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
