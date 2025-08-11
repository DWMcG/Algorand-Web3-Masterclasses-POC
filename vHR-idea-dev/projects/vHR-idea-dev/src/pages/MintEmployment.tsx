const assetParams = {
  name: "vHR Credential NFT",
  unitName: "vHR",
  total: 1,
  decimals: 0,
  url: `ipfs://${cidFromPinata}`, // <- Set your actual CID here after upload
  // other asset params...
};

// Then use AlgoSDK or AlgoKit APIs to create the asset with these params
const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
  from: yourWalletAddress,
  ...assetParams,
  suggestedParams: await algodClient.getTransactionParams().do(),
});
