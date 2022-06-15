Phanta.Space

Tasks:

Market place:

- exchange contract deployment
- NFT minting contract
- buy and sell UI

Space token utility:

- set rent % in their space
- set phanton threshold
- all effective for 1 year
- claim phanton token
- change cover picture

Phanton Token utility:

- NFT display ranking
- rent

marketing:

block place

- 2D first
- FPV move for 3D
- space owner place unlimited block in their space
- place a set of block without time limit in open space
- other user, one p1 block every 256s, one p2 - 128s, p3 - 64s, p4 - 32s, p4 - 16s
- other user can't overlap owner's block on owner's space
- pay subscription to keep block
- pay phaton subscription for keeping the blocks

tech debt:

- create state management
- tile server
- cache the user NFT and pin ipfs
- refactor Map.js

future features:

- mint NFT on site

- human scale navigation

- support video, and music

- space rental contract

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
