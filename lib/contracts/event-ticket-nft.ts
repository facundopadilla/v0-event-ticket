import { ethers } from 'ethers';
import { liskTestnet, liskMainnet } from '@/lib/lisk-config';

// ABI for the EventTicketNFT contract
export const EVENT_TICKET_NFT_ABI = [
  // Read functions
  "function ticketPrice() view returns (uint256)",
  "function MAX_TICKETS_PER_EVENT() view returns (uint256)",
  "function ticketsPerEvent(uint256 eventId, address owner) view returns (uint256)",
  "function tickets(uint256 tokenId) view returns (tuple(uint256 eventId, bool isUsed, uint256 mintedAt, string eventTitle))",
  "function getTicketsByOwnerForEvent(address owner, uint256 eventId) view returns (uint256[])",
  "function getTicketsForEvent(uint256 eventId) view returns (uint256[])",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  
  // Write functions
  "function mintTicket(uint256 eventId, address recipient, string calldata eventTitle, string calldata metadataURI) payable",
  "function useTicket(uint256 tokenId)",
  "function setTicketPrice(uint256 newPrice)",
  "function withdraw()",
  
  // Events
  "event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed recipient, string metadataURI)",
  "event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Get contract instance for reading
export function getEventTicketNFTContract(provider: ethers.BrowserProvider, isTestnet = true) {
  const config = isTestnet ? liskTestnet : liskMainnet;
  
  // For development, we'll use a placeholder address until deployed
  const contractAddress = config.contractAddress || "0x0000000000000000000000000000000000000000";
  
  return new ethers.Contract(contractAddress, EVENT_TICKET_NFT_ABI, provider);
}

// Get contract with signer for writing
export async function getEventTicketNFTContractWithSigner(provider: ethers.BrowserProvider, isTestnet = true) {
  const signer = await provider.getSigner();
  const config = isTestnet ? liskTestnet : liskMainnet;
  
  // For development, we'll use a placeholder address until deployed
  const contractAddress = config.contractAddress || "0x0000000000000000000000000000000000000000";
  
  return new ethers.Contract(contractAddress, EVENT_TICKET_NFT_ABI, signer);
}

// Types
export interface TicketInfo {
  eventId: bigint;
  isUsed: boolean;
  mintedAt: bigint;
  eventTitle: string;
}

export interface TicketMintedEvent {
  tokenId: bigint;
  eventId: bigint;
  recipient: string;
  metadataURI: string;
}

// Mock functions for development (until contract is deployed)
export const MOCK_TICKET_PRICE = "0.01"; // 0.01 LSK
export const MOCK_MAX_TICKETS = 4;

// Helper functions
export function formatLSK(amount: bigint): string {
  return ethers.formatEther(amount);
}

export function parseLSK(amount: string): bigint {
  return ethers.parseEther(amount);
}

// Check if contract is deployed
export function isContractDeployed(isTestnet = true): boolean {
  const config = isTestnet ? liskTestnet : liskMainnet;
  return config.contractAddress !== "0x0000000000000000000000000000000000000000" && 
         config.contractAddress !== "";
}
