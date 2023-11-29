# GOS Ethereum ERC-20 and Vesting Smart Contract

GOS Token and the GOS Vesting Smart Contracts are managed by the project.
We deploy the Smart Contracts to the following networks;

- Sepolia Ethereum Testnet
- Ethereum Mainnet

## Compile
To compile the vesting smart contracts execute the following command.
```sh
npx hardhat compile
```

## Testing
To run the vesting tests execute the following command.
```sh
npx hardhat test
```

## Issues
Currently the vesting tests pass, but there is an issue with the distribution, leaving a remainder in the smart contract. Therefore, there is a sweep method to recover any remainder.


## Sepolia Deployment
There is the need to set two environment variables to deploy to Sepolia.
```sh
export SEPOLIA_MAINNET_URL="https://sepolia.infura.io/v3/..."
export SEPOLIA_PRIVATE_KEY="..."
```

Script deploys the token and token vesting contracts to the Sepolia Ethereum testnet.
```sh
npx hardhat run --network sepolia scripts/deploy-sepolia.js
```

## Sepolia Transfer
Script transfers the token to the vesting contract.
```sh
npx hardhat run --network sepolia scripts/transfer-sepolia.js
```

## Sepolia Sweep 
Script transfers all tokens to the owner of the vesting contract.
```sh
npx hardhat run --network sepolia scripts/sweep-sepolia.js
```

## Sepolia Beneficiary 
Script updates the beneficiary of the vesting tokens to another owner of the vesting contract.
```sh
npx hardhat run --network sepolia scripts/beneficiary-sepolia.js
```

## Mainnet Deployment
There is the need to set two environment variables to deploy to Mainnet.
```sh
export INFURA_MAINNET_URL="https://mainnet.infura.io/v3..."
export MAINNET_PRIVATE_KEY="..."
```

Script deploys the token and token vesting contracts to the Ethereum mainnet.
```sh
npx hardhat run --network mainnet scripts/deploy-mainnet.js
```