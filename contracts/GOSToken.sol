// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GOSToken is ERC20Burnable, ERC20Snapshot, Ownable {
    uint8 private constant _decimals = 18;

    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Decimals for the token.
     */
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mint new tokens
     * @dev Only the owner can mint tokens.
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Override the _beforeTokenTransfer function to include the snapshot logic
     * @dev This is necessary for the snapshot functionality to work.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Snapshot) {
        super._beforeTokenTransfer(from, to, amount);
    }
}
