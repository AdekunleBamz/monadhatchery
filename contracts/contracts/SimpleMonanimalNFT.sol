// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract SimpleMonanimalNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public nextTokenId;

    event MonanimalMinted(address indexed owner, uint256 indexed tokenId, string traits);

    constructor() ERC721("SimpleMonanimal", "SMONA") Ownable(msg.sender) {}

    function mint(string memory traits) external {
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        emit MonanimalMinted(msg.sender, tokenId, traits);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Check if token exists using try/catch with ownerOf
        try this.ownerOf(tokenId) returns (address) {
            // Token exists, continue
        } catch {
            revert("Nonexistent token");
        }
        
        // Simple SVG generation
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">',
            '<rect width="100%" height="100%" fill="#4F46E5"/>',
            '<circle cx="150" cy="150" r="80" fill="#F59E0B"/>',
            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="white">Monanimal #', tokenId.toString(), '</text>',
            '</svg>'
        ));
        
        string memory image = Base64.encode(bytes(svg));
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{',
                '"name":"Monanimal #', tokenId.toString(), '",',
                '"description":"A simple Monanimal NFT",',
                '"image":"data:image/svg+xml;base64,', image, '"',
            '}'
        ))));
        
        return string(abi.encodePacked('data:application/json;base64,', json));
    }
} 