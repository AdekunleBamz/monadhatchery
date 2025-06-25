// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoreCard is ERC721URIStorage, Ownable {
    uint256 public nextCardId;
    mapping(uint256 => uint256) public unlockTime;
    mapping(uint256 => address) public minter;

    event LoreCardMinted(address indexed to, uint256 indexed cardId, uint256 unlockTime);

    constructor() ERC721("LoreCard", "LORE") Ownable(msg.sender) {}

    function mint(address to, string memory tokenURI, uint256 _unlockTime) external onlyOwner {
        uint256 cardId = nextCardId++;
        _safeMint(to, cardId);
        _setTokenURI(cardId, tokenURI);
        unlockTime[cardId] = _unlockTime;
        minter[cardId] = to;
        emit LoreCardMinted(to, cardId, _unlockTime);
    }

    function isUnlocked(uint256 cardId) public view returns (bool) {
        return block.timestamp >= unlockTime[cardId];
    }
} 