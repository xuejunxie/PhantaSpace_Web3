# PhantaSpace 🌍

**An earth-scale mixed reality (MR) metaverse built on Web3.**

PhantaSpace is an open metaverse infrastructure layer that maps digital ownership onto the physical world. Artists, collectors, and brands can place Non-Fungible Token (NFT) galleries on a 3D globe, earn crypto rewards through real-world check-ins, and own parcels of virtual space as on-chain NFTs — all browsable in a web app today and in Augmented Reality (AR) tomorrow.

![PhantaSpace banner](public/banner.png)

---

## ✨ Features

### 🗺️ Earth-Scale NFT Gallery
Browse a Cesium-powered 3D globe where any NFT can be pinned to a real-world coordinate. Place your artwork, discover what others have placed nearby, and navigate in first-person view (FPV).

### 🏠 Space NFTs — Own a Piece of the World
Every location on the map can be claimed as a Space NFT. Spaces are addressed with a unique 3D geocode and can be subdivided at any scale. Spaces are minted via an on-chain auction and live on Ethereum Mainnet (OpenSea compatible).

### 🪙 Phanton Token — Utility & Rewards
Phanton is the ecosystem utility token. It powers:
- **Check-in-to-earn** — visit locations in real life to earn Phanton
- **NFT display ranking** — stake Phanton to boost visibility
- **Space rent** — space owners collect rent from NFTs placed in their space
- **Marketplace rewards** — earn Phanton for buying, selling, and placing NFTs

### 🛒 NFT Marketplace
Buy and sell NFTs directly inside PhantaSpace. The marketplace integrates with OpenSea (Ethereum & Polygon) via the OpenSea API and supports MetaMask, WalletConnect, and Coinbase Wallet.

### 🧱 Block Placement System
Users can place colored blocks (P1–P4 tiers) anywhere on the map. Placement rate and privileges scale with tier. Space owners have unlimited block placement in their own space.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 17, Redux, React Router 6 |
| 3D Globe | [CesiumJS](https://cesium.com/) + [Resium](https://resium.reearth.io/) |
| Web3 / Auth | [Moralis v1](https://moralis.io/), web3.js |
| NFT data | OpenSea API (Ethereum + Polygon), Moralis NFT API |
| Smart contracts | Hardhat (Solidity) |
| Wallet support | MetaMask, WalletConnect, WalletLink (Coinbase) |
| UI components | Ant Design, React-Bootstrap |
| Backend / sync | Moralis Cloud Functions, event watcher (`events/watchEvents.js`) |
| Mint sync | Cloud function (`cloud/mintSync.js`) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 16
- A Moralis v1 account ([legacy.moralis.io](https://legacy.moralis.io)) with an app created
- MetaMask or another Web3 wallet

### Installation

```bash
git clone https://github.com/<your-org>/PhantaSpace_Web3.git
cd PhantaSpace_Web3
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `REACT_APP_MORALIS_APPLICATION_ID` | Your Moralis app ID |
| `REACT_APP_MORALIS_SERVER_URL` | Your Moralis server URL |
| `REACT_APP_OPENSEA_API_URL` | OpenSea API endpoint |
| `REACT_APP_CONTRACT_ADDRESS` | Deployed Space NFT contract address |

> **Note:** Never commit `.env` to version control. It is already listed in `.gitignore`.

### Run Locally

```bash
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

Output is written to `build/`.

### Deploy to GitHub Pages

```bash
npm run deploypage
```

---

## 📁 Project Structure

```
PhantaSpace_Web3/
├── public/               # Static assets (favicon, banner, index.html)
├── src/
│   ├── components/
│   │   ├── create/       # NFT placement / creation flow
│   │   ├── explore/      # Explore / browse NFTs on the map
│   │   ├── getAssets/    # OpenSea & Moralis NFT fetch helpers
│   │   ├── jumpIn/       # FPV jump-in navigation
│   │   ├── phanton/      # Phanton token UI (wallet, buy, stake)
│   │   ├── place/        # Block placement system
│   │   ├── space/        # Space NFT (mint, auction, owned)
│   │   └── spaceNFT/     # Space-scoped NFT display
│   ├── redux/            # Redux store, reducers, action types
│   ├── web3Parts/        # Wallet connection (Account, WalletConnect)
│   ├── hooks/            # Custom React hooks (ERC-20, IPFS, token price…)
│   ├── helpers/          # Formatters, network config
│   ├── App.jsx           # Root component & routing
│   └── index.js          # Entry point
├── cloud/
│   └── mintSync.js       # Moralis Cloud Function — sync mint events
├── events/
│   └── watchEvents.js    # Moralis event watcher setup
├── docs/                 # GitBook documentation source
└── package.json
```

---

## 🔗 Smart Contracts

Smart contracts are managed with **Hardhat**. Contract Application Binary Interface (ABI) files live alongside their components:

| Contract | ABI location |
|---|---|
| Space NFT | `src/components/space/abi.json` |
| NFT Marketplace (explore) | `src/components/explore/abi.json` |
| NFT Placement (create) | `src/components/create/abi.json` |
| Phanton Token | `src/components/phanton/abi.json` |

Contract addresses are supplied via environment variables (see above).

---

## 🛠️ Development Scripts

| Script | Description |
|---|---|
| `npm start` | Start local dev server (port 3000) |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run connect` | Connect local dev chain to Moralis |
| `npm run watch:events` | Register contract event listeners on Moralis |
| `npm run deploypage` | Deploy `build/` to GitHub Pages |
| `npm run clean` | Clean GitHub Pages cache |

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODING_STYLE.md](CODING_STYLE.md) before submitting a pull request.

1. Fork the repository and create a feature branch from `main`.
2. Ensure your code passes ESLint and is formatted with Prettier.
3. Open a pull request with a clear description of the change.

---

## 📄 License

MIT License — see [LICENSE.md](LICENSE.md) for details.

---

## 🌐 Links

- **Live app:** [https://phanta.space](https://phanta.space)
- **Documentation:** [GitBook docs](docs/README.md)
