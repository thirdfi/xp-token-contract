import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { Boost } from "../typechain-types";

const BOOST_FEE = hre.ethers.parseEther("0.003");
const NEW_BOOST_FEE = hre.ethers.parseEther("0.005");
const TG_ID = 12345;

describe("Boost", function () {
  async function deployBoostFixture() {
    const [owner, admin, user1, user2] = await hre.ethers.getSigners();
    const BoostFactory = await hre.ethers.getContractFactory("Boost");
    const boostImplementation = await BoostFactory.deploy();
    const proxy = await hre.ethers.deployContract("ERC1967Proxy", [
      await boostImplementation.getAddress(),
      BoostFactory.interface.encodeFunctionData("initialize", [BOOST_FEE]),
    ]);
    const boost = BoostFactory.attach(await proxy.getAddress()) as Boost;
    return { boost, owner, admin, user1, user2 };
  }

  describe("Deployment & Initialization", function () {
    it("Should set the deployer as contract owner", async function () {
      const { boost, owner } = await loadFixture(deployBoostFixture);
      expect(await boost.owner()).to.equal(owner.address);
    });
    it("Should set boostFee to 0.003 ether", async function () {
      const { boost } = await loadFixture(deployBoostFixture);
      expect(await boost.boostFee()).to.equal(BOOST_FEE);
    });
  });

  describe("Boosting", function () {
    it("Should revert if boost() called without value or with too little ether", async function () {
      const { boost, user1 } = await loadFixture(deployBoostFixture);
      await expect(boost.connect(user1).boost(TG_ID)).to.be.revertedWith(
        "not enough fee"
      );
      await expect(
        boost
          .connect(user1)
          .boost(TG_ID, { value: hre.ethers.parseEther("0.001") })
      ).to.be.revertedWith("not enough fee");
    });
    it("Should boost with correct fee, emit event, and update state", async function () {
      const { boost, user1 } = await loadFixture(deployBoostFixture);
      const tx = await boost.connect(user1).boost(TG_ID, { value: BOOST_FEE });
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((l: any) => boost.interface.parseLog(l))
        .find((e: any) => e && e.name === "Boosted");
      expect(event).to.not.be.undefined;
      expect(event?.args.tgId).to.equal(TG_ID);
      expect(event?.args.caller).to.equal(user1.address);
      const hash = event?.args.hash;
      expect(await boost.boostCount(user1.address)).to.equal(1);
      const firstHash = await boost.hashList(user1.address, 0);
      expect(firstHash).to.equal(hash);
    });
  });

  describe("Boost Fee Update", function () {
    it("Only owner can update boost fee", async function () {
      const { boost, owner, user1 } = await loadFixture(deployBoostFixture);
      await expect(
        boost.connect(user1).updateBoostFee(NEW_BOOST_FEE)
      ).to.be.revertedWithCustomError(boost, "OwnableUnauthorizedAccount");
      await expect(boost.connect(owner).updateBoostFee(NEW_BOOST_FEE))
        .to.emit(boost, "BoostFeeUpdated")
        .withArgs(NEW_BOOST_FEE);
      expect(await boost.boostFee()).to.equal(NEW_BOOST_FEE);
    });
    it("Should revert boost() with old fee, succeed with new fee", async function () {
      const { boost, owner, user1 } = await loadFixture(deployBoostFixture);
      await boost.connect(owner).updateBoostFee(NEW_BOOST_FEE);
      await expect(
        boost.connect(user1).boost(TG_ID, { value: BOOST_FEE })
      ).to.be.revertedWith("not enough fee");
      await expect(
        boost.connect(user1).boost(TG_ID, { value: NEW_BOOST_FEE })
      ).to.emit(boost, "Boosted");
    });
  });

  describe("Withdrawals", function () {
    it("Only owner can withdraw, and contract/owner balances update correctly", async function () {
      const { boost, owner, user1 } = await loadFixture(deployBoostFixture);
      // Fund contract with 1 boost
      await boost.connect(user1).boost(TG_ID, { value: BOOST_FEE });
      const contractBalance = await hre.ethers.provider.getBalance(
        boost.target
      );
      expect(contractBalance).to.equal(BOOST_FEE);
      const withdrawAmount = hre.ethers.parseEther("0.002"); // 0.002 ether
      await expect(
        boost.connect(owner).withdraw(withdrawAmount)
      ).to.changeEtherBalances(
        [owner, boost],
        [withdrawAmount, -withdrawAmount]
      );
      const contractBalanceAfter = await hre.ethers.provider.getBalance(
        boost.target
      );
      expect(contractBalanceAfter).to.equal(BOOST_FEE - withdrawAmount);
    });
    it("Should revert withdraw if not owner", async function () {
      const { boost, user1 } = await loadFixture(deployBoostFixture);
      await expect(
        boost.connect(user1).withdraw(hre.ethers.parseEther("0.001"))
      ).to.be.revertedWithCustomError(boost, "OwnableUnauthorizedAccount");
    });
  });
});
