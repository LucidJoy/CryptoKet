import { useState, useEffect, useRef, useContext } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import { NFTContext } from "../context/NFTContext";
import { Banner, CreatorCard, Loader, NFTCard, SearchBar } from "../components";
import { makeId } from "../utils/makeId";
import images from "../assets";
import { getCreators } from "../utils/getTopCreators";
import { shortenAddress } from "../utils/shortenAddress";

const Home = () => {
  const { theme } = useTheme();
  const parentRef = useRef(null);
  const scrollRef = useRef(null);
  const [hideButton, setHideButton] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const { fetchNFTs } = useContext(NFTContext);
  const [activeSelect, setActiveSelect] = useState("Recently Added");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNFTs().then((items) => {
      setNfts(items);
      setNftsCopy(items);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const sortedNfts = [...nfts];

    switch (activeSelect) {
      case "Recently Added":
        setNfts(sortedNfts.sort((a, b) => b.tokenId - a.tokenId));
        break;
      case "Price (Low to High)":
        setNfts(sortedNfts.sort((a, b) => a.price - b.price));
        break;
      case "Price (High to Low)":
        setNfts(sortedNfts.sort((a, b) => b.price - a.price));
        break;

      default:
        setNfts(nfts);
        break;
    }
  }, [activeSelect]);

  const onHandleSearch = (value) => {
    const filteredNfts = nfts.filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNfts.length) {
      setNfts(filteredNfts);
    } else {
      //re show all nfts
      setNfts(nftsCopy);
    }
  };

  //show all nfts if searchbar is empty
  const onClearSearch = () => {
    if (nfts.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };

  const handleScroll = (direction) => {
    const { current } = scrollRef;

    const scrollAmount = window.innerWidth > 1800 ? 270 : 210;

    if (direction === "left") {
      current.scrollLeft -= scrollAmount;
    } else {
      current.scrollLeft += scrollAmount;
    }
  };

  const isScrollable = () => {
    const { current } = scrollRef;
    const { current: parent } = parentRef;

    if (current?.scrollWidth >= parent?.offsetWidth) {
      setHideButton(false);
    } else {
      setHideButton(true);
    }
  };

  useEffect(() => {
    isScrollable();
    window.addEventListener("resize", isScrollable);

    return () => {
      window.removeEventListener("resize", isScrollable);
    };
  }, []);

  const topCreators = getCreators(nftsCopy);

  return (
    <div className='flex justify-center sm:px-4 p-12'>
      <div className='w-full minmd:w-4/5'>
        <Banner
          parentStyles='justify-start mb-6 h-72 sm:h-60 p-12 xs:p-4 xs:h-44 rounded-3xl'
          childStyles='md:text-4xl sm:text-2xl xs:text-xl text-left text-white'
          name={
            <>
              Discover, collect, and sell <br /> extraordinary NFTs
            </>
          }
        />

        {!isLoading && !nfts.length ? (
          <h1 className='font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0'>
            That&apos;s wierd... No NFTs for sale!
          </h1>
        ) : isLoading ? (
          <Loader />
        ) : (
          <>
            <div>
              <h1 className='font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0'>
                Top Sellers
              </h1>

              <div
                className='relative flex-1 max-w-full flex mt-3'
                ref={parentRef}
              >
                <div
                  className='flex flex-row w-max overflow-x-scroll no-scrollbar select-none'
                  ref={scrollRef}
                >
                  {topCreators.map((creator, i) => (
                    <CreatorCard
                      key={creator.seller}
                      rank={i + 1}
                      creatorImage={images[`creator${i + 1}`]}
                      creatorName={shortenAddress(creator.seller)}
                      creatorEths={creator.sum}
                    />
                  ))}
                  {/* {[6, 7, 8, 9, 10].map((i) => (
                <CreatorCard
                  key={`creator-${i}`}
                  rank={i}
                  creatorImage={images[`creator${i}`]}
                  creatorName={`0x${makeId(3)}...${makeId(4)}`}
                  creatorEths={10 - i * 0.5}
                />
              ))} */}
                  {!hideButton && (
                    <>
                      <div
                        className='absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer left-0'
                        onClick={() => handleScroll("left")}
                      >
                        <Image
                          src={images.left}
                          layout='fill'
                          objectFit='contain'
                          alt='left_arrow'
                          className={theme === "light" && "filter invert"}
                        />
                      </div>
                      <div
                        className='absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer right-0'
                        onClick={() => handleScroll("right")}
                      >
                        <Image
                          src={images.right}
                          layout='fill'
                          objectFit='contain'
                          alt='right_arrow'
                          className={theme === "light" && "filter invert"}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className='mt-10'>
              <div className='flexBetween mx-4 xs:mx-0 minlg:mx-8 sm:flex-col sm:items-start'>
                <h1 className='font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold sm:mb-4 flex-1'>
                  Hot NFTs
                </h1>
                <div className='flex flex-row flex-2 sm:w-full sm:flex-col'>
                  <SearchBar
                    activeSelect={activeSelect}
                    setActiveSelect={setActiveSelect}
                    handleSearch={onHandleSearch}
                    clearSearch={onClearSearch}
                  />
                </div>
              </div>
              <div className='mt-3 w-full flex flex-wrap justify-start md:justify-center'>
                {nfts.map((nft) => (
                  <NFTCard key={nft.tokenId} nft={nft} />
                ))}
                {/* {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <NFTCard
                key={`nft-${i}`}
                nft={{
                  i: i,
                  name: `Nifty NFT ${i}`,
                  price: 10 - i * 0.5,  
                  seller: `0x${makeId(3)}...${makeId(4)}`,
                  owner: `0x${makeId(3)}...${makeId(4)}`,
                  description: "Cool NFT on Sale",
                }}
              />
            ))} */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
