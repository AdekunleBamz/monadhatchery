// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonanimalNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => string) public lore;
    mapping(uint256 => string) public traits;

    event MonanimalMinted(address indexed to, uint256 indexed tokenId);
    event MonanimalEvolved(uint256 indexed tokenId, string newTraits, string newLore);

    constructor() ERC721("MonanimalNFT", "MONA") Ownable(msg.sender) {}

    function mint(address to, string memory initialTraits, string memory initialLore, string memory tokenURI) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        traits[tokenId] = initialTraits;
        lore[tokenId] = initialLore;
        _setTokenURI(tokenId, tokenURI);
        emit MonanimalMinted(to, tokenId);
    }

    function evolve(uint256 tokenId, string memory newTraits, string memory newLore, string memory newTokenURI) external onlyOwner {
        traits[tokenId] = newTraits;
        lore[tokenId] = newLore;
        _setTokenURI(tokenId, newTokenURI);
        emit MonanimalEvolved(tokenId, newTraits, newLore);
    }

    // Additional logic for trait forging, fusion, and access control can be added here.
} 