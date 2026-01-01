// Mantle Sepolia Testnet Configuration
export const MANTLE_SEPOLIA_CHAIN_ID = "0x138b"; // 5003 in hex
export const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz";
export const MANTLE_SEPOLIA_EXPLORER = "https://sepolia.mantlescan.xyz/";

// Contract address on Mantle Sepolia Testnet
// User will update this by themselves
export const CONTRACT_ADDRESS = "0x4fe141360A453cdD2953e637C82CD032534E1c9A";

// Network configuration
export const SUPPORTED_NETWORKS = {
  [MANTLE_SEPOLIA_CHAIN_ID]: {
    name: "Mantle Sepolia Testnet",
    rpc: MANTLE_SEPOLIA_RPC,
    explorer: MANTLE_SEPOLIA_EXPLORER,
    nativeCurrency: {
      name: "MNT",
      symbol: "MNT",
      decimals: 18,
    },
  },
};
