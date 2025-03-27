import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const XpModule = buildModule("XpModule", (m) => {
  const xpImplementation = m.contract("XP", [], {
    id: "XPTokenImplementationContract",
  });

  const initData = m.encodeFunctionCall(xpImplementation, "initialize", []);

  const xpProxy = m.contract("ERC1967Proxy", [xpImplementation, initData], {
    id: "XpTokenProxyContract",
  });

  return { xpImplementation, xpProxy };
});

export default XpModule;
