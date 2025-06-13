import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BOOST_FEE = BigInt("3000000000000000"); // 0.003 ether

const BoostModule = buildModule("BoostModule", (m) => {
  const boostImplementation = m.contract("Boost", [], {
    id: "BoostImplementationContract",
  });

  const initData = m.encodeFunctionCall(boostImplementation, "initialize", [
    BOOST_FEE,
  ]);

  const boostProxy = m.contract(
    "ERC1967Proxy",
    [boostImplementation, initData],
    {
      id: "BoostProxyContract",
    }
  );

  return { boostImplementation, boostProxy };
});

export default BoostModule;

// npx hardhat ignition deploy ignition/modules/Boost.ts --network opBnbMainnet
// npx hardhat ignition verify chain-204 --include-unrelated-contracts

// BoostModule#BoostImplementationContract - 0x828ef758fbaf7B1Ab46d40997E41C6397A159827
// BoostModule#BoostProxyContract - 0xAaCc0143ebcAD38E3D405008e4E30BF5214c02af
