// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract MonanimalNFT is ERC721, Ownable {
    using Strings for uint256;

    struct Monanimal {
        uint256 evolutionStage;
        string traits;
        uint256 birthTime;
    }

    mapping(uint256 => Monanimal) public monanimals;
    uint256 public nextTokenId;

    event MonanimalMinted(address indexed owner, uint256 indexed tokenId, string traits);
    event MonanimalEvolved(uint256 indexed tokenId, uint256 newStage);

    constructor() ERC721("Monanimal", "MONA") Ownable(msg.sender) {}

    function mint(string memory traits) external {
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        monanimals[tokenId] = Monanimal({
            evolutionStage: 1,
            traits: traits,
            birthTime: block.timestamp
        });
        emit MonanimalMinted(msg.sender, tokenId, traits);
    }

    function evolve(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not authorized");
        monanimals[tokenId].evolutionStage += 1;
        emit MonanimalEvolved(tokenId, monanimals[tokenId].evolutionStage);
    }

    function getMonanimal(uint256 tokenId) external view returns (Monanimal memory) {
        return monanimals[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        Monanimal memory m = monanimals[tokenId];
        string memory image = generateSVG(tokenId, m.evolutionStage, m.traits);
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{',
                '"name":"Monanimal #', tokenId.toString(), '",',
                '"description":"A dynamic Monanimal NFT that evolves on-chain.",',
                '"attributes":[',
                    '{"trait_type":"Evolution Stage","value":"', m.evolutionStage.toString(), '"},',
                    '{"trait_type":"Traits","value":"', m.traits, '"}',
                '],',
                '"image":"data:image/svg+xml;base64,', image, '"',
            '}'
        ))));
        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    function generateSVG(uint256 tokenId, uint256 stage, string memory traits) internal pure returns (string memory) {
        string memory color = getTraitValue(traits, "color");
        string memory svg;
        if (stage == 1) {
            svg = string(abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="', color, '"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="white">Baby</text></svg>'
            ));
        } else if (stage == 2) {
            svg = string(abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="', color, '"/><circle cx="150" cy="150" r="80" fill="yellow"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="black">Evolved</text></svg>'
            ));
        } else {
            svg = string(abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="', color, '"/><ellipse cx="150" cy="150" rx="100" ry="60" fill="orange"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="black">Rare</text></svg>'
            ));
        }
        return Base64.encode(bytes(svg));
    }

    function getTraitValue(string memory traits, string memory key) internal pure returns (string memory) {
        // Example: traits = "color:Red,type:Fire,ability:Swift"
        bytes memory t = bytes(traits);
        bytes memory k = bytes(key);
        uint256 i = 0;
        while (i + k.length + 1 < t.length) {
            bool matchKey = true;
            for (uint256 j = 0; j < k.length; j++) {
                if (t[i + j] != k[j]) {
                    matchKey = false;
                    break;
                }
            }
            if (matchKey && t[i + k.length] == ":") {
                uint256 start = i + k.length + 1;
                uint256 end = start;
                while (end < t.length && t[end] != ',') end++;
                bytes memory value = new bytes(end - start);
                for (uint256 m = 0; m < value.length; m++) {
                    value[m] = t[start + m];
                }
                return string(value);
            }
            while (i < t.length && t[i] != ',') i++;
            i++;
        }
        return "gray";
    }
} 