const { ethers } = require('ethers');

// Your current private key from .env
const privateKey = '550d97ca46038f67f0749122a02ea8c1cfc46083c193dc0601985b5722d9ff69';

try {
  // Create wallet from existing private key
  const wallet = new ethers.Wallet(privateKey);
  
  console.log('🔍 Your Current Wallet Info:');
  console.log('=====================================');
  console.log('Address:', wallet.address);
  console.log('Private Key:', privateKey);
  console.log('=====================================');
  console.log('');
  console.log('📋 Steps to check your tokens:');
  console.log('1. Add this address to MetaMask:', wallet.address);
  console.log('2. Make sure you have Lisk Sepolia network added');
  console.log('3. Check balance in MetaMask or block explorer');
  console.log('4. Block explorer: https://sepolia-blockscout.lisk.com/address/' + wallet.address);
  
} catch (error) {
  console.error('Error with private key:', error.message);
}
