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

function parseTokenURI(raw) {
    // ethers.js v6 returns the decoded string directly
    // If it looks like a data URL or IPFS, return it
    // If it's still hex-encoded, decode it
    if (!raw || raw === '0x') return null;
    if (raw.startsWith('0x')) {
        // Check if it's a bytes string (offset + length prefix in hex)
        if (raw.length > 130) {
            try {
                const uriHex = raw.slice(66);
                const uriLen = parseInt(raw.slice(66, 130), 16);
                if (uriLen > 0 && uriLen < 2000) {
                    const str = uriHex.slice(0, uriLen * 2);
                    return Buffer.from(str, 'hex').toString('utf8');
                }
            } catch {}
        }
        // Maybe it's a raw hex string (no length prefix)
        try {
            const hex = raw.slice(2);
            if (hex.length % 2 === 0) {
                const decoded = Buffer.from(hex, 'hex').toString('utf8');
                if (decoded.startsWith('data:') || decoded.startsWith('ipfs://') || decoded.startsWith('https://')) {
                    return decoded;
                }
            }
        } catch {}
        return null;
    }
    return raw; // Already decoded by ethers.js v6
}

function decodeMetadata(tokenURI) {
    if (!tokenURI) return null;
    try {
        // Handle data:application/json;base64,... URIs
        if (tokenURI.startsWith('data:application/json;base64,')) {
            const b64 = tokenURI.split(',')[1];
            return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
        }
        // Handle ipfs:// URIs
        if (tokenURI.startsWith('ipfs://')) {
            const url = 'https://ipfs.io/ipfs/' + tokenURI.slice(7);
            // Use sync fetch isn't available in browser — skip for now
            return { tokenURI };
        }
        // Handle direct HTTP URLs
        if (tokenURI.startsWith('http')) {
            return { url: tokenURI };
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
            const tokenURI = parseTokenURI(uriRaw);

            // Fetch metadata
            let name = `Agent #${i}`;
            let description = '';
            let url = '';
            let services = [];
            let x402support = false;
            if (tokenURI) {
                const meta = decodeMetadata(tokenURI);
                if (meta) {
                    name = meta.name || name;
                    description = meta.description || '';
                    url = meta.url || tokenURI;
                    services = meta.services || [];
                    x402support = meta.x402support || false;
                }
            }

            agents.push({
                id: i,
                owner: ownerAddr,
                tokenURI: tokenURI || '',
                name,
                description,
                url,
                services,
                x402support
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
