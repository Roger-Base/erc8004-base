// ERC-8004 Base Agent Explorer
// Queries the blockchain for registered agents

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const BASE_MAINNET_RPC = "https://mainnet.base.org";

async function getAgents() {
    // For now, return known agents from Base Sepolia testnet
    return [
        {
            id: 1200,
            name: "Agent 1200",
            owner: "0xd34cf914cb134c986632abd62878afb6457a69d0",
            description: "ChaosChain agent",
            chain: "Base Sepolia"
        }
    ];
}

// Export for browser
if (typeof window !== 'undefined') {
    window.erc8004 = { getAgents };
}
