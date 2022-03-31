import React, { useEffect, createRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useMoralis } from "react-moralis";

import { SHOW_SPACE, SELECT_SPACE, CLEAN_OWNED_SPACE } from "redux/types";
import getSpaceByOpensea from "./getSpaceByOpensea";

export default function SpaceOwned() {
  const owned_space = useSelector((state) => state.space.owned);
  const loading = useSelector((state) => state.space.loading);
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useMoralis();
  var refs = {};

  useEffect(() => {
    dispatch({ type: CLEAN_OWNED_SPACE });
    if (user) {
      const account = user.attributes.accounts[0];
      getSpaceByOpensea(account, dispatch);
    }
  }, []);

  const onSelect = (tokenID) => {
    dispatch({ type: SHOW_SPACE, payload: { geocode: tokenID } });
    dispatch({ type: SELECT_SPACE, payload: { geocode: tokenID } });
  };

  return (
    <div className="bg-dark text-light" id="accordionParent">
      {owned_space.length > 0 || loading ? (
        owned_space.map((space) => {
          refs[space.token_id] = createRef();

          return (
            <div className="card  bg-dark" key={space.token_id} ref={refs[space.token_id]}>
              <div className="card-body text-center ">
                <a
                  className="btn rounded-pill"
                  data-toggle="collapse"
                  href={"#collapse" + space.token_id}
                  role="button"
                  aria-expanded="false"
                  aria-controls={"collapse" + space.token_id}
                  onClick={() => onSelect(space.token_id)}
                >
                  {space.image_url ? (
                    <div>
                      <img className="img-thumbnail rounded-pill" src={space.image_url} alt="space" />
                      <h5 className="text-light">{space.token_id}</h5>
                    </div>
                  ) : (
                    <h5 className="text-light">{space.token_id}</h5>
                  )}
                </a>
              </div>
              <div className="collapse" id={"collapse" + space.token_id} data-parent="#accordionParent">
                <div className="card card-body bg-dark">
                  <div className="row justify-content-center">
                    <a href={space.permalink} className="text-light  justify-content-center" target="_blank">
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
