'use client';

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../../utils/contractABI.json"
import { CONTRACT_ADDRESS, MANTLE_SEPOLIA_CHAIN_ID, SUPPORTED_NETWORKS } from "../../utils/config";
import { ERC20_ABI } from "../../utils/erc20Abi";

type Deposit = {
  token: string;
  amount: string;
  unlockTime: number;
  withdrawn: boolean;
};

declare global {
  interface Window { ethereum?: any }
}

export default function Page() {
  const [account, setAccount] = useState<string>("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [networkId, setNetworkId] = useState<string>("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const [ethAmount, setEthAmount] = useState("");
  const [ethLockDuration, setEthLockDuration] = useState(5);
  const [ethLockUnit, setEthLockUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('minutes');
  const [erc20, setErc20] = useState("");
  const [erc20Amount, setErc20Amount] = useState("");
  const [erc20LockDuration, setErc20LockDuration] = useState(5);
  const [erc20LockUnit, setErc20LockUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('minutes');
  const [erc20Symbol, setErc20Symbol] = useState<string>("");
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  const NATIVE = "0x0000000000000000000000000000000000000000";

  // Helper function to convert duration to seconds
  const convertToSeconds = (duration: number, unit: 'seconds' | 'minutes' | 'hours' | 'days'): number => {
    switch (unit) {
      case 'seconds':
        return duration;
      case 'minutes':
        return duration * 60;
      case 'hours':
        return duration * 60 * 60;
      case 'days':
        return duration * 24 * 60 * 60;
      default:
        return duration;
    }
  };

  // Helper function to validate lock duration
  const validateLockDuration = (duration: number, unit: 'seconds' | 'minutes' | 'hours' | 'days'): { isValid: boolean; message: string } => {
    const seconds = convertToSeconds(duration, unit);
    if (seconds < 60) {
      return { isValid: false, message: "Minimum lock time is 60 seconds (1 minute)" };
    }
    if (seconds > 365 * 24 * 60 * 60) {
      return { isValid: false, message: "Maximum lock time is 365 days (1 year)" };
    }
    return { isValid: true, message: "" };
  };

  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId, 'Expected:', MANTLE_SEPOLIA_CHAIN_ID);
      setNetworkId(chainId);
      
      if (chainId !== MANTLE_SEPOLIA_CHAIN_ID) {
        console.log('Switching to Mantle Sepolia Testnet...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: MANTLE_SEPOLIA_CHAIN_ID }],
          });
          console.log('Successfully switched to Mantle Sepolia Testnet');
        } catch (switchError: any) {
          console.log('Switch failed, adding network:', switchError);
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: MANTLE_SEPOLIA_CHAIN_ID,
                chainName: 'Mantle Sepolia Testnet',
                nativeCurrency: {
                  name: 'MNT',
                  symbol: 'MNT',
                  decimals: 18,
                },
                rpcUrls: [SUPPORTED_NETWORKS[MANTLE_SEPOLIA_CHAIN_ID].rpc],
                blockExplorerUrls: [SUPPORTED_NETWORKS[MANTLE_SEPOLIA_CHAIN_ID].explorer],
              }],
            });
            console.log('Successfully added Mantle Sepolia Testnet');
          } else {
            console.error('Failed to switch/add network:', switchError);
          }
        }
      }
      
      const finalChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(finalChainId === MANTLE_SEPOLIA_CHAIN_ID);
      console.log('Network check complete. Correct network:', finalChainId === MANTLE_SEPOLIA_CHAIN_ID);
    } catch (error) {
      console.error('Error checking/switching network:', error);
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }
    
    try {
      const p = new ethers.BrowserProvider(window.ethereum);
      await p.send("eth_requestAccounts", []);
      const s = await p.getSigner();
      setProvider(p);
      setSigner(s);
      setAccount(await s.getAddress());

      const c = new ethers.Contract(CONTRACT_ADDRESS, abi as any, s);
      setContract(c);
      
      await checkAndSwitchNetwork();
      
      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('Network changed to:', chainId);
        setNetworkId(chainId);
        setIsCorrectNetwork(chainId === MANTLE_SEPOLIA_CHAIN_ID);
        // Reload deposits when network changes
        if (contract && account) {
          loadDeposits();
        }
      });
      
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet');
    }
  };

  const loadDeposits = async () => {
    if (!contract || !account) return;
    try {
      const len: bigint = await contract.depositsLength(account);
      const rows: Deposit[] = [];
      for (let i = 0; i < Number(len); i++) {
        const d = await contract.getDeposit(account, i);
        const token = d[0] as string;
        const amountWei = d[1] as bigint;
        const unlock = Number(d[2]);
        const withdrawn = d[3] as boolean;

        let human = "";
        if (token === NATIVE) {
          human = ethers.formatEther(amountWei);
        } else {
          const t = new ethers.Contract(token, ERC20_ABI, provider!);
          const dec: number = await t.decimals();
          human = ethers.formatUnits(amountWei, dec);
        }

        rows.push({ token, amount: human, unlockTime: unlock, withdrawn });
      }
      setDeposits(rows);
    } catch (e) {
      console.error('Error loading deposits:', e);
      if (e && typeof e === 'object' && 'code' in e && e.code === 'BAD_DATA') {
        console.log('Contract returned empty data, user might have no deposits');
        setDeposits([]);
      }
    }
  };

  useEffect(() => {
    if (contract && account) loadDeposits();
  }, [contract, account]);

  const timeLeft = (unlockTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = unlockTime - now;
    if (diff <= 0) return "Unlocked";
    
    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const seconds = diff % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleDepositETH = async () => {
    if (!contract || !isCorrectNetwork) return;
    try {
      setLoading(true);
      const tx = await contract.depositETH(convertToSeconds(ethLockDuration, ethLockUnit), {
        value: ethers.parseEther(ethAmount || "0")
      });
      await tx.wait();
      setEthAmount("");
      await loadDeposits();
      alert("MNT deposit successful!");
    } catch (e: any) {
      console.error(e);
      alert(e?.shortMessage || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndDepositToken = async () => {
    if (!signer || !contract || !isCorrectNetwork) return;
    try {
      setLoading(true);
      const token = new ethers.Contract(erc20, ERC20_ABI, signer);
      const dec: number = await token.decimals();
      const sym: string = await token.symbol();
      setErc20Symbol(sym);

      const amt = ethers.parseUnits(erc20Amount || "0", dec);

      const approveTx = await token.approve(CONTRACT_ADDRESS, amt);
      await approveTx.wait();

      const depTx = await contract.depositToken(erc20, amt, convertToSeconds(erc20LockDuration, erc20LockUnit));
      await depTx.wait();

      setErc20Amount("");
      await loadDeposits();
      alert(`Deposited ${erc20Amount} ${sym}!`);
    } catch (e: any) {
      console.error(e);
      alert(e?.shortMessage || "ERC20 deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (index: number) => {
    if (!contract || !isCorrectNetwork) return;
    try {
      setLoading(true);
      const tx = await contract.withdraw(index);
      await tx.wait();
      await loadDeposits();
      alert("Withdrawn!");
    } catch (e: any) {
      console.error(e);
      alert(e?.shortMessage || "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  const withdrawBatch = async () => {
    if (!contract || deposits.length === 0 || !isCorrectNetwork) return;
    try {
      setLoading(true);
      const now = Math.floor(Date.now() / 1000);
      const matured: number[] = [];
      for (let i = 0; i < deposits.length; i++) {
        if (!deposits[i].withdrawn && deposits[i].unlockTime <= now) matured.push(i);
      }
      if (matured.length === 0) {
        alert("No matured deposits");
        return;
      }
      const tx = await contract.withdrawBatch(matured);
      await tx.wait();
      await loadDeposits();
      alert("Batch withdrawn!");
    } catch (e: any) {
      console.error(e);
      alert(e?.shortMessage || "Batch withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,100,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,100,255,0.05),transparent_50%)]"></div>
      </div>

      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-cyan-400 rounded-full opacity-30 blur-lg animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-600 rounded-full opacity-25 blur-md animate-pulse delay-500"></div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
            🏦 TimeVault
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Timelock Savings on <span className="text-blue-400 font-semibold">Mantle Sepolia Testnet</span>
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-gray-900/50 backdrop-blur-sm rounded-full border border-blue-500/30">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-blue-400 text-sm">MANTLE SEPOLIA TESTNET</span>
          </div>
        </div>

        {!account ? (
          <div className="text-center mb-12">
            <button 
              onClick={connect}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 border border-blue-400/50"
            >
              🔗 Connect MetaMask
            </button>
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-400 text-sm">Connected Wallet:</span>
                <div className="text-blue-400 font-mono text-lg">{account}</div>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-sm">Network:</span>
                <div className={`text-sm font-semibold ${isCorrectNetwork ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrectNetwork ? '✅ Mantle Sepolia Testnet' : `❌ Wrong Network (${networkId})`}
                </div>
              </div>
            </div>
            {!isCorrectNetwork && (
              <button 
                onClick={checkAndSwitchNetwork}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Switch to Mantle Sepolia Testnet
              </button>
            )}
          </div>
        )}

        {account && isCorrectNetwork && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-6 text-blue-400 flex items-center">
                <span className="mr-3">💎</span> Deposit MNT
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Amount (MNT)</label>
                  <input
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    placeholder="0.05"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Lock Duration</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => { setEthLockDuration(1); setEthLockUnit('minutes'); }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      1 min
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEthLockDuration(5); setEthLockUnit('minutes'); }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      5 min
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEthLockDuration(1); setEthLockUnit('hours'); }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      1 hour
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEthLockDuration(1); setEthLockUnit('days'); }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      1 day
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={ethLockDuration}
                      onChange={(e) => setEthLockDuration(Math.max(1, parseInt(e.target.value || "1")))}
                      className="w-20 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <select
                      value={ethLockUnit}
                      onChange={(e) => setEthLockUnit(e.target.value as 'seconds' | 'minutes' | 'hours' | 'days')}
                      className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Lock period: {convertToSeconds(ethLockDuration, ethLockUnit).toLocaleString()} seconds
                  </p>
                  {(() => {
                    const validation = validateLockDuration(ethLockDuration, ethLockUnit);
                    return validation.isValid ? null : (
                      <p className="text-xs text-red-400 mt-1">{validation.message}</p>
                    );
                  })()}
                </div>
                <button 
                  disabled={!account || loading || !ethAmount || !isCorrectNetwork || !validateLockDuration(ethLockDuration, ethLockUnit).isValid}
                  onClick={handleDepositETH}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Processing...' : '🚀 Deposit MNT'}
                </button>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-6 text-cyan-400 flex items-center">
                <span className="mr-3">🪙</span> Deposit Token
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Token Address</label>
                  <input
                    value={erc20}
                    onChange={(e) => setErc20(e.target.value)}
                    placeholder="0xToken..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Amount</label>
                  <input
                    value={erc20Amount}
                    onChange={(e) => setErc20Amount(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Lock Duration</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => { setErc20LockDuration(1); setErc20LockUnit('minutes'); }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      1 min
                    </button>
                    <button
                      type="button"
                      onClick={() => { setErc20LockDuration(5); setErc20LockUnit('minutes'); }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      5 min
                    </button>
                    <button
                      type="button"
                      onClick={() => { setErc20LockDuration(1); setErc20LockUnit('hours'); }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      1 hour
                    </button>
                    <button
                      type="button"
                      onClick={() => { setErc20LockDuration(1); setErc20LockUnit('days'); }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      1 day
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={erc20LockDuration}
                      onChange={(e) => setErc20LockDuration(Math.max(1, parseInt(e.target.value || "1")))}
                      className="w-20 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                    <select
                      value={erc20LockUnit}
                      onChange={(e) => setErc20LockUnit(e.target.value as 'seconds' | 'minutes' | 'hours' | 'days')}
                      className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Lock period: {convertToSeconds(erc20LockDuration, erc20LockUnit).toLocaleString()} seconds
                  </p>
                  {(() => {
                    const validation = validateLockDuration(erc20LockDuration, erc20LockUnit);
                    return validation.isValid ? null : (
                      <p className="text-xs text-red-400 mt-1">{validation.message}</p>
                    );
                  })()}
                </div>
                <button 
                  disabled={!account || loading || !erc20 || !erc20Amount || !isCorrectNetwork || !validateLockDuration(erc20LockDuration, erc20LockUnit).isValid}
                  onClick={handleApproveAndDepositToken}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Processing...' : '🔐 Approve & Deposit'}
                </button>
              </div>
            </div>
          </section>
        )}

        {account && isCorrectNetwork && (
          <section className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Your Deposits</h3>
              <div className="flex gap-3">
                <button 
                  onClick={loadDeposits} 
                  disabled={!account || loading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔄 Refresh
                </button>
                <button 
                  onClick={withdrawBatch} 
                  disabled={!account || loading || deposits.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  💰 Withdraw All Matured
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {deposits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏦</div>
                  <p className="text-gray-400 text-lg">No deposits yet. Start saving with MNT!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-blue-400 font-semibold">#</th>
                      <th className="text-left py-4 px-4 text-blue-400 font-semibold">Token</th>
                      <th className="text-left py-4 px-4 text-blue-400 font-semibold">Amount</th>
                      <th className="text-left py-4 px-4 text-blue-400 font-semibold">Unlock Time</th>
                      <th className="text-left py-4 px-4 text-blue-400 font-semibold">Status</th>
                      <th className="text-left py-4 px-4 text-blue-400 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((d, i) => {
                      const unlocked = d.unlockTime * 1000 <= Date.now();
                      const tokenLabel = d.token === NATIVE ? "MNT" : d.token.slice(0, 8) + "…";
                      return (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 px-4 text-white font-mono">{i}</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 bg-gray-800 rounded-full text-sm">
                              {d.token === NATIVE ? "💎 MNT" : "🪙 " + tokenLabel}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-white font-mono">{d.amount}</td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="text-gray-300">{new Date(d.unlockTime * 1000).toLocaleString()}</div>
                              <div className={`text-xs ${unlocked ? 'text-green-400' : 'text-yellow-400'}`}>
                                {timeLeft(d.unlockTime)}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {d.withdrawn ? (
                              <span className="inline-flex items-center px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                                ✅ Withdrawn
                              </span>
                            ) : unlocked ? (
                              <span className="inline-flex items-center px-3 py-1 bg-green-900 text-green-400 rounded-full text-sm">
                                🔓 Unlocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 bg-yellow-900 text-yellow-400 rounded-full text-sm">
                                🔒 Locked
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => withdraw(i)}
                              disabled={!unlocked || d.withdrawn || loading}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                d.withdrawn 
                                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                  : unlocked 
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {d.withdrawn ? "Withdrawn" : unlocked ? "💰 Withdraw" : "Locked"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        <footer className="text-center mt-16 text-gray-500">
          <p>Built for Mantle Hackathon • Powered by Mantle Sepolia Testnet</p>
        </footer>
      </main>
    </div>
  );
}


