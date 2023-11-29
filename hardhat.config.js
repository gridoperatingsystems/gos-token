require("@nomiclabs/hardhat-waffle");

const INFURA_MAINNET_URL = process.env.INFURA_MAINNET_URL;
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY;

const SEPOLIA_MAINNET_URL = process.env.SEPOLIA_MAINNET_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
      localhost: {
        url: "http://127.0.0.1:8545",
      },
      mainnet: {
        url: INFURA_MAINNET_URL,
        accounts: [MAINNET_PRIVATE_KEY]
      },
      sepolia: {
        url: SEPOLIA_MAINNET_URL,
        accounts: [SEPOLIA_PRIVATE_KEY]
      }
    },
    solidity: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
    paths: {
      sources: "./contracts",
      tests: "./test",
      cache: "./cache",
      artifacts: "./artifacts"
    },
    mocha: {
      timeout: 40000
    }
  }