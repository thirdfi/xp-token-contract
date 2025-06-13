// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MAIGA_XP is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ERC20Upgradeable
{
    using MessageHashUtils for bytes32;

    constructor() {
        _disableInitializers();
    }

    address public signer;
    mapping(bytes32 => bool) public usedSignatures;
    mapping(address => uint256) public totalMinted;

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ERC20_init("MAIGA XP", "MAIGA_XP");
        signer = msg.sender;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function mint(uint256 amount, bytes calldata signature) public {
        require(
            !usedSignatures[keccak256(signature)],
            "Signature already used"
        );
        usedSignatures[keccak256(signature)] = true;

        bytes32 messageHash = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                totalMinted[msg.sender],
                block.chainid
            )
        );
        address recoveredSigner = ECDSA.recover(
            messageHash.toEthSignedMessageHash(),
            signature
        );
        require(recoveredSigner == signer, "Invalid signature");

        totalMinted[msg.sender] += amount;
        _mint(msg.sender, amount);
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override {
        if (from != owner()) {
            uint256 codeSize;
            assembly {
                codeSize := extcodesize(to)
            }
            require(codeSize == 0, "transfer to contract not allowed");
        }

        super._update(from, to, amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
