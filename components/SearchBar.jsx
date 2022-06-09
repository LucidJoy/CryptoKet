import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import images from "../assets";

const SearchBar = ({
  activeSelect,
  setActiveSelect,
  handleSearch,
  clearSearch,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [toggle, setToggle] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(debouncedSearch);
    }, 1000);

    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  useEffect(() => {
    if (search) {
      handleSearch(search);
    } else {
      //clear search
      clearSearch();
    }
  }, [search]);

  return (
    <>
      <div className='flex-1 flexCenter dark:bg-nft-black-2 bg-white border dark:border-nft-black-2 border-nft-gray-2 py-3 px-4 rounded-md'>
        <Image
          src={images.search}
          objectFit='contain'
          width={20}
          height={20}
          alt='search'
          className={theme === "light" ? "filter invert" : ""}
        />
        <input
          type='text'
          placeholder='Search NFT here...'
          className='dark:bg-nft-black-2 bg-white outline-none mx-4 w-full text-nft-black-1 dark:text-white font-normal text-xs font-poppins'
          onChange={(e) => setDebouncedSearch(e.target.value)}
          value={debouncedSearch}
        />
      </div>

      <div
        onClick={() => setToggle((prevToggle) => !prevToggle)}
        className='relative flexBetween ml-4 sm:ml-0 sm:mt-2 min-w-190 cursor-pointer flexCenter dark:bg-nft-black-2 bg-white border dark:border-nft-black-2 border-nft-gray-2 px-4 py-3 rounded-md'
      >
        <p className='font-poppins text-nft-black-1 dark:text-white font-normal text-xs'>
          {activeSelect}
        </p>
        <Image
          src={images.arrow}
          objectFit='contain'
          width={15}
          height={15}
          className={theme === "light" ? "filter invert" : ""}
        />
        {toggle && (
          <div className='absolute top-full left-0 right-0 w-full mt-3 z-10 dark:bg-nft-black-2 bg-white border dark:border-nft-black-2 border-nft-gray-2 py-3 px-4 rounded-md'>
            {[
              "Recently Added",
              "Price (Low to High)",
              "Price (High to Low)",
            ].map((item) => (
              <p
                className='font-poppins text-nft-black-1 dark:text-white font-normal text-xs rounded-md cursor-pointer dark:hover:bg-nft-black-1 hover:bg-nft-gray-1 p-4'
                onClick={() => setActiveSelect(item)}
                key={item}
              >
                {item}
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;
