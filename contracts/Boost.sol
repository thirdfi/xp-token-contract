// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract Boost is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _boostFee) public initializer {
        __Ownable_init(msg.sender);

        boostFee = _boostFee;
    }

    uint256 public boostFee;
    mapping(address => uint256) public boostCount;
    mapping(address => bytes32[]) public hashList;

    event Boosted(uint256 indexed tgId, address indexed caller, bytes32 hash);
    event BoostFeeUpdated(uint256 newBoostFee);

    function boost(uint256 tgId) external payable nonReentrant {
        require(msg.value >= boostFee, "not enough fee");

        boostCount[msg.sender] += 1;

        bytes32 calculatedHash = _calculateHash(msg.sender, tgId);
        hashList[msg.sender].push(calculatedHash);

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

    function updateBoostFee(uint256 _boostFee) external onlyOwner {
        boostFee = _boostFee;

        emit BoostFeeUpdated(boostFee);
    }

    function withdraw(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
