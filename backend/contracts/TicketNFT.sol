// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title TicketNFT
 * @dev ERC-1155 NFT contract for event tickets with ETH payment support
 * Each token ID represents a different ticket type for an event
 * Users pay ETH directly via MetaMask to mint tickets
 */
contract TicketNFT is ERC1155, ERC1155Supply, AccessControl, Pausable, ReentrancyGuard, IERC2981 {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant PRICE_MANAGER_ROLE = keccak256("PRICE_MANAGER_ROLE");
    
    string public name = "TicketChain NFT";
    string public symbol = "TICKET";
    
    // Platform wallet to receive payments
    address payable public platformWallet;
    
    // Token ID => Token URI
    mapping(uint256 => string) private _tokenURIs;
    
    // Token ID => Max Supply
    mapping(uint256 => uint256) private _maxSupply;
    
    // Token ID => Price in Wei
    mapping(uint256 => uint256) private _tokenPrices;
    
    // Token ID => Organizer address (receives portion of payment)
    mapping(uint256 => address payable) private _tokenOrganizers;
    
    // Platform fee percentage (basis points, e.g., 500 = 5%)
    uint256 public platformFeePercent = 500;
    
    // Token ID => Royalty Info
    struct RoyaltyInfo {
        address receiver;
        uint96 royaltyFraction; // Basis points (e.g., 1000 = 10%)
    }
    mapping(uint256 => RoyaltyInfo) private _royalties;
    
    // Events for ETH payments
    event TicketPurchased(address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 totalPaid);
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event TokenPriceSet(uint256 indexed tokenId, uint256 price);
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    // Events
    event TokenCreated(uint256 indexed tokenId, uint256 maxSupply, string uri);
    event RoyaltySet(uint256 indexed tokenId, address receiver, uint96 royaltyFraction);
    event TicketMinted(address indexed to, uint256 indexed tokenId, uint256 amount);
    event TicketBurned(address indexed from, uint256 indexed tokenId, uint256 amount);
    
    constructor(string memory uri_, address payable _platformWallet) ERC1155(uri_) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(PRICE_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new token type with max supply
     * @param tokenId The token ID to create
     * @param maxSupply Maximum number of tokens that can be minted
     * @param tokenURI Metadata URI for this token
     */
    function createToken(
        uint256 tokenId,
        uint256 maxSupply,
        string memory tokenURI
    ) external onlyRole(MINTER_ROLE) {
        require(_maxSupply[tokenId] == 0, "Token already exists");
        require(maxSupply > 0, "Max supply must be greater than 0");
        
        _maxSupply[tokenId] = maxSupply;
        _tokenURIs[tokenId] = tokenURI;
        
        emit TokenCreated(tokenId, maxSupply, tokenURI);
    }
    
    /**
     * @dev Set royalty information for a token
     * @param tokenId The token ID
     * @param receiver Address to receive royalties
     * @param royaltyFraction Royalty percentage in basis points (e.g., 1000 = 10%)
     */
    function setRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 royaltyFraction
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(receiver != address(0), "Invalid receiver address");
        require(royaltyFraction <= 10000, "Royalty too high"); // Max 100%
        
        _royalties[tokenId] = RoyaltyInfo(receiver, royaltyFraction);
        
        emit RoyaltySet(tokenId, receiver, royaltyFraction);
    }
    
    /**
     * @dev Mint tickets to an address
     * @param to Address to mint to
     * @param tokenId Token ID to mint
     * @param amount Number of tokens to mint
     */
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(_maxSupply[tokenId] > 0, "Token does not exist");
        require(
            totalSupply(tokenId) + amount <= _maxSupply[tokenId],
            "Exceeds max supply"
        );
        
        _mint(to, tokenId, amount, "");
        
        emit TicketMinted(to, tokenId, amount);
    }
    
    /**
     * @dev Mint multiple token types to an address
     * @param to Address to mint to
     * @param tokenIds Array of token IDs
     * @param amounts Array of amounts for each token ID
     */
    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(tokenIds.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_maxSupply[tokenIds[i]] > 0, "Token does not exist");
            require(
                totalSupply(tokenIds[i]) + amounts[i] <= _maxSupply[tokenIds[i]],
                "Exceeds max supply"
            );
        }
        
        _mintBatch(to, tokenIds, amounts, "");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            emit TicketMinted(to, tokenIds[i], amounts[i]);
        }
    }
    
    /**
     * @dev Burn tickets (for refunds or cancellations)
     * @param from Address to burn from
     * @param tokenId Token ID to burn
     * @param amount Number of tokens to burn
     */
    function burn(
        address from,
        uint256 tokenId,
        uint256 amount
    ) external {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Caller is not owner nor approved"
        );
        
        _burn(from, tokenId, amount);
        
        emit TicketBurned(from, tokenId, amount);
    }
    
    /**
     * @dev Get token URI for a specific token ID
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        return bytes(tokenURI).length > 0 ? tokenURI : super.uri(tokenId);
    }
    
    /**
     * @dev Get max supply for a token ID
     */
    function maxSupply(uint256 tokenId) external view returns (uint256) {
        return _maxSupply[tokenId];
    }
    
    /**
     * @dev Get available supply for a token ID
     */
    function availableSupply(uint256 tokenId) external view returns (uint256) {
        uint256 max = _maxSupply[tokenId];
        uint256 current = totalSupply(tokenId);
        return max > current ? max - current : 0;
    }
    
    /**
     * @dev ERC-2981 royalty info
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        RoyaltyInfo memory royalty = _royalties[tokenId];
        
        if (royalty.receiver == address(0)) {
            return (address(0), 0);
        }
        
        uint256 amount = (salePrice * royalty.royaltyFraction) / 10000;
        return (royalty.receiver, amount);
    }
    
    /**
     * @dev Pause all token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Hook that is called before any token transfer
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._update(from, to, ids, values);
    }
    
    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl, IERC165) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
