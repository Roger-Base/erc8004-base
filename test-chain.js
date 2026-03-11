// Test Base mainnet connectivity
const BASE_MAINNET = "https://mainnet.base.org";

async function test() {
    // Get current block
    const blockResp = await fetch(BASE_MAINNET, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
        })
    });
    const blockData = await blockResp.json();
    console.log('Current block:', parseInt(blockData.result, 16));
    
    // Get owner of IdentityRegistry
    const ownerResp = await fetch(BASE_MAINNET, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
                to: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
                data: "0x8da5cb5b"  // owner()
            }, "latest"],
            id: 1
        })
    });
    const ownerData = await ownerResp.json();
    console.log('Owner:', ownerData.result);
}

test();
