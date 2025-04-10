import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MaigaXpModule = buildModule("MaigaXpModule", (m) => {
  const maigaXpImplementation = m.contract("MAIGA_XP", [], {
    id: "MAIGA_XPTokenImplementationContract",
  });

  const initData = m.encodeFunctionCall(
    maigaXpImplementation,
    "initialize",
    []
  );

  const maigaXpProxy = m.contract(
    "ERC1967Proxy",
    [maigaXpImplementation, initData],
    {
      id: "MaigaXpTokenProxyContract",
    }
  );

  return { maigaXpImplementation, maigaXpProxy };
});

export default MaigaXpModule;
