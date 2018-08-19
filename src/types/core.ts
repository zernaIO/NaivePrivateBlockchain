// Application Runner
export interface BlockchainRunner {
    runService(): Promise<any>;
}

// Blockchain Based
export class Block {
    hash: string;
    height: number;
    body: any;
    time: number;
    previousBlockHash: string;

    constructor(data: any){
        this.hash = "";
        this.height = 0;
        this.body = data;
        this.time = 0;
        this.previousBlockHash = "";
    }
}

export interface BlockStats {
    blocks: number;
}

export interface BlockchainService {
    addBlock(block: Block): Promise<any>;
    ensureGenesisBlock(): Promise<any>;
    generateGenesis(): Promise<any>;
    getBlockHeight(): Promise<any>;
    getBlock(key: number): Promise<any>;
    getBlockStats(): Promise<BlockStats>;
    validateBlock(height: number): Promise<boolean>;
    validateChain(): Promise<boolean>;
}

export interface BlockchainRepository {
    add(key: string | number, value: any): Promise<any>;
    get(key: string | number): Promise<any>;
    getKeys(): Promise<any>;
}

// Hashing
export interface HashingService {
    getHash(value: string): string;
}

// utility
export interface LogService {
    log(message: string): Promise<any>;
    warn(message: string): Promise<any>;
    error(message: string): Promise<any>;
}