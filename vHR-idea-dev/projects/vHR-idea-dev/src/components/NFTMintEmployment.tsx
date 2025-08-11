import React from 'react'

interface ModalProps {
  openModal: boolean
  closeModal: () => void
}

const NFTMintEmployment: React.FC<ModalProps> = ({ openModal, closeModal }) => {
  if (!openModal) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="text-lg font-bold mb-4">Mint Employment Credential</h2>
        <p>This will allow an authorized HR representative to mint an employment credential NFT.</p>
        <p className="mt-2 text-sm text-gray-500">Functionality coming soon.</p>
        <div className="modal-action">
          <button className="btn" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default NFTMintEmployment