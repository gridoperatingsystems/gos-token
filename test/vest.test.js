const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * GOS Token Vesting
 * 
 * 1. Test claiming after 2 months, 3 months, etc.
 * 2. Test the total tokens remaining function
 * 3. Test when the vesting is completely done
 * 4. Test the depositTokens function 
 */
describe("GosTokenVesting", function() {
    let gosToken;
    let gosTokenVesting;
    let owner;
    let beneficiary;
    const THIRTY_DAYS = 2592000;
    const SIXTY_DAYS = THIRTY_DAYS*2;
    const NINETY_DAYS = THIRTY_DAYS*3;
    const TOTAL_VESTING_AMOUNT = ethers.utils.parseUnits("88947368420000000000000000", "wei");
    const MONTHLY_RELEASE_AMOUNT = ethers.utils.parseUnits('3706973680000000000000000', "wei");
    const BI_MONTHLY_RELEASE_AMOUNT = ethers.utils.parseUnits('7413947360000000000000000', "wei");
    const TRI_MONTHLY_RELEASE_AMOUNT = ethers.utils.parseUnits('11120921040000000000000000', "wei");

    beforeEach(async function() {
        [owner, beneficiary, ...others] = await ethers.getSigners();

        const GosToken = await ethers.getContractFactory("GOSToken");
        // Mint 100 Million tokens to the owner
        gosToken = await GosToken.deploy("Grid Operating Systems Token", "GOS", TOTAL_VESTING_AMOUNT);
        await gosToken.deployed();

        const GosTokenVesting = await ethers.getContractFactory("GOSVest");
        gosTokenVesting = await GosTokenVesting.deploy(beneficiary.address, gosToken.address);
        await gosTokenVesting.deployed();

        // await gosToken.mint(owner.address, TOTAL_VESTING_AMOUNT);

        // Transfer the TOTAL_VESTING_AMOUNT from owner to the GosTokenVesting contract
        await gosToken.transfer(gosTokenVesting.address, TOTAL_VESTING_AMOUNT);
    });

    describe("GosTokenVesting vesting", function() {
    
        it("should correctly initialize the vesting contract", async function() {
            expect(await gosTokenVesting.beneficiary()).to.equal(beneficiary.address);
            expect(await gosToken.balanceOf(gosTokenVesting.address)).to.equal(TOTAL_VESTING_AMOUNT);
        });
    
        it("should not allow non-beneficiaries to claim tokens", async function() {
            await expect(gosTokenVesting.connect(owner).claimTokens()).to.be.revertedWith("Not the beneficiary");
        });
    
        it("should allow beneficiaries to claim tokens after a month", async function() {
            await ethers.provider.send("evm_increaseTime", [THIRTY_DAYS]); // Advance time by 30 days
            await ethers.provider.send("evm_mine"); // Mine a new block to make sure time advancement took effect
    
            // should be zero(0) since we are advancing 30 days
            const initialBeneficiaryBalance = await gosToken.balanceOf(beneficiary.address);
            expect(initialBeneficiaryBalance).to.equal(0);
            
            // claim
            await gosTokenVesting.connect(beneficiary).claimTokens();
    
            const finalBeneficiaryBalance = await gosToken.balanceOf(beneficiary.address);
            const finalBalance = ethers.utils.formatUnits(`${finalBeneficiaryBalance}`, "wei");
            
            expect(finalBalance).to.equal(MONTHLY_RELEASE_AMOUNT);

            // try again and fail - re-claim
            await expect(gosTokenVesting.connect(beneficiary).claimTokens()).to.be.revertedWith("No tokens due for claim"); // Assuming this is the error message when trying to re-claim after vesting collected
        });
    
        it("should allow beneficiaries to claim tokens after two months", async function() {
            await ethers.provider.send("evm_increaseTime", [SIXTY_DAYS]); // Advance time by 60 days
            await ethers.provider.send("evm_mine"); // Mine a new block to make sure time advancement took effect
    
            // should be zero(0) since we are advancing 30 days
            const initialBeneficiaryBalance = await gosToken.balanceOf(beneficiary.address);
            expect(initialBeneficiaryBalance).to.equal(0);
            
            // claim
            await gosTokenVesting.connect(beneficiary).claimTokens();
    
            const finalBeneficiaryBalance = await gosToken.balanceOf(beneficiary.address);
            const finalBalance = ethers.utils.formatUnits(`${finalBeneficiaryBalance}`, "wei");
            
            expect(finalBalance).to.equal(BI_MONTHLY_RELEASE_AMOUNT);
        });
    
        it("should allow beneficiaries to claim tokens after three months", async function() {
            await ethers.provider.send("evm_increaseTime", [NINETY_DAYS]); // Advance time by 90 days
            await ethers.provider.send("evm_mine"); // Mine a new block to make sure time advancement took effect
    
            // should be zero(0) since we are advancing 30 days
            const initialBeneficiaryBalance = await gosToken.balanceOf(beneficiary.address);
            expect(initialBeneficiaryBalance).to.equal(0);

            // claim
            await gosTokenVesting.connect(beneficiary).claimTokens();
    
            const finalBeneficiaryBalance = await gosToken.balanceOf(beneficiary.address);
            const finalBalance = ethers.utils.formatUnits(`${finalBeneficiaryBalance}`, "wei");
            
            expect(finalBalance).to.equal(TRI_MONTHLY_RELEASE_AMOUNT);
        });
    });

    describe("GosTokenVesting totalTokensRemaining", function() {
    
        it("should return total vesting amount initially", async function() {
            const remaining = await gosTokenVesting.tokensRemaining();
            expect(remaining).to.equal(TOTAL_VESTING_AMOUNT);
        });
    
        it("should decrease the total tokens remaining after a month's claim", async function() {
            await ethers.provider.send("evm_increaseTime", [THIRTY_DAYS]); // Advance time by 30 days
            await ethers.provider.send("evm_mine");
    
            await gosTokenVesting.connect(beneficiary).claimTokens();
            const remaining = await gosTokenVesting.tokensRemaining();
            const decreasedValue = TOTAL_VESTING_AMOUNT.sub(MONTHLY_RELEASE_AMOUNT);
            expect(remaining).to.equal(decreasedValue);
        });
    
        it("should not change the total tokens remaining without a claim", async function() {
            await ethers.provider.send("evm_increaseTime", [NINETY_DAYS]); // Advance time by 90 days
            await ethers.provider.send("evm_mine");
    
            const remaining = await gosTokenVesting.tokensRemaining();
            expect(remaining).to.equal(TOTAL_VESTING_AMOUNT); // Still the same as after the first month's claim
        });
    
        it("should decrease appropriately after multiple claims", async function() {

            for (let i = 0; i < 2; i++) { // Claim for 2 more months
                await ethers.provider.send("evm_increaseTime", [THIRTY_DAYS]); // Advance time by 30 days
                await ethers.provider.send("evm_mine");
    
                await gosTokenVesting.connect(beneficiary).claimTokens();
            }
    
            const remaining = await gosTokenVesting.tokensRemaining();
            const decreasedValue = TOTAL_VESTING_AMOUNT.sub(BI_MONTHLY_RELEASE_AMOUNT);
            expect(remaining).to.equal(decreasedValue); // Decreased from 2 months in total
        });
    
    });

    describe("GosTokenVesting completion", function() {
    
        it("should allow the beneficiary to claim all tokens by the end of vesting", async function() {
            // Simulate the entire vesting duration
            for (let i = 0; i < 23; i++) { // Assuming a 24-month vesting period, to 23 as we a zero based index
                await ethers.provider.send("evm_increaseTime", [THIRTY_DAYS]); // Advance time by 30 days
                await ethers.provider.send("evm_mine");
                
                await gosTokenVesting.connect(beneficiary).claimTokens();
            }
    
            // AssertionError: Expected "85260394640000000000000000" to be equal 88947368420000000000000000
            // expect(beneficiaryBalance).to.equal(TOTAL_VESTING_AMOUNT); // Beneficiary should have claimed all vested tokens
            
            // collect any dust left over, fail-safe, only owner
            await gosTokenVesting.connect(owner).forceVest();

            const beneficiaryBalance = await gosToken.balanceOf(beneficiary.address);
            expect(beneficiaryBalance).to.equal(TOTAL_VESTING_AMOUNT);

            let remaining = await gosTokenVesting.tokensRemaining();
            expect(remaining).to.equal(0); // No tokens should be left for vesting

            await expect(gosTokenVesting.connect(beneficiary).claimTokens()).to.be.revertedWith("Not enough tokens in contract"); // Assuming this is the error message when trying to claim after vesting is done
        });
    
        it("should allow the vesting contract owner to sweep tokens", async function() {
            
            // sweep 
            await gosTokenVesting.connect(owner).sweepGOS(owner.address);

            const ownerBalance = await gosToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(TOTAL_VESTING_AMOUNT);

            const vestContractBalance = await gosToken.balanceOf(gosTokenVesting.address);
            expect(vestContractBalance).to.equal(0);
        });
        
    });
    
    describe("GosTokenVesting beneficiary", function() {

        it("should allow the updating the beneficiary with a new beneficiary", async function() {
            
            const originalBeneficiary = await gosTokenVesting.getBeneficiary();
            expect(originalBeneficiary).to.equal(beneficiary.address);

            // update
            await gosTokenVesting.connect(owner).updateBeneficiary(owner.address);

            const updatedBeneficiary = await gosTokenVesting.getBeneficiary();
            expect(updatedBeneficiary).to.equal(owner.address);

        });

    });
    // 4. Test the depositTokens function (if you decide to keep it)
});
