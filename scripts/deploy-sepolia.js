async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    
    // Deploying (string memory name, string memory symbol, decimals) with an initial supply of 100 million tokens
    const INITIAL_SUPPLY = ethers.utils.parseUnits("100000000000000000000000000", "wei");
    const Token = await ethers.getContractFactory("GOSToken");
    const gosToken = await Token.deploy("Grid Operating Systems Testnet Token", "GOS", INITIAL_SUPPLY);

    console.log("GOS Token address:", gosToken.address);

    const GosTokenVesting = await ethers.getContractFactory("GOSVest");
    gosVesting = await GosTokenVesting.deploy(deployer.address, gosToken.address);

    console.log("GOS Token vesting address:", gosVesting.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
