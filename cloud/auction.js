Moralis.Cloud.afterSave("mintedSpaceb", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  const userDatabase = Moralis.Object.extend("_User");

  const query = new Moralis.Query(userDatabase);

  const confirmed = request.object.get("confirmed");

  if (confirmed) {
    logger.info("request address: " + request.object.get("to"));
    query.equalTo("ethAddress", request.object.get("to"));
    const result = await query.find({ useMasterKey: true });
    const user = result[0];
    if (user) {
      user.addUnique("space", request.object.get("geocode"));
      user.save(null, { useMasterKey: true });
    }
  }
});

// Moralis.Cloud.define("test", async (request) => {
//   const logger = Moralis.Cloud.getLogger();
//   logger.info(request);

//   const userDatabase = Moralis.Object.extend("_User");
//   const query = new Moralis.Query(userDatabase);
//   query.equalTo("ethAddress", "0x88c6c24947ff5aaf019026c95d7853878e2517d3");
//   const result = await query.find({ useMasterKey: true });
//   const user = result[0];
//   logger.info("user:" + user);
//   if (user) {
//     user.addUnique("space", "123456781");
//     user.save(null, { useMasterKey: true });
//   }
// });
