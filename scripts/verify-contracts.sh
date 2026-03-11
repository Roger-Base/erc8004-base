#!/usr/bin/env bash
set -euo pipefail

MAINNET_RPC="https://mainnet.base.org"
SEPOLIA_RPC="https://sepolia.base.org"

ID_MAIN="0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
REP_MAIN="0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"
ID_SEP="0x8004A818BFB912233c491871b3d84c89A494BD9e"
REP_SEP="0x8004B663056A597Dffe9eCcC1965A193B7388713"

owner_call="0x8da5cb5b"

query_owner() {
  local rpc="$1"
  local to="$2"
  curl -s -X POST "$rpc" -H 'Content-Type: application/json' \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$to\",\"data\":\"$owner_call\"},\"latest\"],\"id\":1}" | jq -r '.result'
}

query_block() {
  local rpc="$1"
  curl -s -X POST "$rpc" -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq -r '.result'
}

echo "Base Mainnet block: $(query_block "$MAINNET_RPC")"
echo "Identity owner (mainnet): $(query_owner "$MAINNET_RPC" "$ID_MAIN")"
echo "Reputation owner (mainnet): $(query_owner "$MAINNET_RPC" "$REP_MAIN")"
echo "Base Sepolia block: $(query_block "$SEPOLIA_RPC")"
echo "Identity owner (sepolia): $(query_owner "$SEPOLIA_RPC" "$ID_SEP")"
echo "Reputation owner (sepolia): $(query_owner "$SEPOLIA_RPC" "$REP_SEP")"
