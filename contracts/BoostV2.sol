// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BoostV2 is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    IERC20 public MAIGA;
    uint256 public nativeBoostFee;
    uint256 public maigaBoostFee;
    mapping(address => uint256) public boostCount;

    event Boosted(uint256 indexed tgId, address indexed caller, bytes32 hash);
    event BoostFeeUpdated(uint256 newNativeBoostFee, uint256 newMaigaBoostFee);

    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _nativeBoostFee,
        uint256 _maigaBoostFee,
        address _maiga
    ) public initializer {
        __Ownable_init(msg.sender);

        nativeBoostFee = _nativeBoostFee;
        maigaBoostFee = _maigaBoostFee;
        MAIGA = IERC20(_maiga);
    }

    function boost(uint256 tgId) external payable nonReentrant {
        if (msg.value > 0) {
            require(msg.value >= nativeBoostFee, "not enough fee");
        } else {
            MAIGA.transferFrom(msg.sender, address(this), maigaBoostFee);
        }

        boostCount[msg.sender] += 1;

        bytes32 calculatedHash = _calculateHash(msg.sender, tgId);

        emit Boosted(tgId, msg.sender, calculatedHash);
    }

    function _calculateHash(
        address caller,
        uint256 tgId
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    caller,
                    tgId,
                    block.chainid,
                    boostCount[caller],
                    block.timestamp,
                    blockhash(block.number - (block.timestamp % 255))
                )
            );
    }

    function updateBoostFee(
        uint256 _nativeBoostFee,
        uint256 _maigaBoostFee
    ) external onlyOwner {
        nativeBoostFee = _nativeBoostFee;
        maigaBoostFee = _maigaBoostFee;

        emit BoostFeeUpdated(nativeBoostFee, maigaBoostFee);
    }

    function withdrawNative(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }

    function withdrawMaiga(uint256 amount) external onlyOwner {
        MAIGA.transfer(owner(), amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
