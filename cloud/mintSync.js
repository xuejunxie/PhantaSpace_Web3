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
    const newSpace = new spaceDatabase();
    newSpace.set("geocode", request.object.get("geocode"));
    newSpace.set("owner", request.object.get("to"));
    newSpace.set("confirmed", false);
    newSpace.save(null, { useMasterKey: true });
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

  const confirmed = request.object.get("confirmed");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));

    // logger.info("space minted: " + request.object.get("geocode"));
    // save space to space table
    const newSpace = new spaceDatabase();
    newSpace.set("geocode", request.object.get("geocode"));
    newSpace.set("auctionEndTime", request.object.get("auctionEndTime"));
    newSpace.set("confirmed", false);
    newSpace.save(null, { useMasterKey: true });
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

  const spaceDatabase = Moralis.Object.extend("space");

  const confirmed = request.object.get("confirmed");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));
      space.set("highestBidder", request.object.get("highestBidder"));
      space.set("highestBid", request.object.get("highestBid"));
      space.set("confirmed", false);
      space.save(null, { useMasterKey: true });
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

Moralis.Cloud.afterSave("AuctionExtended", async (request) => {
  // const logger = Moralis.Cloud.getLogger();

  const spaceDatabase = Moralis.Object.extend("space");

  const confirmed = request.object.get("confirmed");

  if (!confirmed) {
    // logger.info("request address: " + request.object.get("to"));
    const spaceQuery = new Moralis.Query(spaceDatabase);
    spaceQuery.equalTo("geocode", request.object.get("geocode"));
    const spaceQueryResult = await spaceQuery.find({ useMasterKey: true });
    const space = spaceQueryResult[0];
    if (space) {
      // logger.info("space found: " + space.get("geocode"));
      space.set("auctionEndTime", request.object.get("newAuctionEndTime"));
      space.set("confirmed", false);
      space.save(null, { useMasterKey: true });
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
