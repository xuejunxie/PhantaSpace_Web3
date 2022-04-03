const Moralis = require("moralis/node");
require("dotenv").config();
const abi = require("../src/components/abi.json").abi;

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
const masterKey = process.env.MORALILS_MASTERKEY;

function pickAbi(name) {
  return abi.find((abi) => abi.name === name);
}

let SpaceMinted = {
  description: "SpaceMinted",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "SpaceMinted(address, uint256)",
  abi: pickAbi("SpaceMinted"),
  limit: 500000,
  tableName: "SpaceMinted",
  sync_historical: false,
};

let AuctionStarted = {
  description: "AuctionStarted",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "AuctionStarted(uint256, uint256)",
  abi: pickAbi("AuctionStarted"),
  limit: 500000,
  tableName: "AuctionStarted",
  sync_historical: false,
};

let AuctionExtended = {
  description: "AuctionExtended",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "AuctionExtended(uint256, uint256)",
  abi: pickAbi("AuctionExtended"),
  limit: 500000,
  tableName: "AuctionExtended",
  sync_historical: false,
};

let AuctionEnded = {
  description: "AuctionEnded",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "AuctionEnded(uint256, address, uint256)",
  abi: pickAbi("AuctionEnded"),
  limit: 500000,
  tableName: "AuctionEnded",
  sync_historical: false,
};

let HighestBidIncreased = {
  description: "HighestBidIncreased",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "HighestBidIncreased(uint256, address, uint256)",
  abi: pickAbi("HighestBidIncreased"),
  limit: 500000,
  tableName: "HighestBidIncreased",
  sync_historical: false,
};

let SubSpaceAuctionAllowed = {
  description: "SubSpaceAuctionAllowed",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "SubSpaceAuctionAllowed(uint256)",
  abi: pickAbi("SubSpaceAuctionAllowed"),
  limit: 500000,
  tableName: "SubSpaceAuctionAllowed",
  sync_historical: false,
};

let SubSpaceAuctionStarted = {
  description: "SubSpaceAuctionStarted",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "SubSpaceAuctionStarted(uint256, uint256)",
  abi: pickAbi("SubSpaceAuctionStarted"),
  limit: 500000,
  tableName: "SubSpaceAuctionStarted",
  sync_historical: false,
};

let Transfer = {
  description: "Transfer",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "Transfer(address, address, uint256)",
  abi: pickAbi("Transfer"),
  limit: 500000,
  tableName: "Transfer",
  sync_historical: false,
};

const main = async () => {
  await Moralis.start({ serverUrl, appId, masterKey });
  //   const result = await Moralis.Cloud.run("test", { data: "test1" }, { useMasterKey: true });
  //   console.log(result);

  //   console.log(pickAbi("AuctionStarted"));

  // Moralis.Cloud.run("unwatchContractEvent", { tableName: "SpaceMinted" }, { useMasterKey: true });
  // Moralis.Cloud.run("unwatchContractEvent", { tableName: "AuctionStarted" }, { useMasterKey: true });
  // Moralis.Cloud.run("unwatchContractEvent", { tableName: "AuctionExtended" }, { useMasterKey: true });
  // Moralis.Cloud.run("unwatchContractEvent", { tableName: "AuctionEnded" }, { useMasterKey: true });
  // Moralis.Cloud.run("unwatchContractEvent", { tableName: "HighestBidIncreased" }, { useMasterKey: true });

  Moralis.Cloud.run("watchContractEvent", SpaceMinted, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", AuctionStarted, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", AuctionExtended, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", AuctionEnded, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", HighestBidIncreased, { useMasterKey: true });
  // Moralis.Cloud.run("watchContractEvent", SubSpaceAuctionAllowed, { useMasterKey: true });
  // Moralis.Cloud.run("watchContractEvent", SubSpaceAuctionStarted, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", Transfer, { useMasterKey: true });
};

main();
