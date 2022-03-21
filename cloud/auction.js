Moralis.Cloud.define("test", async (request) => {
  const test = await Moralis.Plugins.opensea.getAsset({
    network: "testnet",
    tokenAddress: "0x943b891c56f950d36126114eb37b954ea8ffa9d2",
    tokenId: "13130710591",
  });
  return test;
});
