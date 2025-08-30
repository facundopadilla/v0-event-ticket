const { ethers } = require('ethers');

async function checkBalance() {
  try {
    // Connect to Lisk Sepolia testnet
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia-api.lisk.com');
    
    // Your wallet address
    const address = '0x6aFE9Dc1dEB5Ed8985a38084577abAb446EF3441';
    
    console.log('🔍 Checking balance for:', address);
    console.log('Network: Lisk Sepolia Testnet');
    console.log('=====================================');
    
    // Get balance
    const balance = await provider.getBalance(address);
    const balanceInLSK = ethers.formatEther(balance);
    
    console.log('💰 Balance:', balanceInLSK, 'LSK');
    
    if (balance > 0) {
      console.log('✅ You have LSK! Ready to deploy contracts.');
    } else {
      console.log('❌ No LSK found. You need to get tokens from the faucet.');
      console.log('');
      console.log('🚰 Get LSK from faucet:');
      console.log('1. Go to: https://sepolia-faucet.lisk.com/');
      console.log('2. Enter your address:', address);
      console.log('3. Complete captcha and request tokens');
      console.log('4. Wait 1-2 minutes and run this script again');
    }
    
    // Get network info
    const network = await provider.getNetwork();
    console.log('');
    console.log('🌐 Network Info:');
    console.log('Chain ID:', Number(network.chainId));
    console.log('Network Name:', network.name);
    
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
    console.log('');
    console.log('💡 This might happen if:');
    console.log('- Network connection issues');
    console.log('- RPC endpoint is down');
    console.log('- Invalid address format');
  }
}

checkBalance();
