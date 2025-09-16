## MAIGA XP Token Deployment

1. Copy `.env.example` to `.env` and set the environment variables.

2. Run the deployment script.
```bash
npx hardhat ignition deploy ignition/modules/Xp.ts --network opBnbMainnet
```

3. opBNB Scan doesn't support script verification, need to verify the contract manually.

### MAIGA XP token contract
Mainnet: 0x3cAfdB41C9866655C278064E90F8781c9CBC9E03

Testnet: 0x183738640C37341fDf9b27902473CFD85d853a93

## Boost contract Deployment

1. Run the deployment script.
```bash
npx hardhat ignition deploy ignition/modules/Boost.ts --network opBnbMainnet
```

2. opBNB Scan doesn't support script verification, need to verify the contract manually. From ignition/deployments/chain-204/build-info/<some_hash>.json, copy the input object and save as input.json. Use this input.json to verify the contract via standard-json-input.

### Boost contract
Mainnet: 0xAaCc0143ebcAD38E3D405008e4E30BF5214c02af

Testnet: 0x5BfB81828acb5d11d60Dc34961e1f56802EC658E

### BoostV2 contract
Mainnet:

Testnet: 0x6fC8E49d1fB8C3bF1b1E835BcF72BDdC3b5D8275
