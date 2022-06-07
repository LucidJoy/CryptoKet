// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    //type   variable
    uint256 listingPrice = 0.025 ether;
    //everytime any user posts/lists NFT, the owner of the marketplace is going to get 0.025 ether deposited to his wallet.

    //NOTE : Owner
    //type          variable
    address payable owner;

    //NOTE: Keep up with all created NFT's
    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    //NOTE: Event getting triggered upon action
    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor() ERC721("Metaverse Tokens", "METT") {
        //owner of the contract is the one who is deploying it
        //msg is the actual transaction happening when we r deplaying the contract
        //they r goin to get the listingPrice whenever someone sells and NFT
        owner = payable(msg.sender);
    }

    //NOTE: "payable" gives access to the func to receive ETH
    //        func name         type   parameter
    function updateListingPrice(uint256 _listingPrice) public payable {
        //only owner can update listing price -> 0.025 ETH
        require(
            owner == msg.sender,
            "Only marketplace owner can update listing price."
        );

        listingPrice = _listingPrice;
    }

    //view => function is not doing anything and simply returning a logic
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    //URI = Unique Resource Identifier
    //public => we will be able to call this function from our frontend
    //payable => bc its going to handle some transactions
    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {
        //increment token ID by one
        _tokenIds.increment();

        //get current value of token ids
        uint256 newTokenId = _tokenIds.current();

        //_mint => utility func that allows us to mint/create NFT
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        createMarketItem(newTokenId, price);

        return newTokenId;
    }

    //private => bc we dont need to call it on our frontend
    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be atleast 1.");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price."
        );

        //creating mapping for our market items
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)), //address(this) => address of the person who is trying to create the market item
            price,
            false //current marketItem is not yet sold
        );

        //NOTE : Tranfer the ownership of NFT to contract owner
        //        from           to          tokenid
        _transfer(msg.sender, address(this), tokenId);

        //emitting the event & letting everybody using this contract know that this even has been emitted meaning a new marketitem has been created
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    //putting the item on the marketplace for reselling
    function resellToken(uint256 tokenId, uint256 price) public payable {
        //user trying to resell a token, must be the token owner
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only item owner can perform this operation."
        );
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price."
        );

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender); //user who wants to resell
        idToMarketItem[tokenId].owner = payable(address(this)); //its going to belong to our NFT marketplace, not to any individual user address

        //bc we havent sold this one & wanna relist it
        _itemsSold.decrement();

        //sending it from our current wallet -> to our marketplace bc we r relisting it
        _transfer(msg.sender, address(this), tokenId);
    }

    //send item from the marketplace to the person that bought it
    function createMarketSale(uint256 tokenId) public payable {
        uint256 price = idToMarketItem[tokenId].price;

        //u cant send a transaction that contains less ETH/MATIC than the seller is looking to get
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase."
        );

        //person who is buying the NFT will become the owner
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0)); //this means that the seller was the NFT marketplace, address(0) means it doesn't belong to any specific wallet

        _itemsSold.increment();

        //seller(NFT Marketplace), new onwer, tokenid of NFT we r trying to send
        _transfer(address(this), msg.sender, tokenId);

        //transfer the listing price (0.025 eth) to owner, to the person who created this NFT Marketplace
        payable(owner).transfer(listingPrice);

        //transfer amount from buyer to seller, msg.value = price of NFT
        payable(idToMarketItem[tokenId].seller).transfer(msg.value);
    }

    //fetch all UNSOLD items belonging to the marketplace
    //memory => some data
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;

                currentIndex += 1;
            }
        }

        return items; //returning items only belonging to marketplace
    }

    //fetch all NFTS that the user has purchased
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            //check if this NFT belongs to this person
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1; //tells how many NFTs this specific person owns
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;

                currentIndex += 1;
            }
        }

        return items; //returning items only belonging to the user
    }

    //list of NFTs that a specific user has listed/put up for sale on this masketplace
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            //check if this NFT belongs to this seller
            //the person is selling it
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;

                currentIndex += 1;
            }
        }

        return items; //returning list of NFTs that a specific user is selling
    }
}
