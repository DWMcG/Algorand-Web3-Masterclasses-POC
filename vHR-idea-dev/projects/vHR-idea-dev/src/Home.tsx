import React, { useState } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import ConnectWallet from "./components/ConnectWallet"
import Verify from "./pages/Verify" // Make sure this path is correct

export default function Home() {
  const { activeAddress } = useWallet()
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [showVerify, setShowVerify] = useState(false)  // <-- new state

  const toggleWalletModal = () => setOpenWalletModal((open) => !open)

  const onMintEducation = () => console.log("Mint Education NFT clicked")
  const onMintEmployment = () => console.log("Mint Employment NFT clicked")

  // Update onVerify to show the Verify UI instead of just console logging
  const onVerify = () => setShowVerify(true)

  // Optional: add a way to close/hide the Verify UI
  const onCloseVerify = () => setShowVerify(false)

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
            onClick={onMintEducation}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Mint Education NFT
          </button>

          <button
            onClick={onMintEmployment}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Mint Employment NFT
          </button>

          <button
            onClick={onVerify}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Verify Credentials
          </button>
        </div>
      )}

      {/* Show the Verify component below buttons when toggled */}
      {showVerify && (
        <div className="mt-6 w-72">
          <Verify onClose={onCloseVerify} />
        </div>
      )}

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}
