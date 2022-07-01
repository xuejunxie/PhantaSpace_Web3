# 🌍 Space NFT

## 3D geocode

The space NFT is a dynamic NFT that define the ownership of the space in PhantaSpace. Each space has a unique 3D geocode first introduced by PhantaSpace. The geocode consists of [vertical levle + longitude + latitude + precision]. The last digit is precision with digit from (1~9). The longitude and latitude are in degrees with the decimal digit number equal to the precision. This way, the world is divided into grids with different precision. In order to record longitude and latitude in Ethereum smart contract, the number are + 90 and + 180, respectivly, to offset the negative value. The level is devided by the unit height. The unit height is calculated with $$ R\_{earth} _ 0.1^{precision} _ \pi / 180 $$. This way, the space can be roughly divided into cuboid with resonable shape. This way, the world space can be addressed by the geocode with the size from kilometers to micro meters.

## Minting a space NFT

To mint a space NFT, go to the [space page](https://phanta.space/#/space). The initial space offering is conducted on precision = 1. This means the every adoptor will own a huge space. Each space can be splitted into 10x10x10 subspaces later for fine grain ownership. Any space owner can mint their subspace and sell it as space NFT. There are two ways to mint space NFT. One is on-chain auction, the other is random vending.

### On-chain auction

On-chain auction is an innovation introduced by PhantaSpace. Due to the vast amount of space with large varation in value, we created first NFT smart contract with on-chain auction. Anyone can pick an unclaimed space and place down the bid. At the moment the bid is placed, the smart contract initiate a 48 hour auction. Anyone can join the bid by placing a bid. The highest bid will be the winner. At the end of the auction, the winner will be able to claim and mint the space. Others can withdraw their bid. This way, we make sure a fair space ownership with a fair price. Any space owner can also initiate a on-chain auction for the subspaces.

### Random vending

For anyone who just want to get the space as soon as possible, the random vending is the way to go. Since there are only 4% of the earth surface has human activity, the random vending price is only 4% of the starting price of on-chain auction.
