export const getCreators = (nfts) => {
  const creators = nfts.reduce((acc, nft) => {
    (acc[nft.seller] = acc[nft.seller] || []).push(nft);

    return acc;
  }, {});

  return Object.entries(creators).map((creator) => {
    const seller = creator[0];
    const sum = creator[1]
      .map((item) => Number(item.price))
      .reduce((acc, val) => acc + val, 0);

    return { seller, sum };
  });
};
