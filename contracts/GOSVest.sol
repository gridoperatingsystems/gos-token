// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender,address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract GOSVest is Ownable {
    address public beneficiary;
    IERC20 public gosToken;
    
    uint256 public constant TOTAL_VESTING_AMOUNT = 88947368420000000000000000; // with decimals
    uint256 public constant MONTHLY_RELEASE_AMOUNT = 3706973680000000000000000; // with decimals
    uint256 public constant VESTING_DURATION = 24; // 24 months

    uint256 public startTimestamp;
    uint256 public claimedMonths = 0;

    // owner 
    constructor(address _beneficiary, address _gosTokenAddress) {
        beneficiary = _beneficiary;
        gosToken = IERC20(_gosTokenAddress);
        startTimestamp = block.timestamp;
    }

    // owner only
    function updateBeneficiary(address _newBeneficiary) external onlyOwner {
        beneficiary = _newBeneficiary;
    }

    function getBeneficiary() external view returns(address) {
        return beneficiary;
    }

    // public
    function claimTokens() external {
        require(msg.sender == beneficiary, "Not the beneficiary");
        require(gosToken.balanceOf(address(this)) >= MONTHLY_RELEASE_AMOUNT, "Not enough tokens in contract");
        
        uint256 monthsElapsed = (block.timestamp - startTimestamp) / 30 days;
        
        // Determine how many months of tokens can be claimed
        uint256 monthsDue = monthsElapsed - claimedMonths;
        
        require(monthsDue > 0, "No tokens due for claim");
        
        if (monthsDue + claimedMonths > VESTING_DURATION) {
            monthsDue = VESTING_DURATION - claimedMonths;
        }
        
        uint256 claimAmount = monthsDue * MONTHLY_RELEASE_AMOUNT;
        claimedMonths += monthsDue;

        require(gosToken.transfer(beneficiary, claimAmount), "Token transfer failed");
    }

    // In case you want to add more tokens to the vesting (not a requirement)
    function depositTokens(uint256 amount) external onlyOwner {
        require(gosToken.transferFrom(msg.sender, address(this), amount), "Token deposit failed");
    }

    // For informational purposes
    function tokensDue() external view returns (uint256) {
        uint256 monthsElapsed = (block.timestamp - startTimestamp) / 30 days;
        uint256 monthsDue = monthsElapsed - claimedMonths;

        if (monthsDue + claimedMonths > VESTING_DURATION) {
            monthsDue = VESTING_DURATION - claimedMonths;
        }

        return monthsDue * MONTHLY_RELEASE_AMOUNT;
    }

    function tokensRemaining() external view returns (uint256) {
        return gosToken.balanceOf(address(this));
    }

    // owner only
    function forceVest() external onlyOwner {
        uint256 balance = gosToken.balanceOf(address(this));
        require(gosToken.transfer(beneficiary, balance), "Token transfer failed");
    }

    // sweep gos token
    function sweepGOS(address recipient) external onlyOwner {
        uint256 balance = gosToken.balanceOf(address(this));
        require(gosToken.transfer(recipient, balance), "Token transfer failed");
    }

    // sweep any token, fail-safe
    function sweep(address _tokenAddress, address recipient) external onlyOwner {
        uint256 balance = IERC20(_tokenAddress).balanceOf(address(this));
        require(IERC20(_tokenAddress).transfer(recipient, balance), "Token transfer failed");
    }
}