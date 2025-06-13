import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

const UpgradeModule = buildModule("UpgradeModule", (m) => {
  const maigaXp = m.contractAt(
    "MAIGA_XP",
    "0x3cAfdB41C9866655C278064E90F8781c9CBC9E03"
  );

  const implementation = m.contract("MAIGA_XP", [], {
    id: "MaigaXpTokenImplementationContract",
  });
  const signer = "0xff2F90825b0f32d829C903B6805354462bbb70B5";

  // Encode the setSigner call data
  const setSignerData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address"],
    [signer]
  );
  const callData = ethers.concat([
    ethers.id("setSigner(address)").slice(0, 10),
    setSignerData,
  ]);

  m.call(maigaXp, "upgradeToAndCall", [implementation, callData]);

  return { maigaXp };
});
export default UpgradeModule;
