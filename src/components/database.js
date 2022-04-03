import React from "react";
import Moralis from "moralis";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;
const userDatabase = Moralis.Object.extend("_User");
const spaceDatabase = Moralis.Object.extend("space");
const auctionDatabase = Moralis.Object.extend("auction");

export function addSpace (address, geocodes) {
    userQuery.equalTo("ethAddress", address);

    // save space to user
    const userQueryResult = await userQuery.find({ useMasterKey: true });
    const user = userQueryResult[0];
    if (user) {
        geocodes.map(async (geocode) => {
                  user.addUnique("space", geocode);
        });
      user.save();
    }

}
