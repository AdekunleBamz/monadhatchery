// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Leaderboard is Ownable {
    mapping(address => uint256) public points;
    event PointsAwarded(address indexed user, uint256 amount, string reason);

    constructor() Ownable(msg.sender) {}

    function awardPoints(address user, uint256 amount, string memory reason) external onlyOwner {
        points[user] += amount;
        emit PointsAwarded(user, amount, reason);
    }

    function getPoints(address user) external view returns (uint256) {
        return points[user];
    }
} 