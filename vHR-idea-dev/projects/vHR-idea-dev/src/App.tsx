import React, { useState } from 'react'
import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import Home from './Home'
import Verify from './pages/Verify'  // Adjust if needed
// import MintEducation and MintEmployment when ready

import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
  ]
}

export default function App() {
  const [page, setPage] = useState<'home' | 'verify'>('home')

  const algodConfig = getAlgodConfigFromViteEnvironment()

  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <nav className="p-4 bg-gray-100 mb-4">
          <button
            className="mr-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setPage('home')}
          >
            Home
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => setPage('verify')}
          >
            Verify Credentials
          </button>
        </nav>

        <div className="p-4">
          {page === 'home' && <Home />}
          {page === 'verify' && <Verify />}
        </div>
      </WalletProvider>
    </SnackbarProvider>
  )
}
