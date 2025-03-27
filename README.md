# Deployment

1. Copy `.env.example` to `.env` and set the environment variables.

2. Run the deployment script.
```bash
npx hardhat ignition deploy ignition/modules/Xp.ts --network opBnbMainnet
```

3. opBNB Scan doesn't support script verification, need to verify the contract manually.
