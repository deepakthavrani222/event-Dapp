const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying TicketAuction contract...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Platform wallet address (receives fees)
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
  console.log("Platform wallet:", platformWallet);

  // Deploy TicketAuction contract
  const TicketAuction = await hre.ethers.getContractFactory("TicketAuction");
  const ticketAuction = await TicketAuction.deploy(platformWallet);

  await ticketAuction.waitForDeployment();
  const auctionAddress = await ticketAuction.getAddress();

  console.log("TicketAuction deployed to:", auctionAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    auctionContract: auctionAddress,
    platformWallet: platformWallet,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  // Update deployment-info.json
  const deploymentPath = path.join(__dirname, "..", "deployment-info.json");
  let existingDeployment = {};
  
  if (fs.existsSync(deploymentPath)) {
    existingDeployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  }

  existingDeployment.auctionContract = auctionAddress;
  existingDeployment.auctionDeployedAt = deploymentInfo.deployedAt;

  fs.writeFileSync(deploymentPath, JSON.stringify(existingDeployment, null, 2));
  console.log("Deployment info saved to deployment-info.json");

  // Update .env file
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    if (envContent.includes("AUCTION_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /AUCTION_CONTRACT_ADDRESS=.*/,
        `AUCTION_CONTRACT_ADDRESS=${auctionAddress}`
      );
    } else {
      envContent += `\nAUCTION_CONTRACT_ADDRESS=${auctionAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env with AUCTION_CONTRACT_ADDRESS");
  }

  // Verify contract on Etherscan (if not localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await ticketAuction.deploymentTransaction().wait(5);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: auctionAddress,
        constructorArguments: [platformWallet],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("TicketAuction:", auctionAddress);
  console.log("Platform Wallet:", platformWallet);
  console.log("========================\n");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
