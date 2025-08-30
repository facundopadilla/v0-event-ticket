import { ethers } from "ethers"

// Event Ticket NFT Contract ABI (simplified ERC-721 with custom functions)
export const EVENT_TICKET_NFT_ABI = [
  // ERC-721 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",

  // Custom Event Ticket Functions
  "function mintTicket(address to, uint256 eventId, string memory metadataURI) returns (uint256)",
  "function useTicket(uint256 tokenId)",
  "function isTicketUsed(uint256 tokenId) view returns (bool)",
  "function getEventId(uint256 tokenId) view returns (uint256)",
  "function getTicketsByEvent(uint256 eventId) view returns (uint256[])",
  "function getTicketsByOwner(address owner) view returns (uint256[])",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed owner)",
  "event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId)",
] as const

// Contract addresses (these would be deployed contracts)
export const CONTRACT_ADDRESSES = {
  // Mainnet addresses (to be deployed)
  1: {
    EVENT_TICKET_NFT: "0x0000000000000000000000000000000000000000",
  },
  // Sepolia testnet addresses
  11155111: {
    EVENT_TICKET_NFT: "0x0000000000000000000000000000000000000000",
  },
  // Local development
  31337: {
    EVENT_TICKET_NFT: "0x0000000000000000000000000000000000000000",
  },
} as const

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES

export interface NFTTicket {
  tokenId: string
  eventId: string
  owner: string
  metadataURI: string
  isUsed: boolean
  contractAddress: string
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  eventId: string
  ticketNumber: number
}

export class EventTicketNFTContract {
  private contract: ethers.Contract
  private provider: ethers.Provider
  private signer?: ethers.Signer

  constructor(contractAddress: string, provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider
    this.signer = signer
    this.contract = new ethers.Contract(contractAddress, EVENT_TICKET_NFT_ABI, signer || provider)
  }

  // Read functions
  async getName(): Promise<string> {
    return await this.contract.name()
  }

  async getSymbol(): Promise<string> {
    return await this.contract.symbol()
  }

  async getTokenURI(tokenId: string): Promise<string> {
    return await this.contract.tokenURI(tokenId)
  }

  async getOwnerOf(tokenId: string): Promise<string> {
    return await this.contract.ownerOf(tokenId)
  }

  async getBalanceOf(owner: string): Promise<number> {
    const balance = await this.contract.balanceOf(owner)
    return balance.toNumber()
  }

  async isTicketUsed(tokenId: string): Promise<boolean> {
    return await this.contract.isTicketUsed(tokenId)
  }

  async getEventId(tokenId: string): Promise<string> {
    const eventId = await this.contract.getEventId(tokenId)
    return eventId.toString()
  }

  async getTicketsByEvent(eventId: string): Promise<string[]> {
    const tickets = await this.contract.getTicketsByEvent(eventId)
    return tickets.map((t: any) => t.toString())
  }

  async getTicketsByOwner(owner: string): Promise<string[]> {
    const tickets = await this.contract.getTicketsByOwner(owner)
    return tickets.map((t: any) => t.toString())
  }

  // Write functions (require signer)
  async mintTicket(to: string, eventId: string, metadataURI: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error("Signer required for minting")
    }
    return await this.contract.mintTicket(to, eventId, metadataURI)
  }

  async useTicket(tokenId: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error("Signer required for using ticket")
    }
    return await this.contract.functions.useTicket(tokenId)
  }

  async transferFrom(from: string, to: string, tokenId: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error("Signer required for transfer")
    }
    return await this.contract.transferFrom(from, to, tokenId)
  }

  async approve(to: string, tokenId: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error("Signer required for approval")
    }
    return await this.contract.approve(to, tokenId)
  }

  async setApprovalForAll(operator: string, approved: boolean): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error("Signer required for approval")
    }
    return await this.contract.setApprovalForAll(operator, approved)
  }

  // Event listeners
  onTicketMinted(callback: (tokenId: string, eventId: string, owner: string) => void) {
    this.contract.on("TicketMinted", (tokenId, eventId, owner) => {
      callback(tokenId.toString(), eventId.toString(), owner)
    })
  }

  onTicketUsed(callback: (tokenId: string, eventId: string) => void) {
    this.contract.on("TicketUsed", (tokenId, eventId) => {
      callback(tokenId.toString(), eventId.toString())
    })
  }

  onTransfer(callback: (from: string, to: string, tokenId: string) => void) {
    this.contract.on("Transfer", (from, to, tokenId) => {
      callback(from, to, tokenId.toString())
    })
  }

  // Utility functions
  static getContractAddress(chainId: number): string {
    const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId]
    if (!addresses) {
      throw new Error(`Unsupported chain ID: ${chainId}`)
    }
    return addresses.EVENT_TICKET_NFT
  }

  static async createMetadata(
    eventTitle: string,
    eventDescription: string,
    eventDate: string,
    eventLocation: string,
    ticketNumber: number,
    eventId: string,
    imageUrl?: string,
  ): Promise<NFTMetadata> {
    return {
      name: `${eventTitle} - Ticket #${ticketNumber}`,
      description: `Event ticket for ${eventTitle}. ${eventDescription}`,
      image: imageUrl || `https://via.placeholder.com/400x600/6366f1/ffffff?text=Ticket+${ticketNumber}`,
      attributes: [
        {
          trait_type: "Event",
          value: eventTitle,
        },
        {
          trait_type: "Date",
          value: eventDate,
        },
        {
          trait_type: "Location",
          value: eventLocation,
        },
        {
          trait_type: "Ticket Number",
          value: ticketNumber,
        },
        {
          trait_type: "Event ID",
          value: eventId,
        },
      ],
      eventId,
      ticketNumber,
    }
  }
}
