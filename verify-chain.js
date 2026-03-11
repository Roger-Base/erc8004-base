// Verify ERC-8004 contracts on Base Mainnet
const BASE_MAINNET = "https://mainnet.base.org";

const CONTRACTS = {
    mainnet: {
        identity: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        reputation: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"
    },
    sepolia: {
        identity: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
        reputation: "0x8004B663056A597Dffe9eCcC1965A193B7388713"
    }
};

async function verify() {
    console.log("=== ERC-8004 Base Mainnet Verification ===\n");
    
    for (const [network, addrs] of Object.entries(CONTRACTS)) {
        console.log(`--- ${network.toUpperCase()} ---`);
        
        // Get block number
        const blockResp = await fetch(network === 'mainnet' ? BASE_MAINNET : "https://sepolia.base.org", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1})
        });
        const blockData = await blockResp.json();
        console.log(`Block: ${parseInt(blockData.result, 16)}`);
        
        // Get owner
        const ownerResp = await fetch(network === 'mainnet' ? BASE_MAINNET : "https://sepolia.base.org", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({jsonrpc: '2.0', method: 'eth_call', params: [{to: addrs.identity, data: "0x8da5cb5b"}, "latest"], id: 1})
        });
        const ownerData = await ownerResp.json();
        console.log(`IdentityRegistry owner: ${ownerData.result}`);
        console.log(`IdentityRegistry: ${addrs.identity}`);
        console.log(`ReputationRegistry: ${addrs.reputation}\n`);
    }
}

verify();
