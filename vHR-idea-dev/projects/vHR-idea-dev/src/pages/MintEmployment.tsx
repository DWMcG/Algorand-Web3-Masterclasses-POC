import React, { useState } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { mintEmploymentNFT } from "../utils/mintEmploymentNFT"

export default function MintEmployment() {
  const { activeWallet } = useWallet()
  const [minting, setMinting] = useState(false)
  const [assetId, setAssetId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMint = async () => {
    if (!activeWallet) {
      setError("Wallet not connected")
      return
    }

    setMinting(true)
    setError(null)
    setAssetId(null)

    try {
      const result = await mintEmploymentNFT(activeWallet)
      setAssetId(result.assetId)
    } catch (err: any) {
      setError(err.message || "Minting failed")
    } finally {
      setMinting(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Mint Employment NFT</h2>
      <button
        onClick={handleMint}
        disabled={minting}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {minting ? "Minting..." : "Mint NFT"}
      </button>

      {assetId && (
        <p className="mt-4 text-green-700">
          ✅ Minted successfully! Asset ID: <strong>{assetId}</strong>
        </p>
      )}

      {error && (
        <p className="mt-4 text-red-600">
          ⚠️ Error: {error}
        </p>
      )}
    </div>
  )
}
