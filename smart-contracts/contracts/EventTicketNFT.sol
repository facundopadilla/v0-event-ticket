// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EventTicketNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Events
    event TicketMinted(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed recipient,
        string metadataURI
    );
    
    event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId);

    // Structs
    struct TicketInfo {
        uint256 eventId;
        bool isUsed;
        uint256 mintedAt;
        string eventTitle;
    }

    // State variables
    uint256 private _nextTokenId = 1;
    
    // Mapping from event ID to address to ticket count (max 4 per address per event)
    mapping(uint256 => mapping(address => uint256)) public ticketsPerEvent;
    
    // Mapping from token ID to ticket info
    mapping(uint256 => TicketInfo) public tickets;
    
    // Maximum tickets per address per event
    uint256 public constant MAX_TICKETS_PER_EVENT = 4;
    
    // Price per ticket in LSK (can be modified by owner)
    uint256 public ticketPrice = 0.01 ether; // 0.01 LSK

    constructor() ERC721("Event Ticket NFT", "ETNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint ticket for a specific event
     * @param eventId The ID of the event
     * @param recipient Address that will receive the ticket
     * @param eventTitle Title of the event
     * @param metadataURI URI for the ticket metadata
     */
    function mintTicket(
        uint256 eventId,
        address recipient,
        string memory eventTitle,
        string memory metadataURI
    ) external payable {
        require(eventId > 0, "Invalid event ID");
        require(recipient != address(0), "Invalid recipient");
        require(msg.value >= ticketPrice, "Insufficient payment");
        require(
            ticketsPerEvent[eventId][recipient] < MAX_TICKETS_PER_EVENT,
            "Maximum tickets reached for this event"
        );

        uint256 tokenId = _nextTokenId++;
        
        // Update ticket count for this event
        ticketsPerEvent[eventId][recipient]++;
        
        // Store ticket information
        tickets[tokenId] = TicketInfo({
            eventId: eventId,
            isUsed: false,
            mintedAt: block.timestamp,
            eventTitle: eventTitle
        });

        // Mint the NFT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit TicketMinted(tokenId, eventId, recipient, metadataURI);
    }

    /**
     * @dev Mark ticket as used (for event organizers)
     * @param tokenId The token ID to mark as used
     */
    function useTicket(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!tickets[tokenId].isUsed, "Ticket already used");
        
        tickets[tokenId].isUsed = true;
        emit TicketUsed(tokenId, tickets[tokenId].eventId);
    }

    /**
     * @dev Get tickets owned by an address for a specific event
     * @param owner The owner address
     * @param eventId The event ID
     */
    function getTicketsByOwnerForEvent(address owner, uint256 eventId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 totalSupply = _nextTokenId - 1;
        uint256 ticketCount = 0;
        
        // First pass: count tickets
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) == owner && tickets[i].eventId == eventId) {
                ticketCount++;
            }
        }
        
        // Second pass: collect ticket IDs
        uint256[] memory userTickets = new uint256[](ticketCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) == owner && tickets[i].eventId == eventId) {
                userTickets[index] = i;
                index++;
            }
        }
        
        return userTickets;
    }

    /**
     * @dev Get all tickets for an event
     * @param eventId The event ID
     */
    function getTicketsForEvent(uint256 eventId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 totalSupply = _nextTokenId - 1;
        uint256 ticketCount = 0;
        
        // First pass: count tickets
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (tickets[i].eventId == eventId) {
                ticketCount++;
            }
        }
        
        // Second pass: collect ticket IDs
        uint256[] memory eventTickets = new uint256[](ticketCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (tickets[i].eventId == eventId) {
                eventTickets[index] = i;
                index++;
            }
        }
        
        return eventTickets;
    }

    /**
     * @dev Update ticket price (only owner)
     * @param newPrice New price in LSK
     */
    function setTicketPrice(uint256 newPrice) external onlyOwner {
        ticketPrice = newPrice;
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
