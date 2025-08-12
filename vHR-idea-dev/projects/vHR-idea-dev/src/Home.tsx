import React, { useState } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import ConnectWallet from "./components/ConnectWallet"
import Verify from "./pages/Verify"
import NFTmint from "./NFTmint" // unified mint component

export default function Home() {
  const { activeAddress } = useWallet()
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [showVerify, setShowVerify] = useState(false)
  const [showMint, setShowMint] = useState<{ open: boolean; type: "education" | "employment" }>({
    open: false,
    type: "education",
  })

  const toggleWalletModal = () => setOpenWalletModal((open) => !open)

  const openMintEducation = () => setShowMint({ open: true, type: "education" })
  const openMintEmployment = () => setShowMint({ open: true, type: "employment" })

  const openVerify = () => {
    setShowVerify(true)
    setShowMint({ open: false, type: "education" }) // close mint when verifying
  }

  const closeMint = () => setShowMint({ open: false, type: "education" })
  const closeVerify = () => setShowVerify(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-teal-100 p-6">
      <h1 className="text-4xl font-bold text-[#1C2D5A]">vHR Test Interface</h1>

      <button
        onClick={toggleWalletModal}
        className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
      >
        {activeAddress ? `Wallet Connected: ${activeAddress.slice(0, 6)}…` : "Connect Wallet"}
      </button>

      {activeAddress && (
        <div className="flex flex-col space-y-4 mt-6 w-72">
          <button
            onClick={openMintEducation}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Mint Education NFT
          </button>

          <button
            onClick={openMintEmployment}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Mint Employment NFT
          </button>

          <button
            onClick={openVerify}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Verify Credentials
          </button>
        </div>
      )}

      {showVerify && (
        <div className="mt-6 w-72">
          <Verify onClose={closeVerify} />
        </div>
      )}

      {showMint.open && (
        <div className="mt-6 w-72">
          <NFTmint type={showMint.type} onClose={closeMint} />
        </div>
      )}

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}
