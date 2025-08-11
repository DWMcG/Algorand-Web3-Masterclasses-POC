import React from 'react'

interface ModalProps {
  openModal: boolean
  closeModal: () => void
}

const VerifyCredentials: React.FC<ModalProps> = ({ openModal, closeModal }) => {
  if (!openModal) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="text-lg font-bold mb-4">Verify Credentials</h2>
        <p>Enter a wallet address or NFT ID to verify education and employment credentials.</p>
        <p className="mt-2 text-sm text-gray-500">Verification feature coming soon.</p>
        <div className="modal-action">
          <button className="btn" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyCredentials