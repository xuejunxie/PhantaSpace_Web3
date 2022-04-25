Phanta.Space

Tasks:

core functions for space NFT:

location -> tokenID ->

Space token utility:

- 2D first
- delete NFTs in their space
- claim token
- place unlimited block in their space
- place a set of block without time limit in open space
- other user, one p1 block every 256s, one p2 - 128s, p3 - 64s, p4 - 32s, p4 - 16s
- other user can't overlap owner's block on owner's space
- pay subscription to keep block
- FPV move for 3D

Token utility:

- subscription for keeping the blocks
- NFT display ranking
- staking?
- rent?

tech debt:

- create state management
- tile server

future features:

- mint NFT on site

- human scale navigation

- support video, and music

- space rental contract

- space spliting including burning old space and mint new subspace
- space spliting into different height
  tokenURI: latitude1 longitude1 height1 - latitude2 longitude2 height2
  defined grid size

- space can have different channels
- channel owner share the space sale profit
- user can subscribe to channels
- for spaceing page channel object are ranked by our algorithm and coin deposit

- open link to shopping page
- user can show their avatar in VR and in physical world
- webAR with physical world overlap
- VR explorer
- game api

deploy checks:
env, abi.json
cloud function
opensea_api_url, contract_address, contract_wallet, abi.json on phanta_space.server
testnet in UI code
