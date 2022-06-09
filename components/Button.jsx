import React from "react";

const Button = ({ classStyles, btnName, handleClick }) => {
  return (
    <>
      {btnName === "Cancel" || btnName === "Close" ? (
        <button
          type='button'
          className={`border border-[#DF179B] text-sm minlg:text-lg py-2 px-6 minlg:px-8 font-poppins font-semibold dark:text-white text-nft-black-1 ${classStyles}`}
          onClick={handleClick}
        >
          {btnName}
        </button>
      ) : (
        <button
          type='button'
          className={`nft-gradient text-sm minlg:text-lg py-2 px-6 minlg:px-8 font-poppins font-semibold text-white ${classStyles}`}
          onClick={handleClick}
        >
          {btnName}
        </button>
      )}
    </>
  );
};

export default Button;
