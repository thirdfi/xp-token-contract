# Deployment

1. Copy `.env.example` to `.env` and set the environment variables.

2. Run the deployment script.
```bash
npx hardhat ignition deploy ignition/modules/Xp.ts --network opBnbMainnet
```

3. opBNB Scan doesn't support script verification, need to verify the contract manually.

Mainnet proxy contract: 0x3cAfdB41C9866655C278064E90F8781c9CBC9E03
Mainnet implementation contract: 0x48C0ED07E0D6328556aaD463fAad7799ac579574