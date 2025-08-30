"use client"

import { useState, useEffect, useCallback } from "react"
import { EventTicketNFTContract, type NFTTicket } from "@/lib/contracts/event-ticket-nft"
import { useWallet } from "./use-wallet"

export function useNFTContract() {
  const { provider, signer, account, chainId } = useWallet()
  const [contract, setContract] = useState<EventTicketNFTContract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize contract when wallet connects
  useEffect(() => {
    if (provider && chainId) {
      try {
        const contractAddress = EventTicketNFTContract.getContractAddress(chainId)
        const nftContract = new EventTicketNFTContract(contractAddress, provider, signer || undefined)
        setContract(nftContract)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize contract")
        setContract(null)
      }
    } else {
      setContract(null)
    }
  }, [provider, signer, chainId])

  // Mint a new ticket NFT
  const mintTicket = useCallback(
    async (to: string, eventId: string, metadataURI: string): Promise<string | null> => {
      if (!contract || !signer) {
        setError("Contract or signer not available")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const tx = await contract.mintTicket(to, eventId, metadataURI)
        const receipt = await tx.wait()

        // Extract token ID from events
        const mintEvent = receipt.events?.find((e) => e.event === "TicketMinted")
        const tokenId = mintEvent?.args?.tokenId?.toString()

        return tokenId || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to mint ticket"
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contract, signer],
  )

  // Get tickets owned by an address
  const getTicketsByOwner = useCallback(
    async (owner: string): Promise<NFTTicket[]> => {
      if (!contract) {
        return []
      }

      setIsLoading(true)
      setError(null)

      try {
        const tokenIds = await contract.getTicketsByOwner(owner)
        const tickets: NFTTicket[] = []

        for (const tokenId of tokenIds) {
          const [metadataURI, eventId, isUsed] = await Promise.all([
            contract.getTokenURI(tokenId),
            contract.getEventId(tokenId),
            contract.isTicketUsed(tokenId),
          ])

          tickets.push({
            tokenId,
            eventId,
            owner,
            metadataURI,
            isUsed,
            contractAddress: EventTicketNFTContract.getContractAddress(chainId!),
          })
        }

        return tickets
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch tickets"
        setError(errorMessage)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [contract, chainId],
  )

  // Get tickets for a specific event
  const getTicketsByEvent = useCallback(
    async (eventId: string): Promise<NFTTicket[]> => {
      if (!contract) {
        return []
      }

      setIsLoading(true)
      setError(null)

      try {
        const tokenIds = await contract.getTicketsByEvent(eventId)
        const tickets: NFTTicket[] = []

        for (const tokenId of tokenIds) {
          const [owner, metadataURI, isUsed] = await Promise.all([
            contract.getOwnerOf(tokenId),
            contract.getTokenURI(tokenId),
            contract.isTicketUsed(tokenId),
          ])

          tickets.push({
            tokenId,
            eventId,
            owner,
            metadataURI,
            isUsed,
            contractAddress: EventTicketNFTContract.getContractAddress(chainId!),
          })
        }

        return tickets
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch event tickets"
        setError(errorMessage)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [contract, chainId],
  )

  // Use a ticket (mark as used)
  const useTicket = useCallback(
    async (tokenId: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        if (!contract || !signer) {
          setError("Contract or signer not available")
          return false
        }

        const tx = await contract.useTicket(tokenId)
        await tx.wait()
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to use ticket"
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, signer],
  )

  // Transfer a ticket
  const transferTicket = useCallback(
    async (from: string, to: string, tokenId: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        if (!contract || !signer) {
          setError("Contract or signer not available")
          return false
        }

        const tx = await contract.transferFrom(from, to, tokenId)
        await tx.wait()
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to transfer ticket"
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, signer],
  )

  return {
    contract,
    isLoading,
    error,
    mintTicket,
    getTicketsByOwner,
    getTicketsByEvent,
    useTicket,
    transferTicket,
    isContractReady: !!contract && !!signer,
  }
}
