// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonanimalNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => string) public lore;
    mapping(uint256 => string) public traits;
    mapping(uint256 => string) public names;

    event MonanimalMinted(address indexed to, uint256 indexed tokenId);
    event MonanimalEvolved(uint256 indexed tokenId, string newTraits, string newLore);
    event LoreSubmitted(uint256 indexed tokenId, string newLore);
    event NameSet(uint256 indexed tokenId, string newName);
    event MonanimalFused(address indexed owner, uint256 indexed parentA, uint256 indexed parentB, uint256 newTokenId, string newTraits, string newLore);

    constructor() ERC721("MonanimalNFT", "MONA") Ownable(msg.sender) {}

    function mint(string memory initialTraits, string memory initialLore, string memory tokenURI) external {
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        traits[tokenId] = initialTraits;
        lore[tokenId] = initialLore;
        names[tokenId] = string(abi.encodePacked("Monanimal #", _toString(tokenId)));
        _setTokenURI(tokenId, tokenURI);
        emit MonanimalMinted(msg.sender, tokenId);
    }

    function evolve(uint256 tokenId, string memory newTraits, string memory newLore, string memory newTokenURI) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        traits[tokenId] = newTraits;
        lore[tokenId] = newLore;
        _setTokenURI(tokenId, newTokenURI);
        emit MonanimalEvolved(tokenId, newTraits, newLore);
    }

    function submitLore(uint256 tokenId, string memory newLore) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        lore[tokenId] = newLore;
        emit LoreSubmitted(tokenId, newLore);
    }

    function setName(uint256 tokenId, string memory newName) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(bytes(newName).length > 0, "Name cannot be empty");
        require(bytes(newName).length <= 50, "Name too long");
        names[tokenId] = string(abi.encodePacked("Monanimal #", _toString(tokenId), " - \"", newName, "\""));
        emit NameSet(tokenId, newName);
    }

    function fuse(uint256 parentA, uint256 parentB, string memory fusedTraits, string memory fusedLore, string memory fusedTokenURI) external {
        require(ownerOf(parentA) == msg.sender, "Not owner of parentA");
        require(ownerOf(parentB) == msg.sender, "Not owner of parentB");
        require(parentA != parentB, "Cannot fuse the same token");
        
        // Burn parent tokens
        _burn(parentA);
        _burn(parentB);
        
        // Mint new fused token
        uint256 newTokenId = nextTokenId++;
        _safeMint(msg.sender, newTokenId);
        traits[newTokenId] = fusedTraits;
        lore[newTokenId] = fusedLore;
        names[newTokenId] = string(abi.encodePacked("Monanimal #", _toString(newTokenId), " - \"Fused Creation\""));
        _setTokenURI(newTokenId, fusedTokenURI);
        
        emit MonanimalFused(msg.sender, parentA, parentB, newTokenId, fusedTraits, fusedLore);
    }

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _burn(tokenId);
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Additional logic for trait forging, fusion, and access control can be added here.
} 