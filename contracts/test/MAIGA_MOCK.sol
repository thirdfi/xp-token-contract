// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MAIGA_MOCK is ERC20 {
    constructor() ERC20("MAIGA_MOCK", "MAIGA_MOCK") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
