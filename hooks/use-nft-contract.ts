"use client"

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './use-wallet';
import { 
  getEventTicketNFTContract, 
  getEventTicketNFTContractWithSigner,
  formatLSK,
  parseLSK,
  isContractDeployed,
  MOCK_TICKET_PRICE,
  MOCK_MAX_TICKETS,
  type TicketInfo,
  type TicketMintedEvent
} from '@/lib/contracts/event-ticket-nft';

export function useNFTContract(isTestnet = true) {
  const { address, isConnected, chainId } = useWallet();
  const [ticketPrice, setTicketPrice] = useState<string>(MOCK_TICKET_PRICE);
  const [maxTicketsPerEvent, setMaxTicketsPerEvent] = useState<number>(MOCK_MAX_TICKETS);
  const [loading, setLoading] = useState(false);
  const [contractDeployed, setContractDeployed] = useState(false);

  // Get provider from window.ethereum
  const getProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  };

  // Load contract data when wallet is connected
  useEffect(() => {
    if (isConnected && chainId) {
      checkContractAndLoadData();
    }
  }, [isConnected, chainId]);

  const checkContractAndLoadData = async () => {
    const deployed = isContractDeployed(isTestnet);
    setContractDeployed(deployed);
    
    if (deployed) {
      await loadContractData();
    } else {
      // Use mock data for development
      setTicketPrice(MOCK_TICKET_PRICE);
      setMaxTicketsPerEvent(MOCK_MAX_TICKETS);
    }
  };

  const loadContractData = async () => {
    const provider = getProvider();
    if (!provider || !contractDeployed) return;
    
    try {
      const contract = getEventTicketNFTContract(provider, isTestnet);
      
      const [price, maxTickets] = await Promise.all([
        contract.ticketPrice(),
        contract.MAX_TICKETS_PER_EVENT()
      ]);
      
      setTicketPrice(formatLSK(price));
      setMaxTicketsPerEvent(Number(maxTickets));
    } catch (error) {
      console.error('Error loading contract data:', error);
      // Fallback to mock data
      setTicketPrice(MOCK_TICKET_PRICE);
      setMaxTicketsPerEvent(MOCK_MAX_TICKETS);
    }
  };

  const mintTicket = async (
    eventId: number,
    recipient: string,
    eventTitle: string,
    metadataURI: string
  ): Promise<{ success: boolean; tokenId?: bigint; error?: string; txHash?: string }> => {
    const provider = getProvider();
    if (!provider || !isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    // Check if user's wallet is on the correct network
    if (chainId !== (isTestnet ? 4202 : 1135)) {
      return { 
        success: false, 
        error: `Please switch to ${isTestnet ? 'Lisk Sepolia Testnet' : 'Lisk Mainnet'}` 
      };
    }

    setLoading(true);
    try {
      if (contractDeployed) {
        // Real contract interaction
        const contract = await getEventTicketNFTContractWithSigner(provider, isTestnet);
        const price = await contract.ticketPrice();
        
        const tx = await contract.mintTicket(
          eventId,
          recipient,
          eventTitle,
          metadataURI,
          { value: price }
        );
        
        const receipt = await tx.wait();
        
        // Find the TicketMinted event to get the token ID
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === 'TicketMinted';
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = contract.interface.parseLog(event);
          const tokenId = parsed?.args.tokenId;
          return { 
            success: true, 
            tokenId, 
            txHash: receipt.hash 
          };
        }
        
        return { 
          success: true, 
          txHash: receipt.hash 
        };
      } else {
        // Mock implementation for development
        console.log('🎫 Mock: Minting ticket for event:', eventId);
        console.log('📝 Event title:', eventTitle);
        console.log('👤 Recipient:', recipient);
        console.log('🏷️ Metadata URI:', metadataURI);
        console.log('💰 Price:', ticketPrice, 'LSK');
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate mock token ID
        const mockTokenId = BigInt(Math.floor(Math.random() * 10000) + 1);
        
        return { 
          success: true, 
          tokenId: mockTokenId,
          txHash: `0x${Math.random().toString(16).slice(2)}`
        };
      }
    } catch (error: any) {
      console.error('Error minting ticket:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to mint ticket' 
      };
    } finally {
      setLoading(false);
    }
  };

  const getTicketsByOwnerForEvent = async (
    owner: string,
    eventId: number
  ): Promise<bigint[]> => {
    const provider = getProvider();
    if (!provider || !contractDeployed) return [];
    
    try {
      const contract = getEventTicketNFTContract(provider, isTestnet);
      return await contract.getTicketsByOwnerForEvent(owner, eventId);
    } catch (error) {
      console.error('Error getting tickets by owner for event:', error);
      return [];
    }
  };

  // Get ALL tickets for a user across all events
  const getAllTicketsByOwner = async (owner: string): Promise<Array<{
    tokenId: string;
    eventId: string;
    isUsed: boolean;
    mintedAt: string;
    eventTitle: string;
  }>> => {
    const provider = getProvider();
    if (!provider || !owner) return [];

    // In development mode without deployed contract, return mock data
    if (!contractDeployed) {
      console.log('Using mock tickets for all events');
      return [
        {
          tokenId: "1",
          eventId: "1",
          isUsed: false,
          mintedAt: Date.now().toString(),
          eventTitle: "Mock Event 1"
        },
        {
          tokenId: "2",
          eventId: "2", 
          isUsed: true,
          mintedAt: (Date.now() - 86400000).toString(), // Yesterday
          eventTitle: "Mock Event 2"
        }
      ];
    }
    
    try {
      const contract = getEventTicketNFTContract(provider, isTestnet);
      console.log("Getting all tickets for user:", owner);
      
      // Get total supply - we'll iterate through all tokens
      // Note: This is not the most efficient way, but it works for the hackathon
      // In production, you'd want events or a mapping
      const userTickets = [];
      
      // Start from token ID 1 and check up to a reasonable limit
      // In a real implementation, you'd track the next token ID
      for (let tokenId = 1; tokenId <= 10000; tokenId++) {
        try {
          const tokenOwner = await contract.ownerOf(BigInt(tokenId));
          if (tokenOwner.toLowerCase() === owner.toLowerCase()) {
            const ticketInfo = await contract.tickets(BigInt(tokenId));
            userTickets.push({
              tokenId: tokenId.toString(),
              eventId: ticketInfo.eventId.toString(),
              isUsed: ticketInfo.isUsed,
              mintedAt: ticketInfo.mintedAt.toString(),
              eventTitle: ticketInfo.eventTitle
            });
          }
        } catch (error) {
          // Token doesn't exist or other error, stop searching
          break;
        }
      }

      console.log("Found user tickets:", userTickets);
      return userTickets;
    } catch (error) {
      console.error('Error getting all tickets by owner:', error);
      return [];
    }
  };

  const getTicketInfo = async (tokenId: bigint): Promise<TicketInfo | null> => {
    const provider = getProvider();
    if (!provider || !contractDeployed) return null;
    
    try {
      const contract = getEventTicketNFTContract(provider, isTestnet);
      return await contract.tickets(tokenId);
    } catch (error) {
      console.error('Error getting ticket info:', error);
      return null;
    }
  };

  const getTicketsForEvent = async (eventId: number): Promise<bigint[]> => {
    const provider = getProvider();
    if (!provider || !contractDeployed) return [];
    
    try {
      const contract = getEventTicketNFTContract(provider, isTestnet);
      return await contract.getTicketsForEvent(eventId);
    } catch (error) {
      console.error('Error getting tickets for event:', error);
      return [];
    }
  };

  const getTicketCount = async (owner: string, eventId: number): Promise<number> => {
    const provider = getProvider();
    if (!provider) return 0;
    
    if (contractDeployed) {
      try {
        const contract = getEventTicketNFTContract(provider, isTestnet);
        const count = await contract.ticketsPerEvent(eventId, owner);
        return Number(count);
      } catch (error) {
        console.error('Error getting ticket count:', error);
        return 0;
      }
    } else {
      // Mock implementation - check localStorage for development
      try {
        const key = `tickets_${owner}_${eventId}`;
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored) : 0;
      } catch {
        return 0;
      }
    }
  };

  // Helper to simulate ticket purchase in development
  const recordMockTicketPurchase = (owner: string, eventId: number) => {
    try {
      const key = `tickets_${owner}_${eventId}`;
      const current = parseInt(localStorage.getItem(key) || '0');
      localStorage.setItem(key, String(current + 1));
    } catch (error) {
      console.error('Error recording mock ticket purchase:', error);
    }
  };

  // Transfer NFT ticket to another address
  const transferTicket = useCallback(async (
    fromAddress: string,
    toAddress: string,
    tokenId: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    const provider = getProvider();
    if (!provider || !isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    // Check if user's wallet is on the correct network
    if (chainId !== (isTestnet ? 4202 : 1135)) {
      return { 
        success: false, 
        error: `Please switch to ${isTestnet ? 'Lisk Sepolia Testnet' : 'Lisk Mainnet'}` 
      };
    }

    // Validate addresses
    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      return { success: false, error: 'Invalid recipient address' };
    }

    if (fromAddress.toLowerCase() === toAddress.toLowerCase()) {
      return { success: false, error: 'Cannot transfer to yourself' };
    }

    setLoading(true);
    try {
      if (contractDeployed) {
        // Real contract interaction
        const contract = await getEventTicketNFTContractWithSigner(provider, isTestnet);
        
        // Use safeTransferFrom to transfer the NFT
        const tx = await contract.safeTransferFrom(
          fromAddress,
          toAddress,
          BigInt(tokenId)
        );
        
        const receipt = await tx.wait();
        console.log('NFT transfer successful:', receipt.hash);
        
        return { 
          success: true, 
          txHash: receipt.hash 
        };
      } else {
        // Mock implementation for development
        console.log('🔄 Mock: Transferring NFT');
        console.log('📤 From:', fromAddress);
        console.log('📥 To:', toAddress);
        console.log('🎫 Token ID:', tokenId);
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return { 
          success: true, 
          txHash: `0x${Math.random().toString(16).slice(2)}`
        };
      }
    } catch (error: any) {
      console.error('Error transferring NFT:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to transfer NFT' 
      };
    } finally {
      setLoading(false);
    }
  }, [isConnected, chainId, contractDeployed, isTestnet]);

  return {
    // State
    ticketPrice,
    maxTicketsPerEvent,
    loading,
    contractDeployed,
    
    // Actions
    mintTicket,
    transferTicket,
    getTicketsByOwnerForEvent,
    getAllTicketsByOwner,
    getTicketInfo,
    getTicketsForEvent,
    getTicketCount,
    recordMockTicketPurchase,
    
    // Helpers
    formatLSK,
    parseLSK,
  };
}
