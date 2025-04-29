import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      forking: {
        url: process.env.OP_BNB_TESTNET_URL!,
        blockNumber: 60000000,
      },
    },
    opBnbMainnet: {
      url: process.env.OP_BNB_MAINNET_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 204,
    },
    opBnbTestnet: {
      url: process.env.OP_BNB_TESTNET_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 5611,
    },
  },
};

export default config;
