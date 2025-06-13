import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { MAIGA_XP } from "../typechain-types";

describe("MAIGA_XP", function () {
  async function deployMaigaXpFixture() {
    const [owner, user] = await hre.ethers.getSigners();
    const MaigaXpFactory = await hre.ethers.getContractFactory("MAIGA_XP");
    const maigaXpImplementation = await MaigaXpFactory.deploy();
    const proxy = await hre.ethers.deployContract("ERC1967Proxy", [
      await maigaXpImplementation.getAddress(),
      MaigaXpFactory.interface.encodeFunctionData("initialize", []),
    ]);
    const maigaXp = MaigaXpFactory.attach(await proxy.getAddress()) as MAIGA_XP;
    return { maigaXp, owner, user };
  }

  describe("Mint", function () {
    it("Should mint with signature successfully", async function () {
      const { maigaXp, owner, user } = await loadFixture(deployMaigaXpFixture);

      // Set user's balance to 0
      await hre.network.provider.send("hardhat_setBalance", [
        user.address,
        "0x0",
      ]);

      const mintAmount = hre.ethers.parseEther("3");
      const messageHash = hre.ethers.keccak256(
        hre.ethers.solidityPacked(
          ["address", "uint256", "uint256", "uint256"],
          [
            user.address,
            mintAmount,
            await maigaXp.totalMinted(user.address),
            await hre.ethers.provider.getNetwork().then((n) => n.chainId),
          ]
        )
      );
      const signature = await owner.signMessage(
        hre.ethers.getBytes(messageHash)
      );

      const estimatedGas = await maigaXp
        .connect(user)
        ["mint(uint256,bytes)"].estimateGas(mintAmount, signature);

      await owner.sendTransaction({
        to: user.address,
        value: estimatedGas * hre.ethers.parseUnits("0.001", "gwei"),
      });

      await maigaXp
        .connect(user)
        ["mint(uint256,bytes)"](mintAmount, signature, {
          gasLimit: estimatedGas,
          gasPrice: hre.ethers.parseUnits("0.001", "gwei"),
        });
      expect(await maigaXp.totalMinted(user.address)).to.equal(mintAmount);
      expect(await maigaXp.balanceOf(user.address)).to.equal(mintAmount);
    });
  });
});
