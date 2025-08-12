import algosdk from "algosdk";
import { getAlgodConfigFromViteEnvironment } from "./getAlgoClientConfigs";

export function getAlgoClient() {
  const config = getAlgodConfigFromViteEnvironment();
  return new algosdk.Algodv2(
    String(config.token),  // Pass token here properly as string
    config.server,
    config.port
  );
}
