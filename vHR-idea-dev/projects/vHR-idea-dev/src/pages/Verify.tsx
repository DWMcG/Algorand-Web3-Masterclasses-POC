import React, { useState } from "react";
import algosdk from "algosdk";
import { getIndexerConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";

interface VerifyProps {
  onClose: () => void;  // Add onClose prop type
}

const Verify: React.FC<VerifyProps> = ({ onClose }) => {
  const [assetId, setAssetId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);

    try {
      const cfg = getIndexerConfigFromViteEnvironment();
      const indexerClient = new algosdk.Indexer("", cfg.server, cfg.port);

      // Search for asset info
      const response = await indexerClient.lookupAssetByID(Number(assetId)).do();

      if (response.asset) {
        setResult(`✅ Credential found! Name: ${response.asset.params.name}, Unit: ${response.asset.params['unit-name']}`);
      } else {
        setResult("❌ No credential found for this Asset ID.");
      }
    } catch (err: any) {
      console.error(err);
      setResult("⚠️ Error verifying credential.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Verify Credential</h2>

      <input
        type="text"
        placeholder="Enter Asset ID"
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={handleVerify}
        disabled={!assetId || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {result && <div className="mt-4 p-3 bg-gray-100 rounded">{result}</div>}

      {/* Add a close button to call onClose */}
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Close
      </button>
    </div>
  );
};

export default Verify;
