'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Ticket, ArrowLeft, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { MyTicketsGrid } from "@/components/my-tickets-grid";
import { useWallet } from '@/hooks/use-wallet';
// import { useNFTContract } from '@/hooks/use-nft-contract'; // Temporarily disabled
import { WalletConnectButton } from '@/components/wallet-connect-button';

interface TicketData {
  tokenId: string;
  eventId: string;
  isUsed: boolean;
  mintedAt: string;
  eventTitle: string;
}

// Mock data to prevent infinite loops
const MOCK_TICKETS: TicketData[] = [
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

export default function MyTicketsPage() {
  const { isConnected, address } = useWallet();
  // Temporarily use static data to prevent loops
  const tickets = isConnected ? MOCK_TICKETS : [];
  const loading = false;
  const error = null;

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
          <h1 className="text-3xl font-bold text-slate-100 mb-2">My NFT Tickets</h1>
          <p className="text-slate-400">Your event tickets stored as NFTs on the blockchain</p>
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
                <p className="text-red-400">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-4 border-red-600 text-red-400 hover:text-red-300"
                >
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
