const { ethers } = require('ethers');

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('🔑 New Wallet Generated:');
console.log('=====================================');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey.slice(2)); // Remove 0x prefix
console.log('Mnemonic:', wallet.mnemonic.phrase);
console.log('=====================================');
console.log('');
console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('- Save this information in a secure place');
console.log('- Never share your private key with anyone');
console.log('- This wallet has no funds - you need to add LSK for gas');
console.log('- Use this only for development/testing purposes');
console.log('');
console.log('💡 Next steps:');
console.log('1. Copy the private key (without 0x) to your .env file');
console.log('2. Add this address to MetaMask to monitor it');
console.log('3. Get LSK from the Lisk testnet faucet');
console.log('4. Deploy your contract');
