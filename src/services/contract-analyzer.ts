// src/services/contract-analyzer.ts
import { ethers } from 'ethers';
import { Logger } from '../utils/logger';
import { DatabaseManager } from '../database/manager';

export interface ContractInfo {
  address: string;
  creator: string;
  creationHash: string;
  creationBlock: number;
  contractType: string;
  firstSeen: Date;
  lastActivity: Date;
  totalInteractions: number;
  uniqueCallers: Set<string>;
  functionSignatures: Map<string, number>;
  gasUsed: number;
  isVerified: boolean;
}

export interface FunctionCall {
  signature: string;
  name: string;
  callCount: number;
  gasUsage: number;
  popularity: number;
}

export class ContractAnalyzer {
  private provider: ethers.JsonRpcProvider;
  private logger: Logger;
  private db: DatabaseManager;
  private contractCache: Map<string, ContractInfo> = new Map();

  constructor(db: DatabaseManager) {
    this.provider = new ethers.JsonRpcProvider('https://carrot.megaeth.com/rpc');
    this.logger = new Logger('ContractAnalyzer');
    this.db = db;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async discoverActiveContracts(blocksToAnalyze: number = 10): Promise<ContractInfo[]> {
    this.logger.info(`Discovering active contracts from last ${blocksToAnalyze} blocks...`);
    
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const contracts = new Map<string, ContractInfo>();
      
      // Analyze recent blocks for contract activity
      for (let i = 0; i < blocksToAnalyze; i++) {
        const blockNumber = currentBlock - i;
        const block = await this.provider.getBlock(blockNumber);
        
        if (!block || !block.transactions) continue;
        
        this.logger.info(`Analyzing block ${blockNumber} with ${block.transactions.length} transactions`);
        
        // Sample transactions to avoid rate limits (analyze every 10th transaction)
        const sampleSize = Math.min(50, block.transactions.length);
        const step = Math.max(1, Math.floor(block.transactions.length / sampleSize));
        
        for (let j = 0; j < block.transactions.length; j += step) {
          const txHash = block.transactions[j];
          
          try {
            const [tx, receipt] = await Promise.all([
              this.provider.getTransaction(txHash),
              this.provider.getTransactionReceipt(txHash)
            ]);
            
            if (!tx || !receipt) continue;
            
            // Analyze contract interactions
            if (tx.to) {
              // Existing contract interaction
              await this.analyzeContractInteraction(tx, receipt, contracts, block.timestamp);
            } else if (receipt.contractAddress) {
              // New contract deployment
              await this.analyzeContractDeployment(tx, receipt, contracts, block.timestamp);
            }
            
          } catch (txError) {
            // Skip failed transaction analysis
            continue;
          }
        }
        
        if (i > 0) await this.delay(100); // 100ms delay between blocks
      }
      
      const contractList = Array.from(contracts.values());
      this.logger.info(`Discovered ${contractList.length} active contracts`);
      
      return contractList.sort((a, b) => b.totalInteractions - a.totalInteractions);
      
    } catch (error) {
      this.logger.error('Error discovering contracts:', error);
      return [];
    }
  }

  private async analyzeContractInteraction(
    tx: ethers.TransactionResponse, 
    receipt: ethers.TransactionReceipt,
    contracts: Map<string, ContractInfo>,
    blockTimestamp: number
  ) {
    if (!tx.to) return;
    
    const contractAddress = tx.to.toLowerCase();
    
    // Get or create contract info
    let contractInfo = contracts.get(contractAddress);
    if (!contractInfo) {
      contractInfo = {
        address: contractAddress,
        creator: 'unknown',
        creationHash: 'unknown',
        creationBlock: 0,
        contractType: await this.identifyContractType(tx, receipt),
        firstSeen: new Date(blockTimestamp * 1000),
        lastActivity: new Date(blockTimestamp * 1000),
        totalInteractions: 0,
        uniqueCallers: new Set(),
        functionSignatures: new Map(),
        gasUsed: 0,
        isVerified: false
      };
      contracts.set(contractAddress, contractInfo);
    }
    
    // Update interaction stats
    contractInfo.totalInteractions++;
    contractInfo.uniqueCallers.add(tx.from.toLowerCase());
    contractInfo.gasUsed += Number(receipt.gasUsed);
    contractInfo.lastActivity = new Date(blockTimestamp * 1000);
    
    // Analyze function signature
    if (tx.data && tx.data.length >= 10) {
      const signature = tx.data.substring(0, 10);
      const currentCount = contractInfo.functionSignatures.get(signature) || 0;
      contractInfo.functionSignatures.set(signature, currentCount + 1);
    }
  }

  private async analyzeContractDeployment(
    tx: ethers.TransactionResponse,
    receipt: ethers.TransactionReceipt,
    contracts: Map<string, ContractInfo>,
    blockTimestamp: number
  ) {
    if (!receipt.contractAddress) return;
    
    const contractAddress = receipt.contractAddress.toLowerCase();
    
    const contractInfo: ContractInfo = {
      address: contractAddress,
      creator: tx.from.toLowerCase(),
      creationHash: tx.hash,
      creationBlock: receipt.blockNumber,
      contractType: await this.identifyContractType(tx, receipt),
      firstSeen: new Date(blockTimestamp * 1000),
      lastActivity: new Date(blockTimestamp * 1000),
      totalInteractions: 1,
      uniqueCallers: new Set([tx.from.toLowerCase()]),
      functionSignatures: new Map(),
      gasUsed: Number(receipt.gasUsed),
      isVerified: false
    };
    
    contracts.set(contractAddress, contractInfo);
    this.logger.info(`🆕 New contract deployed: ${contractAddress} by ${tx.from}`);
  }

  private async identifyContractType(
    tx: ethers.TransactionResponse,
    receipt: ethers.TransactionReceipt
  ): Promise<string> {
    try {
      // Analyze deployment bytecode patterns or function signatures
      if (tx.data) {
        const data = tx.data.toLowerCase();
        
        // Common contract patterns
        if (data.includes('a9059cbb')) return 'ERC20 Token'; // transfer(address,uint256)
        if (data.includes('23b872dd')) return 'ERC20 Token'; // transferFrom(address,address,uint256)
        if (data.includes('095ea7b3')) return 'ERC20 Token'; // approve(address,uint256)
        
        if (data.includes('42842e0e')) return 'ERC721 NFT'; // safeTransferFrom
        if (data.includes('b88d4fde')) return 'ERC721 NFT'; // safeTransferFrom with data
        
        if (data.includes('1f00ca74')) return 'DEX'; // getAmountsOut
        if (data.includes('38ed1739')) return 'DEX'; // swapExactTokensForTokens
        if (data.includes('7ff36ab5')) return 'DEX'; // swapExactETHForTokens
        
        if (data.includes('b6b55f25')) return 'Lending'; // deposit
        if (data.includes('69328dec')) return 'Lending'; // withdraw
        if (data.includes('c5ebeaec')) return 'Lending'; // borrow
        
        if (data.includes('e2bbb158')) return 'Staking'; // stake
        if (data.includes('2e1a7d4d')) return 'Staking'; // withdraw
        
        // Gas usage patterns
        const gasUsed = Number(receipt.gasUsed);
        if (gasUsed > 1000000) return 'Complex DeFi';
        if (gasUsed > 500000) return 'Multi-Function';
        if (gasUsed > 100000) return 'Standard Contract';
      }
      
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  async getContractInteractionGraph(contractAddress: string): Promise<any> {
    this.logger.info(`Building interaction graph for ${contractAddress}...`);
    
    try {
      // This would analyze which contracts call this contract
      // and which contracts this contract calls
      const interactions = {
        inbound: [], // Contracts that call this contract
        outbound: [], // Contracts this contract calls
        frequency: new Map() // Call frequency between contracts
      };
      
      // Would need to analyze internal transactions and logs
      // For now, return placeholder structure
      return {
        contractAddress,
        totalInteractions: 0,
        interactions
      };
    } catch (error) {
      this.logger.error('Error building interaction graph:', error);
      return null;
    }
  }

  async getPopularFunctions(limit: number = 10): Promise<FunctionCall[]> {
    this.logger.info('Analyzing most popular function calls...');
    
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const functionStats = new Map<string, { count: number, gasUsed: number }>();
      
      // Analyze recent blocks for function popularity
      for (let i = 0; i < 5; i++) {
        const block = await this.provider.getBlock(currentBlock - i);
        if (!block) continue;
        
        for (const txHash of block.transactions.slice(0, 20)) {
          try {
            const [tx, receipt] = await Promise.all([
              this.provider.getTransaction(txHash),
              this.provider.getTransactionReceipt(txHash)
            ]);
            
            if (tx && receipt && tx.data && tx.data.length >= 10) {
              const signature = tx.data.substring(0, 10);
              const current = functionStats.get(signature) || { count: 0, gasUsed: 0 };
              functionStats.set(signature, {
                count: current.count + 1,
                gasUsed: current.gasUsed + Number(receipt.gasUsed)
              });
            }
          } catch (e) {
            continue;
          }
        }
        
        if (i > 0) await this.delay(100); // 100ms delay between blocks
      }
      
      // Convert to sorted list
      const functions: FunctionCall[] = Array.from(functionStats.entries()).map(([signature, stats]) => ({
        signature,
        name: this.getFunctionName(signature),
        callCount: stats.count,
        gasUsage: stats.gasUsed,
        popularity: stats.count
      }));
      
      return functions
        .sort((a, b) => b.callCount - a.callCount)
        .slice(0, limit);
        
    } catch (error) {
      this.logger.error('Error analyzing popular functions:', error);
      return [];
    }
  }

  private getFunctionName(signature: string): string {
    // Common function signatures to names mapping
    const knownFunctions: { [key: string]: string } = {
      '0xa9059cbb': 'transfer(address,uint256)',
      '0x23b872dd': 'transferFrom(address,address,uint256)',
      '0x095ea7b3': 'approve(address,uint256)',
      '0x18160ddd': 'totalSupply()',
      '0x70a08231': 'balanceOf(address)',
      '0x42842e0e': 'safeTransferFrom(address,address,uint256)',
      '0xb88d4fde': 'safeTransferFrom(address,address,uint256,bytes)',
      '0x38ed1739': 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
      '0x7ff36ab5': 'swapExactETHForTokens(uint256,address[],address,uint256)',
      '0x1f00ca74': 'getAmountsOut(uint256,address[])',
      '0xb6b55f25': 'deposit(uint256)',
      '0x2e1a7d4d': 'withdraw(uint256)',
      '0xe2bbb158': 'stake(uint256)',
      '0x69328dec': 'withdraw(address,uint256,address)',
      '0xb7a16251': 'mint(address,uint256)',
      '0x40c10f19': 'mint(address,uint256)', 
      '0x440a5e20': 'addLiquidity(...)'   
    };
    
    return knownFunctions[signature] || `Unknown (${signature})`;
  }

  async getContractsByType(): Promise<{ [type: string]: number }> {
    const contracts = await this.discoverActiveContracts(5);
    const typeStats: { [type: string]: number } = {};
    
    contracts.forEach(contract => {
      typeStats[contract.contractType] = (typeStats[contract.contractType] || 0) + 1;
    });
    
    return typeStats;
  }

  async getNewDeployments(hoursBack: number = 24): Promise<ContractInfo[]> {
    this.logger.info(`Finding new contract deployments in last ${hoursBack} hours...`);
    
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const deployments: ContractInfo[] = [];
      
      // Estimate blocks to check (assuming ~10ms block time = 6000 blocks/minute)
      const blocksToCheck = Math.min(100, hoursBack * 60 * 100); // Conservative estimate
      
      for (let i = 0; i < blocksToCheck; i += 10) { // Sample every 10th block
        const block = await this.provider.getBlock(currentBlock - i);
        if (!block) continue;
        
        for (const txHash of block.transactions.slice(0, 10)) {
          try {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            if (receipt && receipt.contractAddress) {
              const tx = await this.provider.getTransaction(txHash);
              if (tx) {
                const contractInfo: ContractInfo = {
                  address: receipt.contractAddress.toLowerCase(),
                  creator: tx.from.toLowerCase(),
                  creationHash: tx.hash,
                  creationBlock: receipt.blockNumber,
                  contractType: await this.identifyContractType(tx, receipt),
                  firstSeen: new Date(block.timestamp * 1000),
                  lastActivity: new Date(block.timestamp * 1000),
                  totalInteractions: 1,
                  uniqueCallers: new Set([tx.from.toLowerCase()]),
                  functionSignatures: new Map(),
                  gasUsed: Number(receipt.gasUsed),
                  isVerified: false
                };
                
                deployments.push(contractInfo);
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        if (i > 0 && i % 30 === 0) await this.delay(500); // 500ms delay every 30 blocks
      }
      
      this.logger.info(`Found ${deployments.length} new deployments`);
      return deployments.sort((a, b) => b.creationBlock - a.creationBlock);
      
    } catch (error) {
      this.logger.error('Error finding new deployments:', error);
      return [];
    }
  }
}