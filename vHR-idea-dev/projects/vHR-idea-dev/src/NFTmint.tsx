import React, { useState } from "react";
import algosdk from "algosdk";
import { useWallet } from "@txnlab/use-wallet-react";

/**
 * NFTMint component (preliminary)
 *
 * TODOs:
 *  - implement uploadToIPFS(fileOrJson): Promise<string> that returns an ipfs:// or https://gateway/ipfs/<CID>
 *  - provide ALGOD_SERVER, ALGOD_TOKEN, ALGOD_PORT (or use Algokit-provided client)
 *  - ensure wallet used supports transaction signing (MyAlgo, Pera, WalletConnect)
 *
 * Note: This creates a *single-unit* ASA (decimals = 0, total = 1) suitable for an NFT credential.
 */

type MintResult = {
  assetId: number | null;
  txId?: string;
  error?: string;
};

export default function NFTMint() {
  const { connect, disconnect, activeAccount, connected, signTransactions, signTransaction } =
    useWallet();
  // If your use-wallet-react hook exposes different names, adapt them accordingly.

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<MintResult | null>(null);

  // Algod client - replace with your AlgoKit config if available
  const ALGOD_SERVER = process.env.REACT_APP_ALGOD_SERVER || "https://testnet-algorand.api.purestake.io/ps2";
  const ALGOD_TOKEN = { "X-API-Key": process.env.REACT_APP_PURESTAKE_API_KEY || "" };
  const ALGOD_PORT = "";

  const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

  async function uploadToIPFS_blob(file: File | null, metadata: object): Promise<string> {
    // Placeholder - implement using web3.storage, nft.storage, or pinata
    // Should return a metadata URL, e.g. "ipfs://<CID>/metadata.json" or an https gateway URL.
    // Example: upload image => get imageCID, add image field to metadata => upload metadata => return metadataURL
    throw new Error("uploadToIPFS not implemented. Replace this with your IPFS uploader.");
  }

  async function createNFT(metadataUrl: string) {
    setStatus("Preparing transactions...");

    try {
      // 1. Get suggested params
      const suggestedParams = await algodClient.getTransactionParams().do();

      // 2. Build asset creation transaction (single unit NFT)
      const sender = activeAccount?.address;
      if (!sender) throw new Error("No connected account found.");

      const note = undefined;
      const addr = sender;
      const total = 1;
      const decimals = 0;
      const defaultFrozen = false;
      const unitName = title ? title.slice(0, 8) : "vHRnft";
      const assetName = title || "vHR Credential";
      const manager = sender; // can be set to issuer or revoked later
      const reserve = undefined;
      const freeze = undefined;
      const clawback = undefined;
      const url = metadataUrl; // IPFS metadata URL
      const metadataHash = undefined; // optional 32-byte hash if you compute it

      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: addr,
        total,
        decimals,
        assetName,
        unitName,
        assetURL: url,
        defaultFrozen,
        manager,
        reserve,
        freeze,
        clawback,
        note,
        suggestedParams,
      });

      setStatus("Requesting wallet signature...");

      // 3. Sign and submit
      // use-wallet-react may provide signTransaction or signTransactions (batched). Adapt to your hook.
      // We'll use the generic method to sign a single txn.
      const txBuffer = txn.toByte();

      // If use-wallet-react expects base64 or something else, adapt here.
      const signedTxn = await signTransaction(txBuffer); // placeholder - adapt to the hook's API

      // `signedTxn` should be raw signed bytes; if it's different, adapt accordingly.
      const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

      setStatus(`Submitted tx ${txId} — waiting for confirmation...`);

      // 4. Wait for confirmation
      const confirmedTxn = await waitForConfirmation(algodClient, txId, 4);
      const assetId = confirmedTxn["asset-index"];

      setStatus(`Asset created: ${assetId}`);
      setResult({ assetId, txId });
    } catch (err: any) {
      setResult({ assetId: null, error: err.message || String(err) });
      setStatus(`Error: ${err.message || String(err)}`);
    }
  }

  async function waitForConfirmation(client: algosdk.Algodv2, txId: string, timeout = 10) {
    // From Algorand docs -- wait for tx confirmation
    const status = await client.status().do();
    if (!status) throw new Error("Unable to get node status");
    const startround = status["last-round"] + 1;
    let currentRound = startround;

    for (let i = 0; i < timeout; i++) {
      const pendingInfo = await client.pendingTransactionInformation(txId).do();
      if (pendingInfo !== undefined) {
        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
          return pendingInfo;
        } else if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
          // If there was a pool error, then the transaction has been rejected
          throw new Error(`Transaction Rejected: ${pendingInfo["pool-error"]}`);
        }
      }
      currentRound++;
      await client.statusAfterBlock(currentRound).do();
    }
    throw new Error("Transaction not confirmed after timeout");
  }

  async function onMintClick(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Starting mint flow...");

    try {
      // 1. Upload image & metadata to IPFS
      const metadata = {
        name: title,
        description,
        // image: "ipfs://<cid>", // uploadToIPFS should insert this
        // any other fields your verification needs: issuer name, role, start/end dates, hashed PII, reference ID, etc.
        issuer: "vHR Issuer Name",
        issuedAt: new Date().toISOString(),
      };

      const metadataUrl = await uploadToIPFS_blob(imageFile, metadata);
      setStatus(`Metadata uploaded: ${metadataUrl}`);

      // 2. Create the NFT on-chain with metadataUrl
      await createNFT(metadataUrl);
    } catch (err: any) {
      setStatus(`Error during mint: ${err.message || String(err)}`);
      setResult({ assetId: null, error: err.message || String(err) });
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Mint vHR Credential (NFT)</h2>

      {!connected ? (
        <div className="space-y-2">
          <p>Connect your wallet to mint credentials.</p>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={() => connect()}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <strong>Connected:</strong> {activeAccount?.address}
            <button className="ml-3 px-2 py-1 border" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>

          <form onSubmit={onMintClick} className="space-y-2">
            <div>
              <label className="block text-sm">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>

            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">
              Mint NFT
            </button>
          </form>

          {status && <div className="mt-2 text-sm">Status: {status}</div>}
          {result && result.assetId && (
            <div className="mt-2">
              Minted asset ID: <strong>{result.assetId}</strong>
            </div>
          )}
          {result && result.error && <div className="mt-2 text-red-600">Error: {result.error}</div>}
        </div>
      )}
    </div>
  );
}
