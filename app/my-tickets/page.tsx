'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Ticket, ArrowLeft, Plus, Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import { MyTicketsGrid } from "@/components/my-tickets-grid";
import { useWallet } from '@/hooks/use-wallet';
import { useNFTContract } from '@/hooks/use-nft-contract';
import { WalletConnectButton } from '@/components/wallet-connect-button';

interface TicketData {
  tokenId: string;
  eventId: string;
  isUsed: boolean;
  mintedAt: string;
  eventTitle: string;
}

export default function MyTicketsPage() {
  const { isConnected, address } = useWallet();
  const { getAllTicketsByOwner } = useNFTContract();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user tickets when wallet is connected
  useEffect(() => {
    const loadTickets = async () => {
      if (!isConnected || !address) {
        console.log('Wallet not connected, clearing tickets');
        setTickets([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading tickets for address:', address);
        const userTickets = await getAllTicketsByOwner(address);
        console.log('Loaded tickets:', userTickets);
        setTickets(userTickets);
      } catch (err) {
        console.error('Error loading tickets:', err);
        setError('Failed to load your tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [isConnected, address, getAllTicketsByOwner]);

  // Debug function to check contract status
  const debugContract = async () => {
    if (!isConnected || !address) {
      console.log('❌ Wallet not connected');
      return;
    }

    console.log('🔍 Starting contract debug...');
    console.log('📍 Wallet address:', address);
    
    try {
      // Check if window.ethereum is available
      if (!window.ethereum) {
        console.log('❌ window.ethereum not available');
        return;
      }

      // Check current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('🌐 Current chain ID:', chainId, '(should be 0x106a for Lisk Sepolia)');
      
      // Check if we're on the correct network
      const expectedChainId = '0x106a'; // 4202 in hex
      if (chainId !== expectedChainId) {
        console.log('❌ Wrong network! Current:', chainId, 'Expected:', expectedChainId);
        setError(`Please switch to Lisk Sepolia Testnet (Chain ID: 4202). Currently on: ${parseInt(chainId, 16)}`);
        return;
      } else {
        console.log('✅ Correct network!');
      }
      
      // Check contract deployment
      const { isContractDeployed } = await import('@/lib/contracts/event-ticket-nft');
      const deployed = isContractDeployed(true); // testnet = true
      console.log('📋 Contract deployed:', deployed);
      
      // Try to get provider
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log('🔌 Provider created:', !!provider);
      
      // Check contract address
      const { liskTestnet } = await import('@/lib/lisk-config');
      console.log('📍 Configured contract address:', liskTestnet.contractAddress);
      
      // Verify contract exists at address
      const code = await provider.getCode(liskTestnet.contractAddress);
      console.log('📋 Contract code length:', code.length, '(should be > 2 for deployed contract)');
      if (code === '0x') {
        console.log('❌ No contract found at address');
        setError(`No contract deployed at address: ${liskTestnet.contractAddress}`);
        return;
      } else {
        console.log('✅ Contract found at address!');
      }
      
      // Try to call getAllTicketsByOwner with detailed logging
      console.log('🎫 Calling getAllTicketsByOwner...');
      const userTickets = await getAllTicketsByOwner(address);
      console.log('📊 Result:', userTickets);
      
      // Let's also test the conversion function
      console.log('🔄 Testing UUID conversion...');
      const testUuid = '24f5df33-4aaa-4ff6-a922-a30b8d9225b1'; // Your event UUID
      const { uuidToEventId } = await import('@/components/ticket-purchase-card');
      const numericEventId = uuidToEventId(testUuid);
      console.log('📋 UUID:', testUuid, '→ Numeric:', numericEventId);
      
    } catch (error) {
      console.error('💥 Debug error:', error);
    }
  };

  // Manual refresh function
  const refreshTickets = async () => {
    if (!isConnected || !address) return;
    
    // Run debug first
    await debugContract();
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Manually refreshing tickets for address:', address);
      const userTickets = await getAllTicketsByOwner(address);
      console.log('Refreshed tickets:', userTickets);
      setTickets(userTickets);
    } catch (err) {
      console.error('Error refreshing tickets:', err);
      setError('Failed to refresh your tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                My NFT Tickets
              </span>
            </div>
            <div className="flex items-center gap-4">
              {isConnected && (
                <div className="text-sm text-slate-400">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              )}
              <Button
                asChild
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              >
                <Link href="/marketplace">
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">My NFT Tickets</h1>
              <p className="text-slate-400">Your event tickets stored as NFTs on the blockchain</p>
            </div>
            {isConnected && (
              <div className="flex gap-2">
                <Button
                  onClick={debugContract}
                  variant="outline"
                  className="border-yellow-600 text-yellow-300 hover:text-yellow-200 bg-transparent"
                >
                  🔍 Debug
                </Button>
                <Button
                  onClick={refreshTickets}
                  disabled={loading}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <span className="mr-2">🔄</span>
                  )}
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <Wallet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-200 mb-4">Connect Your Wallet</h3>
            <p className="text-slate-400 mb-6">
              Please connect your wallet to view your NFT tickets stored on the blockchain.
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <>
            {/* Loading State */}
            {loading && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading your tickets from the blockchain...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <Button 
                  onClick={refreshTickets}
                  disabled={loading}
                  variant="outline" 
                  className="border-red-600 text-red-400 hover:text-red-300"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <span className="mr-2">🔄</span>
                  )}
                  Try Again
                </Button>
              </div>
            )}

            {/* Tickets Grid */}
            {!loading && !error && (
              <>
                {tickets.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                    <Ticket className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-200 mb-4">No Tickets Found</h3>
                    <p className="text-slate-400 mb-6">
                      You don&apos;t have any NFT tickets yet. Browse events and purchase tickets to get started!
                    </p>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700">
                      <Link href="/events">
                        <Plus className="w-4 h-4 mr-2" />
                        Browse Events
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400">
                        Found {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} in your wallet
                      </p>
                    </div>
                    <MyTicketsGrid tickets={tickets} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
