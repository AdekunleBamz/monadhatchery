// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MonanimalNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Fusion is Ownable {
    MonanimalNFT public monanimalNFT;

    event MonanimalsFused(address indexed user, uint256 tokenId1, uint256 tokenId2, uint256 newTokenId, string newTraits, string newLore);

    constructor(address _monanimalNFT) Ownable(msg.sender) {
        monanimalNFT = MonanimalNFT(_monanimalNFT);
    }

    function fuse(uint256 tokenId1, uint256 tokenId2, string memory newTraits, string memory newLore, string memory newTokenURI) external {
        require(monanimalNFT.ownerOf(tokenId1) == msg.sender, "Not owner of tokenId1");
        require(monanimalNFT.ownerOf(tokenId2) == msg.sender, "Not owner of tokenId2");
        require(tokenId1 != tokenId2, "Cannot fuse the same token");
        // Burn both tokens
        monanimalNFT.transferFrom(msg.sender, address(0xdead), tokenId1);
        monanimalNFT.transferFrom(msg.sender, address(0xdead), tokenId2);
        // Mint new rare Monanimal
        monanimalNFT.mint(newTraits, newLore, newTokenURI);
        uint256 newTokenId = monanimalNFT.nextTokenId() - 1;
        emit MonanimalsFused(msg.sender, tokenId1, tokenId2, newTokenId, newTraits, newLore);
    }
} 