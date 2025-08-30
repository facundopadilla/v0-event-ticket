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
  console.log("⛽ Gas used for deployment:", (await eventTicketNFT.deploymentTransaction()).gasUsed?.toString());

  // Verify the contract is working
  console.log("\n🧪 Testing contract functions...");
  
  const ticketPrice = await eventTicketNFT.ticketPrice();
  const maxTicketsPerEvent = await eventTicketNFT.MAX_TICKETS_PER_EVENT();
  const owner = await eventTicketNFT.owner();
  
  console.log("💰 Ticket price:", ethers.formatEther(ticketPrice), "LSK");
  console.log("🎫 Max tickets per event:", maxTicketsPerEvent.toString());
  console.log("👤 Contract owner:", owner);

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
    deployer: owner
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
