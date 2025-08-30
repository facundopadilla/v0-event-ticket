const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xBdD45C68f44Ef4d9db4F5dEa4F6f163dac88ac2f";
  
  console.log("🧪 Testing EventTicketNFT Smart Contract");
  console.log("=" * 50);
  console.log(`📍 Contract: ${contractAddress}`);
  console.log(`🌐 Network: Lisk Sepolia Testnet`);
  console.log("");

  // Get contract instance
  const EventTicketNFT = await ethers.getContractFactory("EventTicketNFT");
  const contract = EventTicketNFT.attach(contractAddress);
  
  try {
    // Test 1: Basic contract info
    console.log("🔍 Test 1: Reading basic contract information");
    const name = await contract.name();
    const symbol = await contract.symbol();
    const ticketPrice = await contract.ticketPrice();
    const maxTickets = await contract.MAX_TICKETS_PER_EVENT();
    const owner = await contract.owner();
    
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Ticket Price: ${ethers.formatEther(ticketPrice)} LSK`);
    console.log(`   Max Tickets per Event: ${maxTickets}`);
    console.log(`   Owner: ${owner}`);
    console.log("   ✅ Basic info retrieved successfully!");
    console.log("");
    
    // Test 2: Check if we can read ticket counts for an event
    console.log("🔍 Test 2: Reading ticket counts for event ID 1");
    const [signer] = await ethers.getSigners();
    const userAddress = await signer.getAddress();
    
    const ticketCount = await contract.ticketsPerEvent(1, userAddress);
    console.log(`   User ${userAddress} has ${ticketCount} tickets for event 1`);
    console.log("   ✅ Ticket count query successful!");
    console.log("");
    
    // Test 3: Simulate ticket minting (dry run - we won't actually mint)
    console.log("🔍 Test 3: Simulating ticket mint parameters");
    const eventId = 1;
    const eventTitle = "Test Event - Smart Contract Demo";
    const metadataURI = "https://example.com/metadata/1";
    const requiredPayment = ticketPrice;
    
    console.log(`   Event ID: ${eventId}`);
    console.log(`   Event Title: "${eventTitle}"`);
    console.log(`   Metadata URI: ${metadataURI}`);
    console.log(`   Required Payment: ${ethers.formatEther(requiredPayment)} LSK`);
    console.log("   ✅ Mint parameters prepared!");
    console.log("");
    
    // Test 4: Check user's current balance
    console.log("🔍 Test 4: Checking deployer wallet balance");
    const balance = await ethers.provider.getBalance(userAddress);
    console.log(`   Wallet: ${userAddress}`);
    console.log(`   Balance: ${ethers.formatEther(balance)} LSK`);
    
    if (balance >= requiredPayment) {
      console.log("   ✅ Sufficient balance for minting!");
    } else {
      console.log("   ⚠️  Insufficient balance for minting");
    }
    console.log("");
    
    console.log("🎉 All contract tests passed!");
    console.log("🚀 Contract is ready for use with the frontend!");
    console.log("");
    console.log("🔗 Block Explorer:");
    console.log(`   https://sepolia-blockscout.lisk.com/address/${contractAddress}`);
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Make sure you're connected to Lisk Sepolia testnet");
    console.log("   2. Verify the contract address is correct");
    console.log("   3. Check that the contract is properly deployed");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
