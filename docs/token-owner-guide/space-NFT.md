# 🌍 Space NFT

## 3D geocode

The space NFT is a dynamic NFT that defines the ownership of the space in PhantaSpace. Each space has a unique 3D geocode first introduced by PhantaSpace. The geocode consists of \[vertical level + longitude + latitude + precision]. The last digit is precision with a digit from 1\~9. The longitude and latitude are in degrees with the decimal digit number equal to the precision. This way, the world is divided into grids with different precision. In order to record longitude and latitude in Ethereum smart contract, the numbers are + 90 and + 180, respectively, to offset the negative value. The level is divided by the unit height. The unit height is calculated with $$R_{earth} * 0.1^{precision} * \pi / 180$$. This way, the space can be roughly divided into cuboids with reasonable shapes. This way, the world space can be addressed by the geocode with a size from kilometers to micrometers.

## Minting a space NFT

To mint a space NFT, go to the [space page](https://phanta.space/#/space). The initial space offering is conducted on precision = 1. This means early adopters will own a huge space. Each space can be split into 10x10x10 subspaces later for fine-grain ownership. Any space owner can mint their subspace and sell it as space NFT. There are two ways to mint space NFT. One is on-chain auction, the other is random vending.

### On-chain auction

On-chain auction is an innovation introduced by PhantaSpace. Due to the vast amount of space with a large variation in value, we created the first NFT smart contract with on-chain auction. Anyone can pick an unclaimed space and place a bid. At the moment the bid is placed, the smart contract initiates a 48-hour auction. Anyone can join the bid by placing a bid. The highest bid will be the winner. At the end of the auction, the winner will be able to claim and mint the space. Others can withdraw their bid. This way, we make sure of fair space ownership with a fair price. Any space owner can also initiate an on-chain auction for the subspaces.

### Random vending

For anyone who just wants to get the space as soon as possible, random vending is the way to go. Since there are only 4% of the earth's surface has human activity, the random vending price is only 4% of the starting price of on-chain auction.
