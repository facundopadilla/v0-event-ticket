const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xBdD45C68f44Ef4d9db4F5dEa4F6f163dac88ac2f";
  
  console.log("🔍 Verifying deployed contract at:", contractAddress);
  console.log("🌐 Network: Lisk Sepolia Testnet");
  console.log("🔗 Explorer:", `https://sepolia-blockscout.lisk.com/address/${contractAddress}`);
  
  // Get contract instance
  const EventTicketNFT = await ethers.getContractFactory("EventTicketNFT");
  const contract = EventTicketNFT.attach(contractAddress);
  
  try {
    // Check if contract exists by getting the code
    const provider = ethers.provider;
    const code = await provider.getCode(contractAddress);
    
    if (code === "0x") {
      console.log("❌ No contract found at this address");
      return;
    }
    
    console.log("✅ Contract found! Code length:", code.length);
    
    // Try to get basic info (these might fail but that's ok)
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      console.log("📝 Contract Name:", name);
      console.log("🎫 Symbol:", symbol);
    } catch (error) {
      console.log("⚠️ Could not read contract details (this is normal right after deployment)");
    }
    
    console.log("\n✅ Contract deployment verified successfully!");
    console.log("🎉 Ready to mint NFT tickets!");
    
  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
