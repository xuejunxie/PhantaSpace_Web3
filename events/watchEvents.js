const Moralis = require("moralis/node");
require("dotenv").config();
const spaceAbi = require("../src/components/space/abi.json").abi;
const phantonAbi = require("../src/components/phanton/abi.json").abi;
const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
const masterKey = process.env.MORALILS_MASTERKEY;

function pickSpaceAbi(name) {
  return spaceAbi.find((abi) => abi.name === name);
}

function pickPhantonAbi(name) {
  return phantonAbi.find((abi) => abi.name === name);
}

let SpaceMinted = {
  description: "SpaceMinted",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "SpaceMinted(address, uint256)",
  abi: pickSpaceAbi("SpaceMinted"),
  limit: 500000,
  tableName: "SpaceMinted",
  sync_historical: false,
};

let AuctionStarted = {
  description: "AuctionStarted",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "AuctionStarted(uint256, uint256, uint256, address)",
  abi: pickSpaceAbi("AuctionStarted"),
  limit: 500000,
  tableName: "AuctionStarted",
  sync_historical: false,
};

let AuctionExtended = {
  description: "AuctionExtended",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "AuctionExtended(uint256, uint256)",
  abi: pickSpaceAbi("AuctionExtended"),
  limit: 500000,
  tableName: "AuctionExtended",
  sync_historical: false,
};

let AuctionEnded = {
  description: "AuctionEnded",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "AuctionEnded(uint256, address, uint256)",
  abi: pickSpaceAbi("AuctionEnded"),
  limit: 500000,
  tableName: "AuctionEnded",
  sync_historical: false,
};

let withDrawalRequested = {
  description: "withDrawalRequested",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "withDrawalRequested(uint256, address, uint256)",
  abi: pickSpaceAbi("withDrawalRequested"),
  limit: 500000,
  tableName: "withDrawalRequested",
  sync_historical: false,
};

let HighestBidIncreased = {
  description: "HighestBidIncreased",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "HighestBidIncreased(uint256, address, uint256)",
  abi: pickSpaceAbi("HighestBidIncreased"),
  limit: 500000,
  tableName: "HighestBidIncreased",
  sync_historical: false,
};

let SubSpaceAuctionAllowed = {
  description: "SubSpaceAuctionAllowed",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "SubSpaceAuctionAllowed(uint256)",
  abi: pickSpaceAbi("SubSpaceAuctionAllowed"),
  limit: 500000,
  tableName: "SubSpaceAuctionAllowed",
  sync_historical: false,
};

let Transfer = {
  description: "Transfer",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_CONTRACT_ADDRESS,
  topic: "Transfer(address, address, uint256)",
  abi: pickSpaceAbi("Transfer"),
  limit: 500000,
  tableName: "Transfer",
  sync_historical: false,
};

let seedFund = {
  description: "seedFund",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_PHANTON_ADDRESS,
  topic: "seedFund(address, uint256, uint256)",
  abi: pickPhantonAbi("seedFund"),
  limit: 500000,
  tableName: "seedFund",
  sync_historical: false,
};

let tokenMinted = {
  description: "tokenMinted",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_PHANTON_ADDRESS,
  topic: "tokenMinted(address, uint256, uint256)",
  abi: pickPhantonAbi("tokenMinted"),
  limit: 500000,
  tableName: "tokenMinted",
  sync_historical: false,
};

let totalSupplyIncreased = {
  description: "totalSupplyIncreased",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_PHANTON_ADDRESS,
  topic: "totalSupplyIncreased(uint256)",
  abi: pickPhantonAbi("totalSupplyIncreased"),
  limit: 500000,
  tableName: "totalSupplyIncreased",
  sync_historical: false,
};

let seedFundIncreased = {
  description: "seedFundIncreased",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_PHANTON_ADDRESS,
  topic: "seedFundIncreased(uint256)",
  abi: pickPhantonAbi("seedFundIncreased"),
  limit: 500000,
  tableName: "seedFundIncreased",
  sync_historical: false,
};

let seedTokenSoldIncreased = {
  description: "seedTokenSoldIncreased",
  chainId: process.env.CHAIN_ID,
  address: process.env.REACT_APP_PHANTON_ADDRESS,
  topic: "seedTokenSoldIncreased(uint256)",
  abi: pickPhantonAbi("seedTokenSoldIncreased"),
  limit: 500000,
  tableName: "seedTokenSoldIncreased",
  sync_historical: false,
};

const main = async () => {
  await Moralis.start({ serverUrl, appId, masterKey });
  //   const result = await Moralis.Cloud.run("test", { data: "test1" }, { useMasterKey: true });
  //   console.log(result);

  //   console.log(pickSpaceAbi("AuctionStarted"));

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
  Moralis.Cloud.run("watchContractEvent", SubSpaceAuctionAllowed, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", Transfer, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", withDrawalRequested, { useMasterKey: true });

  Moralis.Cloud.run("watchContractEvent", seedFund, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", tokenMinted, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", totalSupplyIncreased, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", seedFundIncreased, { useMasterKey: true });
  Moralis.Cloud.run("watchContractEvent", seedTokenSoldIncreased, { useMasterKey: true });
};

main();
