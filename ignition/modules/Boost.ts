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
