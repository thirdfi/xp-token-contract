import { expect } from "chai";
import hre from "hardhat";
import { BoostV2, MAIGA_XP } from "../typechain-types";

const NATIVE_BOOST_FEE = hre.ethers.parseEther("0.003");
const MAIGA_BOOST_FEE = hre.ethers.parseEther("1");
const TG_ID = 12345;

describe("BoostV2", function () {
  it("Should work", async function () {
    const [owner, user] = await hre.ethers.getSigners();

    // mock maiga token
    const MaigaFactory = await hre.ethers.getContractFactory("MAIGA_MOCK");
    const maiga = await MaigaFactory.deploy();

    const BoostV2Factory = await hre.ethers.getContractFactory("BoostV2");
    const boostV2Implementation = await BoostV2Factory.deploy();
    const proxy = await hre.ethers.deployContract("ERC1967Proxy", [
      await boostV2Implementation.getAddress(),
      BoostV2Factory.interface.encodeFunctionData("initialize", [
        NATIVE_BOOST_FEE,
        MAIGA_BOOST_FEE,
        maiga.target,
      ]),
    ]);
    const boostV2 = BoostV2Factory.attach(await proxy.getAddress()) as BoostV2;

    // check owner is set
    expect(await boostV2.owner()).to.equal(owner.address);

    // check native boost fee is set
    expect(await boostV2.nativeBoostFee()).to.equal(NATIVE_BOOST_FEE);

    // check maiga boost fee is set
    expect(await boostV2.maigaBoostFee()).to.equal(MAIGA_BOOST_FEE);

    // check cannot initialize again
    await expect(
      boostV2.initialize(NATIVE_BOOST_FEE, MAIGA_BOOST_FEE, maiga.target)
    ).to.be.revertedWithCustomError(boostV2, "InvalidInitialization");

    // user boost with native
    await expect(
      boostV2.connect(user).boost(TG_ID, { value: NATIVE_BOOST_FEE })
    ).to.emit(boostV2, "Boosted");

    // check boostV2 contains user's boost native fee
    expect(await hre.ethers.provider.getBalance(boostV2.target)).to.equal(
      NATIVE_BOOST_FEE
    );

    // user boost with maiga
    await maiga.mint(user.address, (MAIGA_BOOST_FEE * 15n) / 10n);
    await maiga.connect(user).approve(boostV2.target, hre.ethers.MaxUint256);
    await expect(boostV2.connect(user).boost(TG_ID)).to.emit(
      boostV2,
      "Boosted"
    );

    // check boostV2 contains user's boost maiga fee
    expect(await maiga.balanceOf(boostV2.target)).to.equal(MAIGA_BOOST_FEE);

    // check boost count is set
    expect(await boostV2.boostCount(user.address)).to.equal(2);

    // user boost with native not enough fee
    await expect(
      boostV2
        .connect(user)
        .boost(TG_ID, { value: hre.ethers.parseEther("0.001") })
    ).to.be.revertedWith("not enough fee");

    // // user boost with maiga not enough fee
    await expect(
      boostV2.connect(user).boost(TG_ID)
    ).to.be.revertedWithCustomError(maiga, "ERC20InsufficientBalance");

    // owner update boost fee
    await expect(
      boostV2
        .connect(owner)
        .updateBoostFee(
          hre.ethers.parseEther("0.002"),
          hre.ethers.parseEther("2")
        )
    ).to.emit(boostV2, "BoostFeeUpdated");

    // check native & maiga boost fee is updated
    expect(await boostV2.nativeBoostFee()).to.equal(
      hre.ethers.parseEther("0.002")
    );
    expect(await boostV2.maigaBoostFee()).to.equal(hre.ethers.parseEther("2"));

    // only owner able to update boost fee
    await expect(
      boostV2.connect(user).updateBoostFee(NATIVE_BOOST_FEE, MAIGA_BOOST_FEE)
    ).to.be.revertedWithCustomError(boostV2, "OwnableUnauthorizedAccount");

    // only owner able to withdraw native & maiga
    await expect(
      boostV2.connect(user).withdrawNative(NATIVE_BOOST_FEE)
    ).to.be.revertedWithCustomError(boostV2, "OwnableUnauthorizedAccount");
    await expect(
      boostV2.connect(user).withdrawMaiga(MAIGA_BOOST_FEE)
    ).to.be.revertedWithCustomError(boostV2, "OwnableUnauthorizedAccount");

    // owner withdraw native
    await expect(
      boostV2.connect(owner).withdrawNative(NATIVE_BOOST_FEE)
    ).to.changeEtherBalances(
      [owner, boostV2],
      [NATIVE_BOOST_FEE, -NATIVE_BOOST_FEE]
    );

    // owner withdraw maiga
    await expect(
      boostV2.connect(owner).withdrawMaiga(MAIGA_BOOST_FEE)
    ).to.changeEtherBalances(
      [owner, boostV2],
      [MAIGA_BOOST_FEE, -MAIGA_BOOST_FEE]
    );
  });
});
