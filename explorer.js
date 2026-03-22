// ERC-8004 Base Agent Explorer
// Queries the blockchain for registered agents on Base Mainnet
// Self-contained: uses raw fetch JSON-RPC, no external dependencies

const IDENTITY_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const BASE_MAINNET_RPC = 'https://mainnet.base.org';

// ERC-8004 / ERC-721 function selectors
const SELECTORS = {
    ownerOf: '0x6352211e',
    tokenURI: '0xc87b56dd'
};

function encodeUint256(n) {
    return n.toString(16).padStart(64, '0');
}

async function jsonRpcCall(method, params) {
    const res = await fetch(BASE_MAINNET_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: 1
        })
    });
    const json = await res.json();
    return json.result || null;
}

async function callContract(to, data) {
    return await jsonRpcCall('eth_call', [{ to, data }, 'latest']);
}

function decodeString(raw) {
    if (!raw || raw === '0x' || raw.length < 130) return null;
    try {
        const uriHex = raw.slice(66); // drop offset(32) + length(32)
        const uriLen = parseInt(raw.slice(66, 130), 16);
        if (uriLen > 0 && uriLen < 512) {
            const str = uriHex.slice(0, uriLen * 2);
            return Buffer.from(str, 'hex').toString('utf8');
        }
    } catch {}
    return null;
}

async function fetchMetadata(tokenURI) {
    if (!tokenURI) return null;
    try {
        const url = tokenURI.startsWith('ipfs://')
            ? 'https://ipfs.io/ipfs/' + tokenURI.slice(7)
            : tokenURI;
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function getAgents() {
    const MAX_TOKENS = 500; // Scan token IDs 1–500
    const agents = [];

    for (let i = 1; i <= MAX_TOKENS; i++) {
        try {
            // ownerOf(uint256)
            const ownerRaw = await callContract(IDENTITY_REGISTRY, SELECTORS.ownerOf + encodeUint256(i));
            if (!ownerRaw || ownerRaw === '0x') continue;
            const ownerAddr = '0x' + ownerRaw.slice(26);
            if (ownerAddr === '0x0000000000000000000000000000000000000000') continue;

            // tokenURI(uint256)
            const uriRaw = await callContract(IDENTITY_REGISTRY, SELECTORS.tokenURI + encodeUint256(i));
            const tokenURI = decodeString(uriRaw);

            // Fetch metadata
            let name = `Agent #${i}`;
            let description = '';
            let url = '';
            if (tokenURI) {
                const meta = await fetchMetadata(tokenURI);
                if (meta) {
                    name = meta.name || name;
                    description = meta.description || '';
                    url = meta.url || '';
                }
            }

            agents.push({
                id: i,
                owner: ownerAddr,
                tokenURI: tokenURI || '',
                name,
                description,
                url
            });
        } catch {
            // Skip this ID on error
        }
    }

    return agents;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.erc8004 = { getAgents };
}
