// Lisk Network Configuration
export const LISK_NETWORK = {
  chainId: 1135, // Lisk Mainnet
  chainName: "Lisk",
  nativeCurrency: {
    name: "LSK",
    symbol: "LSK", 
    decimals: 18
  },
  rpcUrls: ["https://rpc.api.lisk.com"],
  blockExplorerUrls: ["https://blockscout.lisk.com"]
}

// Lisk Network Configuration
export const liskTestnet = {
  chainId: 4202,
  name: 'Lisk Sepolia Testnet',
  rpcUrl: 'https://rpc.sepolia-api.lisk.com',
  blockExplorer: 'https://sepolia-blockscout.lisk.com',
  contractAddress: '0xBdD45C68f44Ef4d9db4F5dEa4F6f163dac88ac2f', // EventTicketNFT contract deployed
  nativeCurrency: {
    name: 'LSK',
    symbol: 'LSK',
    decimals: 18,
  },
} as const;

export const liskMainnet = {
  chainId: 1135,
  name: 'Lisk Mainnet',
  rpcUrl: 'https://rpc.api.lisk.com',
  blockExplorer: 'https://blockscout.lisk.com',
  contractAddress: '0x0000000000000000000000000000000000000000', // Will be updated after deployment
  nativeCurrency: {
    name: 'LSK',
    symbol: 'LSK',
    decimals: 18,
  },
} as const;

// Contract addresses (updated after deployment)
export const CONTRACTS = {
  EVENT_TICKET_NFT: {
    MAINNET: "", // To be deployed
    TESTNET: "0xBdD45C68f44Ef4d9db4F5dEa4F6f163dac88ac2f"  // Deployed on Lisk Sepolia
  }
}
