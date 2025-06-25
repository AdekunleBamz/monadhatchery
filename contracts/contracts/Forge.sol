// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MonanimalNFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Forge is Ownable {
    MonanimalNFT public monanimalNFT;
    IERC20 public burnToken;
    uint256 public burnFee;

    event TraitsForged(address indexed user, uint256 indexed tokenId, string newTraits);

    constructor(address _monanimalNFT, address _burnToken, uint256 _burnFee) Ownable(msg.sender) {
        monanimalNFT = MonanimalNFT(_monanimalNFT);
        burnToken = IERC20(_burnToken);
        burnFee = _burnFee;
    }

    function forgeTraits(uint256 tokenId, string memory newTraits) external {
        require(monanimalNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(burnToken.transferFrom(msg.sender, address(this), burnFee), "Burn fee failed");
        monanimalNFT.evolve(tokenId, newTraits, monanimalNFT.lore(tokenId), monanimalNFT.tokenURI(tokenId));
        emit TraitsForged(msg.sender, tokenId, newTraits);
    }

    function setBurnFee(uint256 _burnFee) external onlyOwner {
        burnFee = _burnFee;
    }

    function withdrawFees(address to) external onlyOwner {
        uint256 balance = burnToken.balanceOf(address(this));
        require(burnToken.transfer(to, balance), "Withdraw failed");
    }
} 