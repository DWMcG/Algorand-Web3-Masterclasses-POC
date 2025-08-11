import algosdk from "algosdk";
import { getAlgodConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";
import { getAppClient } from "@algorandfoundation/algokit-utils";  // AlgoKit helper

export async function mintEmploymentNFT(ipfsCID: string, senderAddress: string) {
  const algodConfig = getAlgodConfigFromViteEnvironment();

  const algodClient = new algosdk.Algodv2(algodConfig.token, algodConfig.server, algodConfig.port);

  const params = await algodClient.getTransactionParams().do();

  const assetParams = {
    total: 1,
    decimals: 0,
    defaultFrozen: false,
    unitName: "vHR_EMP",
    assetName: "vHR Employment Credential",
    manager: senderAddress,
    reserve: senderAddress,
    freeze: senderAddress,
    clawback: senderAddress,
    url: `ipfs://${ipfsCID}`,
    note: new TextEncoder().encode("vHR Employment NFT"),
  };

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    suggestedParams: params,
    ...assetParams,
  });

  const appClient = getAppClient(); // get AlgoKit client with wallet signer

  // sign the transaction using AlgoKit wallet signer
  const signedTxn = await appClient.signTxns([txn]);

  const txResponse = await algodClient.sendRawTransaction(signedTxn[0].blob).do();

  const confirmedTxn = await waitForConfirmation(algodClient, txResponse.txId, 4);

  return confirmedTxn["asset-index"];
}

async function waitForConfirmation(client: algosdk.Algodv2, txId: string, timeout: number) {
  const status = await client.status().do();
  let lastRound = status["last-round"];
  const startRound = lastRound;

  while (lastRound < startRound + timeout) {
    const pendingInfo = await client.pendingTransactionInformation(txId).do();
    if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
      return pendingInfo;
    }
    lastRound++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Transaction not confirmed after " + timeout + " rounds");
}
