# 🏦 TimeVault Bank - Mantle Sepolia Testnet dApp

A timelock savings dApp built for the Mantle Hackathon, deployed on Mantle Sepolia Testnet. [Live](https://timevault-mantle.onrender.com/)


## ✨ Features

- **Mantle Sepolia Testnet** - Built specifically for Mantle Sepolia Testnet
- **Timelock Savings** - Deposit MNT or ERC-20 tokens with custom lock periods
- **No Early Withdrawals** - Enforced time-based locking mechanism
- **Batch Operations** - Withdraw multiple matured deposits at once
- **Responsive Design** - Works on desktop and mobile devices

## 🔗 Mantle Sepolia Testnet Setup

### 1. Add Mantle Sepolia Testnet to MetaMask

**Network Name:** Mantle Sepolia Testnet  
**RPC URL:** `https://rpc.sepolia.mantle.xyz`  
**Chain ID:** `5003` (hex: `0x138b`)   
**Currency Symbol:** MNT  
**Block Explorer:** `https://sepolia.mantlescan.xyz/`

### 2. Get MNT Tokens

## 💎 How to Use

### 1. Connect Wallet
- Click "Connect MetaMask" 
- Ensure you're on Mantle Sepolia Testnet
- The app will automatically prompt you to switch networks if needed

### 2. Deposit MNT
- Enter the amount of MNT you want to deposit
- Set the lock duration in seconds (minimum 60 seconds)
- Click "Deposit MNT"
- Confirm the transaction in MetaMask

### 3. Deposit ERC-20 Tokens
- Enter the token contract address
- Specify the amount to deposit
- Set the lock duration
- Click "Approve & Deposit" (requires two transactions)

### 4. Withdraw
- Wait for your deposit to mature
- Click "Withdraw" on matured deposits
- Or use "Withdraw All Matured" for batch operations

## 🔧 Technical Details

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 with custom animations
- **Blockchain:** Mantle Sepolia Testnet integration
- **Wallet:** MetaMask compatibility
- **Smart Contract:** Solidity timelock contract with reentrancy protection

## 📱 Smart Contract

The dApp interacts with a deployed smart contract on Mantle Sepolia Testnet:

- **Contract Address:** `0x4fe141360A453cdD2953e637C82CD032534E1c9A`
- **Chain ID:** 5003 (0x138b)
- **Network:** Mantle Sepolia Testnet
- **Features:** MNT/ERC-20 deposits, timelock mechanism, batch withdrawals
- **Security:** Reentrancy protection, proper access controls

## 🐛 Troubleshooting

### Common Issues

1. **"Wrong Network" Error**
   - Ensure MetaMask is connected to Mantle Sepolia Testnet (Chain ID: 5003 / 0x138b)
   - Use the "Switch to Mantle Sepolia Testnet" button

2. **"Could not decode result data" Error**
   - This usually means no deposits exist yet
   - The app handles this gracefully and shows an empty state

3. **Transaction Fails**
   - Check if you have sufficient MNT for gas fees
   - Ensure the contract address is correct
   - Verify you're on the correct network

### Debug Mode

Open browser console to see detailed error messages and transaction logs.

## 🎯 Mantle Hackathon Features

- **Mantle Sepolia Testnet** - Deployed on Mantle Sepolia Testnet for production use
- **EVM Compatibility** - Uses Mantle's EVM layer for Ethereum tooling
- **Gas Optimization** - Efficient smart contract design
- **User Experience** - Intuitive interface for DeFi beginners

## Images
<img width="1409" height="815" alt="Screenshot 2026-01-02 at 2 31 23 AM" src="https://github.com/user-attachments/assets/8d1c69e4-0bf3-46ca-952a-ff4e131afae9" />
<img width="1405" height="775" alt="Screenshot 2026-01-02 at 2 31 48 AM" src="https://github.com/user-attachments/assets/571209ad-0089-4235-b954-1f0f9578b638" />

<img width="1165" height="685" alt="Screenshot 2026-01-02 at 2 32 36 AM" src="https://github.com/user-attachments/assets/568c9e8a-393f-4896-aab4-38415c4354f4" />

<img width="1160" height="478" alt="Screenshot 2026-01-02 at 2 32 46 AM" src="https://github.com/user-attachments/assets/728b39ec-7ed8-44b8-8d66-08447c80546d" />

