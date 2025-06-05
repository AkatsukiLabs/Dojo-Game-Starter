import slot from "../config/manifest_sepolia.json"; // change for the right slot manifest
import sepolia from "../config/manifest_sepolia.json"; // sepolia example manifest for this starter
import mainnet from "../config/manifest_sepolia.json"; // change for the right mainnet manifest

// Define valid deploy types
type DeployType = keyof typeof manifests;

// Create the manifests object
const manifests = {
  mainnet,
  sepolia,
  slot,
};

// Get deployment type from environment with fallback
const deployType = import.meta.env.VITE_PUBLIC_DEPLOY_TYPE as string;

// Export the appropriate manifest with a fallback
export const manifest = deployType in manifests 
  ? manifests[deployType as DeployType] 
  : sepolia;

export type Manifest = typeof manifest;