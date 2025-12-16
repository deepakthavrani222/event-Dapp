// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TicketAuction
 * @dev Auction contract for NFT tickets with ETH bidding
 * Features: Anti-sniping, reserve price, automatic royalty distribution
 */
contract TicketAuction is ERC1155Holder, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    address payable public platformWallet;
    uint256 public platformFeePercent = 750; // 7.5% in basis points
    uint256 public constant MAX_FEE = 5000; // 50% max total fees
    
    uint256 public antiSnipeWindow = 10 minutes;
    uint256 public antiSnipeExtension = 10 minutes;
    uint256 public minDuration = 1 hours;
    uint256 public maxDuration = 7 days;
    uint256 public maxPriceCap = 150; // 150% of original price
    uint256 public maxBidsPerWallet = 4;
    
    struct Auction {
        address seller;
        address ticketContract;
        uint256 tokenId;
        uint256 amount;
        uint256 startingBid;
        uint256 reservePrice;
        uint256 currentBid;
        address currentBidder;
        uint256 bidIncrement;
        uint256 endTime;
        uint256 originalPrice;
        bool active;
        bool settled;
    }
    
    struct RoyaltyConfig {
        uint256 organizerRoyalty;
        uint256 artistRoyalty;
        address payable organizerWallet;
        address payable artistWallet;
    }
    
    struct CreateAuctionParams {
        address ticketContract;
        uint256 tokenId;
        uint256 amount;
        uint256 startingBid;
        uint256 reservePrice;
        uint256 bidIncrement;
        uint256 duration;
        uint256 originalPrice;
    }
    
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => RoyaltyConfig) public auctionRoyalties;
    uint256 public auctionCounter;
    
    mapping(address => mapping(uint256 => uint256)) public escrowedBids;
    mapping(address => uint256) public activeBidCount;
    
    event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 startingBid, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount, uint256 newEndTime);
    event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 finalPrice);
    event AuctionCancelled(uint256 indexed auctionId);
    event BidRefunded(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    
    constructor(address payable _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    function createAuction(
        CreateAuctionParams calldata params,
        RoyaltyConfig calldata royalties
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(params.ticketContract != address(0), "Invalid ticket contract");
        require(params.amount > 0, "Amount must be > 0");
        require(params.startingBid > 0, "Starting bid must be > 0");
        require(params.bidIncrement > 0, "Bid increment must be > 0");
        require(params.duration >= minDuration && params.duration <= maxDuration, "Invalid duration");
        require(royalties.organizerRoyalty + royalties.artistRoyalty + platformFeePercent <= MAX_FEE, "Total fees too high");
        
        IERC1155(params.ticketContract).safeTransferFrom(
            msg.sender, address(this), params.tokenId, params.amount, ""
        );
        
        uint256 auctionId = auctionCounter++;
        uint256 endTime = block.timestamp + params.duration;
        
        auctions[auctionId] = Auction({
            seller: msg.sender,
            ticketContract: params.ticketContract,
            tokenId: params.tokenId,
            amount: params.amount,
            startingBid: params.startingBid,
            reservePrice: params.reservePrice,
            currentBid: 0,
            currentBidder: address(0),
            bidIncrement: params.bidIncrement,
            endTime: endTime,
            originalPrice: params.originalPrice,
            active: true,
            settled: false
        });
        
        auctionRoyalties[auctionId] = royalties;
        
        emit AuctionCreated(auctionId, msg.sender, params.startingBid, endTime);
        return auctionId;
    }
    
    function placeBid(uint256 _auctionId) external payable whenNotPaused nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(activeBidCount[msg.sender] < maxBidsPerWallet, "Max bids reached");
        
        uint256 minBid = auction.currentBid == 0 
            ? auction.startingBid 
            : auction.currentBid + auction.bidIncrement;
        
        require(msg.value >= minBid, "Bid too low");
        
        if (auction.originalPrice > 0 && maxPriceCap > 0) {
            uint256 maxAllowedBid = (auction.originalPrice * maxPriceCap) / 100;
            require(msg.value <= maxAllowedBid, "Bid exceeds price cap");
        }
        
        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            uint256 refundAmount = escrowedBids[auction.currentBidder][_auctionId];
            escrowedBids[auction.currentBidder][_auctionId] = 0;
            activeBidCount[auction.currentBidder]--;
            
            (bool refundSuccess, ) = payable(auction.currentBidder).call{value: refundAmount}("");
            require(refundSuccess, "Refund failed");
            emit BidRefunded(_auctionId, auction.currentBidder, refundAmount);
        }
        
        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;
        escrowedBids[msg.sender][_auctionId] = msg.value;
        activeBidCount[msg.sender]++;
        
        // Anti-sniping
        uint256 newEndTime = auction.endTime;
        if (block.timestamp + antiSnipeWindow >= auction.endTime) {
            newEndTime = block.timestamp + antiSnipeExtension;
            auction.endTime = newEndTime;
        }
        
        emit BidPlaced(_auctionId, msg.sender, msg.value, newEndTime);
    }
    
    function settleAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.settled, "Already settled");
        
        auction.active = false;
        auction.settled = true;
        
        bool reserveMet = auction.reservePrice == 0 || auction.currentBid >= auction.reservePrice;
        
        if (auction.currentBidder != address(0) && reserveMet) {
            _distributeProceeds(_auctionId);
            
            IERC1155(auction.ticketContract).safeTransferFrom(
                address(this), auction.currentBidder, auction.tokenId, auction.amount, ""
            );
            
            escrowedBids[auction.currentBidder][_auctionId] = 0;
            activeBidCount[auction.currentBidder]--;
            
            emit AuctionSettled(_auctionId, auction.currentBidder, auction.currentBid);
        } else {
            IERC1155(auction.ticketContract).safeTransferFrom(
                address(this), auction.seller, auction.tokenId, auction.amount, ""
            );
            
            if (auction.currentBidder != address(0)) {
                uint256 refundAmount = escrowedBids[auction.currentBidder][_auctionId];
                escrowedBids[auction.currentBidder][_auctionId] = 0;
                activeBidCount[auction.currentBidder]--;
                
                (bool success, ) = payable(auction.currentBidder).call{value: refundAmount}("");
                require(success, "Refund failed");
                emit BidRefunded(_auctionId, auction.currentBidder, refundAmount);
            }
            
            emit AuctionCancelled(_auctionId);
        }
    }
    
    function _distributeProceeds(uint256 _auctionId) internal {
        Auction storage auction = auctions[_auctionId];
        RoyaltyConfig storage royalties = auctionRoyalties[_auctionId];
        uint256 totalAmount = auction.currentBid;
        
        uint256 platformFee = (totalAmount * platformFeePercent) / 10000;
        uint256 organizerRoyalty = (totalAmount * royalties.organizerRoyalty) / 10000;
        uint256 artistRoyalty = (totalAmount * royalties.artistRoyalty) / 10000;
        uint256 sellerProceeds = totalAmount - platformFee - organizerRoyalty - artistRoyalty;
        
        if (platformFee > 0) {
            (bool success, ) = platformWallet.call{value: platformFee}("");
            require(success, "Platform fee transfer failed");
        }
        
        if (organizerRoyalty > 0 && royalties.organizerWallet != address(0)) {
            (bool success, ) = royalties.organizerWallet.call{value: organizerRoyalty}("");
            require(success, "Organizer royalty transfer failed");
        }
        
        if (artistRoyalty > 0 && royalties.artistWallet != address(0)) {
            (bool success, ) = royalties.artistWallet.call{value: artistRoyalty}("");
            require(success, "Artist royalty transfer failed");
        }
        
        if (sellerProceeds > 0) {
            (bool success, ) = payable(auction.seller).call{value: sellerProceeds}("");
            require(success, "Seller proceeds transfer failed");
        }
    }
    
    function cancelAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.active, "Auction not active");
        require(msg.sender == auction.seller || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        require(auction.currentBidder == address(0), "Cannot cancel with bids");
        
        auction.active = false;
        auction.settled = true;
        
        IERC1155(auction.ticketContract).safeTransferFrom(
            address(this), auction.seller, auction.tokenId, auction.amount, ""
        );
        
        emit AuctionCancelled(_auctionId);
    }
    
    function emergencyCancel(uint256 _auctionId) external onlyRole(ADMIN_ROLE) nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(auction.active, "Auction not active");
        
        auction.active = false;
        auction.settled = true;
        
        IERC1155(auction.ticketContract).safeTransferFrom(
            address(this), auction.seller, auction.tokenId, auction.amount, ""
        );
        
        if (auction.currentBidder != address(0)) {
            uint256 refundAmount = escrowedBids[auction.currentBidder][_auctionId];
            escrowedBids[auction.currentBidder][_auctionId] = 0;
            activeBidCount[auction.currentBidder]--;
            
            (bool success, ) = payable(auction.currentBidder).call{value: refundAmount}("");
            require(success, "Refund failed");
            emit BidRefunded(_auctionId, auction.currentBidder, refundAmount);
        }
        
        emit AuctionCancelled(_auctionId);
    }
    
    // Admin setters
    function setPlatformWallet(address payable _wallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_wallet != address(0), "Invalid wallet");
        platformWallet = _wallet;
    }
    
    function setPlatformFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_fee <= 2000, "Fee too high");
        platformFeePercent = _fee;
    }
    
    function setAntiSnipeSettings(uint256 _window, uint256 _extension) external onlyRole(ADMIN_ROLE) {
        antiSnipeWindow = _window;
        antiSnipeExtension = _extension;
    }
    
    function setMaxPriceCap(uint256 _cap) external onlyRole(ADMIN_ROLE) {
        maxPriceCap = _cap;
    }
    
    function setMaxBidsPerWallet(uint256 _max) external onlyRole(ADMIN_ROLE) {
        maxBidsPerWallet = _max;
    }
    
    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
    
    // View functions
    function getAuction(uint256 _auctionId) external view returns (Auction memory) {
        return auctions[_auctionId];
    }
    
    function getMinNextBid(uint256 _auctionId) external view returns (uint256) {
        Auction storage auction = auctions[_auctionId];
        if (auction.currentBid == 0) return auction.startingBid;
        return auction.currentBid + auction.bidIncrement;
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public view override(ERC1155Holder, AccessControl) returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
