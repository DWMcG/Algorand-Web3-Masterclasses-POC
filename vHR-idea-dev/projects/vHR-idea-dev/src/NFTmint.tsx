import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@txnlab/use-wallet-react'
import { sha512_256 } from 'js-sha512'
import { Buffer } from 'buffer'
import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface NFTmintProps {
  type: 'education' | 'employment'
  onClose: () => void
}

const NFTmint = ({ type, onClose }: NFTmintProps) => {
  const [metadataUrl, setMetadataUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  // Preset metadata IPFS URLs based on type (you can update these)
  const defaultMetadataUrls = {
  education: 'https://gateway.pinata.cloud/ipfs/bafkreicwt3ummeg7o5duyep7mvunisgdodmcodsk5adac4xv5op2xwgtga',
  employment: 'https://gateway.pinata.cloud/ipfs/bafkreic6pt32t65257cq5o5oa2y3xtsnlnksjroh7casslkky7i5ehv2lq',
}

  // Preset asset names and unit names based on type
  const assetInfo = {
    education: { assetName: 'vHR Education Credential', unitName: 'vHREDU' },
    employment: { assetName: 'VerifyHR Employment Credential', unitName: 'vHR-EMP' },
  }

  // Use preset metadata URL initially, allow user to change if you want
  React.useEffect(() => {
    setMetadataUrl(defaultMetadataUrls[type])
  }, [type])

  const handleMintNFT = async () => {
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    if (!metadataUrl) {
      enqueueSnackbar('Metadata URL is required', { variant: 'warning' })
      setLoading(false)
      return
    }

    try {
      enqueueSnackbar(`Minting ${type} NFT...`, { variant: 'info' })

      const metadataHash = new Uint8Array(Buffer.from(sha512_256.digest(metadataUrl)))

      const createNFTResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: 1n,
        decimals: 0,
        assetName: assetInfo[type].assetName,
        unitName: assetInfo[type].unitName,
        url: metadataUrl,
        metadataHash,
        defaultFrozen: false,
      })

      enqueueSnackbar(`NFT minted! TX ID: ${createNFTResult.txIds[0]}`, { variant: 'success' })
      setMetadataUrl(defaultMetadataUrls[type]) // reset to default after minting
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Failed to mint NFT', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog className={`modal modal-open bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Mint {type.charAt(0).toUpperCase() + type.slice(1)} NFT</h3>
        <br />
        <input
          type="text"
          placeholder="Metadata URL (IPFS)"
          className="input input-bordered w-full mb-4"
          value={metadataUrl}
          onChange={(e) => setMetadataUrl(e.target.value)}
        />
        <div className="modal-action">
          <button className="btn" onClick={onClose} type="button">
            Close
          </button>
          <button
            className={`btn ${!metadataUrl ? 'btn-disabled' : ''}`}
            onClick={handleMintNFT}
            type="button"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Mint NFT'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default NFTmint
