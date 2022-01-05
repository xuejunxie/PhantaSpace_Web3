import React, { PureComponent } from "react";

import { getDefaultProvider } from "ethers";
import { NftProvider, useNft } from "use-nft";

// We are using the "ethers" fetcher here.
const ethersConfig = {
  provider: getDefaultProvider("homestead"),
};

// Alternatively, you can use the "ethereum" fetcher. Note
// that we are using window.ethereum here (injected by wallets
// like MetaMask), but any standard Ethereum provider would work.
// const fetcher = ["ethereum", { ethereum }]

// Wrap your app with <NftProvider />.
function App() {
  return (
    <NftProvider fetcher={["ethers", ethersConfig]}>
      <Nft />
    </NftProvider>
  );
}

// useNft() is now ready to be used in your app. Pass
// the NFT contract and token ID to fetch the metadata.
function Nft() {
  const { loading, error, nft } = useNft("0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405", "97681");

  // nft.loading is true during load.
  if (loading) return <>Loading…</>;

  // nft.error is an Error instance in case of error.
  if (error || !nft) return <>Error.</>;

  // You can now display the NFT metadata.
  return (
    <section>
      <h1>{nft.name}</h1>
      {/* <img src={nft.image} alt="" /> */}
      <p>{nft.description}</p>
      <p>Owner: {nft.owner}</p>
      <p>Metadata URL: {nft.metadataUrl}</p>
    </section>
  );
}

export default class ExploreList extends PureComponent {
  render() {
    return (
      <div>
        <App />
      </div>
    );
  }
}
