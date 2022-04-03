const userDatabaseName = "_User";

Moralis.Cloud.afterSave("SpaceMinted", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const userDatabase = Moralis.Object.extend(userDatabaseName);
  const spaceDatabase = Moralis.Object.extend("space");

  const userQuery = new Moralis.Query(userDatabase);

  const confirmed = request.object.get("confirmed");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));
    userQuery.equalTo("ethAddress", request.object.get("to"));

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
    space.set("owner", request.object.get("to"));
    space.set("confirmed", false);
    space.save(null, { useMasterKey: true });
  } else {
    // logger.info("confirmed");
    // make space confirmed
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));
      space.set("confirmed", true);
      space.save(null, { useMasterKey: true });
    }
  }
});

Moralis.Cloud.afterSave("AuctionStarted", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const spaceDatabase = Moralis.Object.extend("space");
  const auctionDatabase = Moralis.Object.extend("auction");

  const confirmed = request.object.get("confirmed");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));

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
    space.set("auctionEndTime", parseInt(request.object.get("auctionEndTime")));
    space.set("confirmed", false);
    space.save(null, { useMasterKey: true });

    // update auciton database
    const auctionQuery = new Moralis.Query(auctionDatabase);
    auctionQuery.equalTo("geocode", request.object.get("geocode"));
    const auctionQueryResult = await auctionQuery.find({ useMasterKey: true });
    var auction = auctionQueryResult[0];
    if (auction) {
    } else {
      auction = new auctionDatabase();
    }

    auction.set("geocode", request.object.get("geocode"));
    auction.set("highestBidder", request.object.get("highestBidder"));
    auction.set("highestBid", request.object.get("highestBid"));
    auction.save(null, { useMasterKey: true });
  } else {
    // logger.info("confirmed");
    // make space confirmed
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));
      space.set("confirmed", true);
      space.save(null, { useMasterKey: true });
    }
  }
});

Moralis.Cloud.afterSave("HighestBidIncreased", async (request) => {
  // const logger = Moralis.Cloud.getLogger();
  const userQuery = new Moralis.Query(userDatabase);
  const spaceDatabase = Moralis.Object.extend("space");
  const auctionDatabase = Moralis.Object.extend("auction");

  const confirmed = request.object.get("confirmed");

  if (!confirmed) {
    // update space database
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      space.set("highestBidder", request.object.get("highestBidder"));
      space.set("highestBid", request.object.get("highestBid"));
      space.set("confirmed", false);
      space.save(null, { useMasterKey: true });
    }

    // update auciton database
    const auctionQuery = new Moralis.Query(auctionDatabase);
    auctionQuery.equalTo("geocode", request.object.get("geocode"));
    const auctionQueryResult = await auctionQuery.find({ useMasterKey: true });
    var auction = auctionQueryResult[0];
    if (auction) {
    } else {
      auction = new auctionDatabase();
    }

    auction.set("geocode", request.object.get("geocode"));
    auction.set("highestBidder", request.object.get("highestBidder"));
    auction.set("highestBid", request.object.get("highestBid"));
    auction.save(null, { useMasterKey: true });

    // logger.info("space minted: " + request.object.get("geocode"));
    // save space to space table
  } else {
    // logger.info("confirmed");
    // make space confirmed
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));
      space.set("confirmed", true);
      space.save(null, { useMasterKey: true });
    }
  }
});

Moralis.Cloud.afterSave("AuctionExtended", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const spaceDatabase = Moralis.Object.extend("space");
  const auctionDatabase = Moralis.Object.extend("auction");

  const confirmed = request.object.get("confirmed");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
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
    auctionQuery.equalTo("geocode", request.object.get("geocode"));
    const auctionQueryResult = await auctionQuery.find({ useMasterKey: true });
    const auction = auctionQueryResult[0];
    if (auction) {
      // logger.info("auction found: " + auction.get("geocode"));
      auction.set("auctionEndTime", parseInt(request.object.get("newAuctionEndTime")));
      auction.save(null, { useMasterKey: true });
    }
    // logger.info("space minted: " + request.object.get("geocode"));
    // save space to space table
  } else {
    // logger.info("confirmed");
    // make space confirmed
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));
      space.set("confirmed", true);
      space.save(null, { useMasterKey: true });
    }
  }
});

Moralis.Cloud.afterSave("AuctionEnded", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const userDatabase = Moralis.Object.extend(userDatabaseName);
  const spaceDatabase = Moralis.Object.extend("space");
  const auctionDatabase = Moralis.Object.extend("auction");

  const userQuery = new Moralis.Query(userDatabase);

  const confirmed = request.object.get("confirmed");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));
    userQuery.equalTo("ethAddress", request.object.get("highestBidder"));

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
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));

      space.set("geocode", request.object.get("geocode"));
      space.set("owner", request.object.get("highestBidder"));
      space.set("highestBid", request.object.get("highestBid"));
      space.set("confirmed", false);
      space.save(null, { useMasterKey: true });
    }

    // update auciton database
    const auctionQuery = new Moralis.Query(auctionDatabase);
    auctionQuery.equalTo("geocode", request.object.get("geocode"));
    const auctionQueryResult = await auctionQuery.find({ useMasterKey: true });
    const auction = auctionQueryResult[0];
    if (auction) {
      // remove this item
      auction.destroy({ useMasterKey: true });
    }
  } else {
    // logger.info("confirmed");
    // make space confirmed
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));
      space.set("confirmed", true);
      space.save(null, { useMasterKey: true });
    }
  }
});

Moralis.Cloud.afterSave("Transfer", async (request) => {
  const userDatabase = Moralis.Object.extend(userDatabaseName);
  const spaceDatabase = Moralis.Object.extend("space");

  const toUserQuery = new Moralis.Query(userDatabase);
  toUserQuery.equalTo("ethAddress", request.object.get("to"));

  const fromUserQuery = new Moralis.Query(userDatabase);
  fromUserQuery.equalTo("ethAddress", request.object.get("from"));

  const geocode = request.object.get("tokenId");
  const spaceQuery = new Moralis.Query(spaceDatabase);
  spaceQuery.equalTo("geocode", geocode);

  const toUserQueryResult = await toUserQuery.find({ useMasterKey: true });
  const fromUserQueryResult = await fromUserQuery.find({ useMasterKey: true });
  const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });

  const toUser = toUserQueryResult[0];
  const fromUser = fromUserQueryResult[0];
  const space = spaceQueryResult[0];

  const confirmed = request.object.get("confirmed");

  if (confirmed) {
    if (toUser && space) {
      toUser.addUnique("space", geocode);
      toUser.save(null, { useMasterKey: true });
      fromUser.remove("space", geocode);
      fromUser.save(null, { useMasterKey: true });
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
