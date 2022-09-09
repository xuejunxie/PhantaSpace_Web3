# 🌍 Space NFT

## 3D geocode

The space NFT is a dynamic NFT that defines the ownership of the space in PhantaSpace. Each space has a unique 3D geocode first introduced by PhantaSpace. The geocode consists of \[vertical level + longitude + latitude + precision]. The last digit is precision with a digit from 1\~9. The longitude and latitude are in degrees with the decimal digit number equal to the precision. This way, the world is divided into grids with different precision. In order to record longitude and latitude in Ethereum smart contract, the numbers are + 90 and + 180, respectively, to offset the negative value. The level is divided by the unit height. The unit height is calculated with $$R_{earth} * 0.1^{precision} * \pi / 180$$. This way, the space can be roughly divided into cuboids with reasonable shapes. This way, world space in different 3D locations with sizes from kilometers to micrometers can be addressed by our 3D geocodes.

## Mint a space NFT

To mint a space NFT, go to the [space page](https://phanta.space/#/space). The initial space offering is conducted on precision = 1. This means early adopters will own a huge space. Each space can be split into 10x10x10 subspaces later for fine-grain ownership. Any space owner can mint their subspace and sell it as space NFT. There are two ways to mint space NFT. One is on-chain auction, the other is random vending. Check out our space NFT collection on [Opeansea](https://opensea.io/collection/phantaspace).

### On-chain auction

On-chain auction is an innovation introduced by PhantaSpace. Due to the vast amount of space with a large variation in value, we created the first NFT smart contract with on-chain auction. Anyone can pick an unclaimed space and place a bid. At the moment the bid is placed, the smart contract initiates a 48-hour auction. Anyone can join the bid by placing a bid. The highest bid will be the winner. At the end of the auction, the winner will be able to claim and mint the space. Others can withdraw their bid. This way, we make sure of fair space ownership with a fair price. Any space owner can also initiate an on-chain auction for the subspaces.

### Random vending

For anyone who just wants to get the space as soon as possible, random vending is the way to go. Since there are only 4% of the earth's surface has human activity, the random vending price is only 4% of the starting price of on-chain auction.

## How we think about space ownership

We want to decentralize the governance of PhantaSpace. So we designed a system to allow users to own space. We also want to make sure that space is better utilized. The conventional way to do this is to have a single owner of a block of space. This is not a good way to do it. First of all, it's hard to have fine-grain control of the ownership of the space. If the owner lost the wallet to the address owning the space, it will be a barren land forever. Secondly, the owner of a space may not be the best person to create the content for the space. And it's very hard to generate revenue from the utilization of the space. Therefore, we designed a system to allow space owners to[ split the space into smaller sub-spaces](space-NFT.md#3d-geocode) and sell the sub-spaces to other owners. We also build the [space revenue generation mechanism](phanton.md#nft-ranking) into our [tokenomics](tokenomics.md). Space owners can let other artists or businesses display their artworks or commercials, respectively, in their space and collect rent from it. The owner can reinvest the rent into the space to attract more explorers with our [check-in-to-earn mechanism](phanton.md#check-in-to-earn). In other words, the space can automatically get populated with digital contents with a set of simple rules and self-organize into flourishing economics. Space owners also have the veto right to only allow certain artwork in their space, or set a threshold to restrict the quality of the artworks.
