// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Idea is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct Attributes {
        string title;
        string description;
        uint256 upvotes;
        mapping(address => bool) addressVoted;
        uint256 status;
    }

    mapping(uint256 => Attributes) public tokenAttributes;

    constructor() ERC721("Idea", "Idea") {}

    function createIdea(string memory title, string memory description) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, title);

        tokenAttributes[tokenId].title = title;
        tokenAttributes[tokenId].description = description;
    }

    function upvote(uint256 tokenId) public {
        require(
            !tokenAttributes[tokenId].addressVoted[msg.sender],
            "already upvoted"
        );
        tokenAttributes[tokenId].addressVoted[msg.sender] = true;
        tokenAttributes[tokenId].upvotes++;
    }

    function setStatus(uint256 tokenId, uint256 status) public onlyOwner {
        tokenAttributes[tokenId].status = status;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
