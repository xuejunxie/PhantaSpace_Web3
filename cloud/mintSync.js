const userDatabaseName = "_User";
const logger = Moralis.Cloud.getLogger();

async function saveSpaceToUserAuction(geocode, highestBid, highestBidder) {
  const userDatabase = Moralis.Object.extend(userDatabaseName);
  const userQuery = new Moralis.Query(userDatabase);
  userQuery.equalTo("ethAddress", highestBidder);
  const userQueryResult = await userQuery.find({ useMasterKey: true });
  var user = userQueryResult[0];
  if (user) {
  } else {
    user = new userDatabase();
    user.set("ethAddress", highestBidder);
  }
  const newBid = {
    geocode: geocode,
    bid: highestBid,
  };
  var userAuctions = await user.get("auction");
  if (userAuctions) {
    const userAuctionIndex = userAuctions.findIndex((oldBid) => oldBid.geocode == geocode);
    logger.info(userAuctionIndex);
    if (userAuctionIndex === -1) {
      userAuctions.push(newBid);
    } else {
      userAuctions[userAuctionIndex] = newBid;
    }
  } else {
    userAuctions = [newBid];
  }
  user.set("auction", userAuctions);
  await user.save(null, { useMasterKey: true });
}

async function saveSpaceAuctiontoAuctionList(geocode, highestBid, highestBidder, auctionEndTime) {
  const auctionDatabase = Moralis.Object.extend("auction");
  const auctionQuery = new Moralis.Query(auctionDatabase);
  auctionQuery.equalTo("geocode", geocode);
  const auctionQueryResult = await auctionQuery.find({ useMasterKey: true });
  var auction = auctionQueryResult[0];
  if (auction) {
  } else {
    auction = new auctionDatabase();
    auction.set("geocode", geocode);
  }
  if (auctionEndTime) {
    auction.set("auctionEndTime", parseInt(auctionEndTime));
  }
  auction.set("highestBid", highestBid);
  auction.set("highestBidder", highestBidder);
  await auction.save(null, { useMasterKey: true });
}

async function saveSpaceAuctionToSpaceList(geocode, highestBid, highestBidder, auctionEndTime) {
  const spaceDatabase = Moralis.Object.extend("space");
  const spaceQuery = new Moralis.Query(spaceDatabase);
  spaceQuery.equalTo("geocode", geocode);
  const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
  var space = spaceQueryResult[0];
  if (space) {
  } else {
    space = new spaceDatabase();
    space.set("geocode", geocode);
  }
  if (auctionEndTime) {
    space.set("auctionEndTime", parseInt(auctionEndTime));
  }
  space.set("highestBid", highestBid);
  space.set("highestBidder", highestBidder);
  space.set("confirmed", false);
  await space.save(null, { useMasterKey: true });
}

async function markSpaceConfirmed(geocode) {
  const spaceDatabase = Moralis.Object.extend("space");
  const spaceQuery = new Moralis.Query(spaceDatabase);
  spaceQuery.equalTo("geocode", geocode);
  const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
  var space = spaceQueryResult[0];
  if (space) {
    space.set("confirmed", true);
    await space.save(null, { useMasterKey: true });
  }
}

Moralis.Cloud.afterSave("SpaceMinted", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const userDatabase = Moralis.Object.extend(userDatabaseName);
  const spaceDatabase = Moralis.Object.extend("space");

  const userQuery = new Moralis.Query(userDatabase);

  const confirmed = request.object.get("confirmed");
  const geocode = request.object.get("geocode");
  const owner = request.object.get("to");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));
    userQuery.equalTo("ethAddress", owner);

    // save space to user
    const userQueryResult = await userQuery.find({ useMasterKey: true });
    const user = userQueryResult[0];
    if (user) {
      user.addUnique("space", request.object.get("geocode"));
      user.save(null, { useMasterKey: true });
    }
    // logger.info("space minted: " + request.object.get("geocode"));
    // save space to space table
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    var space = spaceQueryResult[0];
    if (space) {
    } else {
      space = new spaceDatabase();
    }
    space.set("geocode", request.object.get("geocode"));
    space.set("owner", owner);
    space.set("confirmed", false);
    space.save(null, { useMasterKey: true });
  } else {
    // logger.info("confirmed");
    // make space confirmed
    await markSpaceConfirmed(geocode);
  }
});

Moralis.Cloud.beforeSave("AuctionStarted", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const confirmed = request.object.get("confirmed");

  const geocode = request.object.get("geocode");
  const auctionEndTime = request.object.get("auctionEndTime");
  const highestBidder = request.object.get("highestBidder");
  const highestBid = request.object.get("highestBid");

  if (!confirmed) {
    // save space to user auction
    await saveSpaceToUserAuction(geocode, highestBid, highestBidder);

    // save space to space
    table;
    await saveSpaceAuctionToSpaceList(geocode, highestBid, highestBidder, auctionEndTime);

    // save space to auction table
    await saveSpaceAuctiontoAuctionList(geocode, highestBid, highestBidder, auctionEndTime);
  } else {
    // logger.info("confirmed");
    // make space confirmed
    await markSpaceConfirmed(geocode);
  }
});

Moralis.Cloud.afterSave("HighestBidIncreased", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const confirmed = request.object.get("confirmed");
  const geocode = request.object.get("geocode");
  const highestBidder = request.object.get("highestBidder");
  const highestBid = request.object.get("highestBid");
  if (!confirmed) {
    // save space to user auction

    await saveSpaceToUserAuction(geocode, highestBid, highestBidder);

    // update space database
    await saveSpaceAuctionToSpaceList(geocode, highestBid, highestBidder);

    // update auciton database
    await saveSpaceAuctiontoAuctionList(geocode, highestBid, highestBidder);

    // logger.info("space minted: " + geocode);
    // save space to space table
  } else {
    // logger.info("confirmed");
    // make space confirmed
    await markSpaceConfirmed(geocode);
  }
});

Moralis.Cloud.afterSave("AuctionExtended", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const spaceDatabase = Moralis.Object.extend("space");
  const auctionDatabase = Moralis.Object.extend("auction");

  const confirmed = request.object.get("confirmed");
  const geocode = request.object.get("geocode");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", geocode);
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));
      space.set("auctionEndTime", parseInt(request.object.get("newAuctionEndTime")));
      space.set("confirmed", false);
      space.save(null, { useMasterKey: true });
    }

    // update auciton database
    const auctionQuery = new Moralis.Query(auctionDatabase);
    auctionQuery.equalTo("geocode", geocode);
    const auctionQueryResult = await auctionQuery.find({ useMasterKey: true });
    const auction = auctionQueryResult[0];
    if (auction) {
      // logger.info("auction found: " + auction.get("geocode"));
      auction.set("auctionEndTime", parseInt(request.object.get("newAuctionEndTime")));
      auction.save(null, { useMasterKey: true });
    }
    // logger.info("space minted: " + geocode);
    // save space to space table
  } else {
    // logger.info("confirmed");
    // make space confirmed
    await markSpaceConfirmed(geocode);
  }
});

Moralis.Cloud.afterSave("AuctionEnded", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const userDatabase = Moralis.Object.extend(userDatabaseName);
  const spaceDatabase = Moralis.Object.extend("space");
  const auctionDatabase = Moralis.Object.extend("auction");

  const userQuery = new Moralis.Query(userDatabase);

  const confirmed = request.object.get("confirmed");
  const geocode = request.object.get("geocode");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));
    userQuery.equalTo("ethAddress", request.object.get("highestBidder"));

    // save space to user
    const userQueryResult = await userQuery.find({ useMasterKey: true });
    const user = userQueryResult[0];
    if (user) {
      user.addUnique("space", geocode);
      user.save(null, { useMasterKey: true });
    }
    // logger.info("space minted: " + geocode);
    // save space to space table

    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", geocode);
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));

      space.set("owner", request.object.get("highestBidder"));
      space.set("highestBid", request.object.get("highestBid"));
      space.set("confirmed", false);
      space.save(null, { useMasterKey: true });
    }

    // update auciton database
    const auctionQuery = new Moralis.Query(auctionDatabase);
    auctionQuery.equalTo("geocode", geocode);
    const auctionQueryResult = await auctionQuery.find({ useMasterKey: true });
    const auction = auctionQueryResult[0];
    if (auction) {
      // remove this item
      auction.destroy({ useMasterKey: true });
    }
  } else {
    // logger.info("confirmed");
    // make space confirmed
    await markSpaceConfirmed(geocode);
  }
});

Moralis.Cloud.afterSave("Transfer", async (request) => {
  const userDatabase = Moralis.Object.extend(userDatabaseName);
  const spaceDatabase = Moralis.Object.extend("space");
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  // handle from user
  const fromUserAddress = request.object.get("from");
  if (fromUserAddress !== zeroAddress) {
    const fromUserQuery = new Moralis.Query(userDatabase);
    fromUserQuery.equalTo("ethAddress", request.object.get("to"));
    fromUserQuery.equalTo("ethAddress", fromUserAddress);
    const fromUserQueryResult = await fromUserQuery.find({ useMasterKey: true });
    const fromUser = fromUserQueryResult[0];
  }

  // handle space
  const geocode = request.object.get("tokenId");
  const spaceQuery = new Moralis.Query(spaceDatabase);
  spaceQuery.equalTo("geocode", geocode);
  const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
  const space = spaceQueryResult[0];

  // handle to user
  const toUserQuery = new Moralis.Query(userDatabase);
  toUserQuery.equalTo("ethAddress", request.object.get("to"));
  const toUserQueryResult = await toUserQuery.find({ useMasterKey: true });
  const toUser = toUserQueryResult[0];

  const confirmed = request.object.get("confirmed");

  if (confirmed) {
    if (toUser && space) {
      if (fromUserAddress !== zeroAddress) {
        fromUser.remove("space", geocode);
        fromUser.save(null, { useMasterKey: true });
      }
      toUser.addUnique("space", geocode);
      toUser.save(null, { useMasterKey: true });
      space.set("owner", request.object.get("to"));
      space.save(null, { useMasterKey: true });
    }
  }
});

Moralis.Cloud.define("test", async (request) => {
  return request;

  // const logger = Moralis.Cloud.getLogger();
  // logger.info(request);

  // const userDatabase = Moralis.Object.extend("_User");
  // const query = new Moralis.Query(userDatabase);
  // query.equalTo("ethAddress", "0x88c6c24947ff5aaf019026c95d7853878e2517d3");
  // const result = await query.find({ useMasterKey: true });
  // const user = result[0];
  // logger.info("user:" + user);
  // if (user) {
  //   user.addUnique("space", "123456781");
  //   user.save(null, { useMasterKey: true });
  // }
});
