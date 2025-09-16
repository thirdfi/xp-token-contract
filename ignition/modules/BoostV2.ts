import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

const NATIVE_BOOST_FEE = ethers.parseEther("0.003");
const MAIGA_BOOST_FEE = ethers.parseEther("1");
const MAIGA_TOKEN_ADDRESS = "0xB983874040f60fcb06929a11096698b465cE95Fa";

const BoostV2Module = buildModule("BoostV2Module", (m) => {
  const boostV2Implementation = m.contract("BoostV2", [], {
    id: "BoostV2ImplementationContract",
  });

  const initData = m.encodeFunctionCall(boostV2Implementation, "initialize", [
    NATIVE_BOOST_FEE,
    MAIGA_BOOST_FEE,
    MAIGA_TOKEN_ADDRESS,
  ]);

  const boostV2Proxy = m.contract(
    "ERC1967Proxy",
    [boostV2Implementation, initData],
    {
      id: "BoostV2ProxyContract",
    }
  );

  return { boostV2Implementation, boostV2Proxy };
});

export default BoostV2Module;

// npx hardhat ignition deploy ignition/modules/BoostV2.ts --network bnbMainnet
// npx hardhat ignition verify chain-56 --include-unrelated-contracts
