const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying EventTicketNFT contract to Lisk...");

  // Get the contract factory
  const EventTicketNFT = await ethers.getContractFactory("EventTicketNFT");

  // Deploy the contract
  console.log("📦 Deploying contract...");
  const eventTicketNFT = await EventTicketNFT.deploy();

  // Wait for deployment to complete
  await eventTicketNFT.waitForDeployment();

  const contractAddress = await eventTicketNFT.getAddress();
  
  console.log("✅ EventTicketNFT deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Network:", (await ethers.provider.getNetwork()).name);

  console.log("\n📋 Contract deployment summary:");
  console.log("================================");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log("================================");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    address: contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployedAt: new Date().toISOString(),
    blockExplorer: "https://sepolia-blockscout.lisk.com/address/" + contractAddress
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment-info.json");

  // Update .env file with contract address
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedEnv = envContent.replace(
      'LISK_TESTNET_CONTRACT_ADDRESS=',
      `LISK_TESTNET_CONTRACT_ADDRESS=${contractAddress}`
    );
    fs.writeFileSync('.env', updatedEnv);
    console.log("📝 Contract address updated in .env file");
  } catch (error) {
    console.warn("⚠️  Could not update .env file:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
