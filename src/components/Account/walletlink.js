// TypeScript
import WalletLink from "walletlink";
import Web3 from "web3";

const APP_NAME = "PhantaSpace";
const APP_LOGO_URL = "";
const ETH_JSONRPC_URL = "https://speedy-nodes-nyc.moralis.io/916f9996703e890373b4fc5c/eth/mainnet";
const CHAIN_ID = 1;

export const customEnable = async () => {
  class MoralisWalletLinkProvider {
    walletLink = new WalletLink({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL,
      darkMode: false,
    });

    async activate() {
      window.ethereum = this.walletLink.makeWeb3Provider(ETH_JSONRPC_URL, CHAIN_ID);
      await window.ethereum.enable(); // or ethereum.send('eth_requestAccounts')
      this.web3 = new Web3(window.ethereum);
      this.isActivated = true;
      return this.web3;
    }
  }

  const web3Provider = new MoralisWalletLinkProvider();
  const web3 = await web3Provider.activate();
  return web3;
};
