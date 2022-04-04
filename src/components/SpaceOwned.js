import React, { useEffect, createRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useMoralis } from "react-moralis";

import { SHOW_SPACE, SELECT_SPACE, CLEAN_OWNED_SPACE, LOAD_OWNED_SPACE } from "redux/types";
import getSpaceByOpensea from "./getSpaceByOpensea";

const image_server_url = "http://phantaspace.com/thumbnails/";

const opense_asset_url = "https://opensea.io/assets/";

const getThumbnail = (geocode) => {
  return image_server_url + geocode + ".jpg";
};

const getPermalink = (geocode) => {
  return opense_asset_url + process.env.REACT_APP_CONTRACT_ADDRESS + "/" + geocode;
};

export default function SpaceOwned() {
  const owned_space = useSelector((state) => state.space.owned);
  const loading = useSelector((state) => state.space.loading);
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useMoralis();
  var refs = {};

  useEffect(() => {
    dispatch({ type: CLEAN_OWNED_SPACE });
  }, []);

  useEffect(async () => {
    if (user) {
      const userSpace = (await user.fetch()).attributes.space;
      if (userSpace) {
        const userSpaceObject = userSpace.map((space) => {
          return { geocode: space };
        });
        dispatch({ type: LOAD_OWNED_SPACE, payload: userSpaceObject });
      }
      // getSpaceByOpensea(account, dispatch);
    }
  }, [user]);

  const onSelect = (geocode) => {
    dispatch({ type: SHOW_SPACE, payload: { geocode: geocode } });
    dispatch({ type: SELECT_SPACE, payload: { geocode: geocode } });
  };

  return (
    <div
      className="bg-dark text-light overflow-auto"
      style={{ maxHeight: "calc(100vh - var(--navBarHeight) - var(--navTabHeight))" }}
      id="SpaceOwnedAccordion"
    >
      {owned_space.length > 0 || loading ? (
        owned_space
          .slice(0)
          .reverse()
          .map((space) => {
            refs[space.geocode] = createRef();

            return (
              <div className="card  bg-dark" key={space.geocode} ref={refs[space.geocode]}>
                <div className="card-body text-center ">
                  <a
                    className="btn rounded-pill"
                    data-toggle="collapse"
                    href={"#collapse" + space.geocode}
                    role="button"
                    aria-expanded="false"
                    aria-controls={"collapse" + space.geocode}
                    onClick={() => onSelect(space.geocode)}
                  >
                    <div>
                      <img
                        className="img-thumbnail rounded-pill"
                        src={getThumbnail(space.geocode)}
                        onError={(e) => {
                          e.target.src = "faviconS.gif";
                        }}
                        onLoadStart={(e) => {
                          e.target.src = "faviconS.gif";
                        }}
                        alt="space"
                      />
                      <h5 className="text-light">{space.geocode}</h5>
                    </div>
                  </a>
                </div>
                <div className="collapse" id={"collapse" + space.geocode} data-parent="#SpaceOwnedAccordion">
                  <div className="card card-body bg-dark">
                    <div className="row justify-content-center">
                      <a
                        href={getPermalink(space.geocode)}
                        className="text-light  justify-content-center"
                        target="_blank"
                      >
                        <button type="button" className="  btn btn-light rounded">
                          See it on Opensea
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
      ) : (
        <div className="card card-body bg-dark">
          <div className="row justify-content-center">
            {isAuthenticated ? (
              <h5>Hmmmmm...looks like you don't have any spaces yet.</h5>
            ) : (
              <h5>If you connect your wallet, your owned spaces will appear here.</h5>
            )}
          </div>
        </div>
      )}
      <div className="card card-body bg-dark">
        <div className="row justify-content-center">
          {loading ? (
            loading === "error" ? (
              <h5>Oops. We got some error on the server side. You may have too many spaces. Refresh later.</h5>
            ) : (
              <h5> Checking {loading} spaces from your account for gltf or glb files</h5>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
