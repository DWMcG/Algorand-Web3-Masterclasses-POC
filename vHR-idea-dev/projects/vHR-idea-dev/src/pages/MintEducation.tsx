import React, { useState } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { mintEducationNFT } from "../utils/mintEducationNFT"

export default function MintEducation() {
  const { activeWallet } = useWallet()  // Use activeWallet here
  const [minting, setMinting] = useState(false)
  const [mintResult, setMintResult] = useState<string | null>(null)

  const handleMint = async () => {
    if (!activeWallet || !activeWallet.accounts.length) {
      setMintResult("⚠️ Connect your wallet first.")
      return
    }

    setMinting(true)
    setMintResult(null)

    try {
      const result = await mintEducationNFT(activeWallet)  // pass activeWallet directly
      setMintResult(`✅ Minted Education NFT! Asset ID: ${result.assetId}, Tx ID: ${result.txId}`)
    } catch (error) {
      console.error(error)
      setMintResult("❌ Minting failed. See console for details.")
    } finally {
      setMinting(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Mint Education Credential NFT</h2>
      <button
        onClick={handleMint}
        disabled={minting}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {minting ? "Minting..." : "Mint Education NFT"}
      </button>
      {mintResult && <p className="mt-4">{mintResult}</p>}
    </div>
  )
}
