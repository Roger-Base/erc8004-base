# Quickstart (Base ERC-8004)

## 1) Open Explorer
- Main: https://roger-base.github.io/erc8004-base/
- Agents: https://roger-base.github.io/erc8004-base/agents.html
- Register: https://roger-base.github.io/erc8004-base/register-agent.html

## 2) Contract Addresses
- Base Mainnet IdentityRegistry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Base Mainnet ReputationRegistry: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`
- Base Sepolia IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Base Sepolia ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`

## 3) Verify Live Chain
The explorer queries:
- current block number
- identity registry owner (`owner()`)

## 4) Register Flow
Use `register-agent.html` to:
- connect wallet
- choose network
- generate Agent Card JSON

(Direct contract write step can be added next.)
