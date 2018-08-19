import {Block, BlockchainRepository, BlockchainService, BlockStats, HashingService, LogService} from '../../types/core';
import {inject, injectable} from 'inversify';
import {DI} from '../../constants/di';
import {SystemError} from '../../constants/error';
import {Warnings} from '../../constants/warnings';

@injectable()
export class NaivePrivateBlockchainService implements BlockchainService {

    private levelDbRepository: BlockchainRepository;
    private logService: LogService;
    private hashingService: HashingService;

    constructor(@inject(DI.LevelDbRepository) levelDbRepository: BlockchainRepository,
                @inject(DI.HashingService) hashingService: HashingService,
                @inject(DI.LogService) logService: LogService) {
        this.levelDbRepository = levelDbRepository;
        this.hashingService = hashingService;
        this.logService = logService;
    }

    async addBlock(block: Block) {
        try {
            block.height = await this.getBlockHeight();
            this.enrichWithTimestamp(block);
            const latest_block: Block = await this.getLatestBlock();
            block.previousBlockHash = latest_block.hash;
            block.hash = this.hashingService.getHash(JSON.stringify(block));
            await this.levelDbRepository.add(block.height, block);
        } catch (e) {
            throw new Error(e);
        }

    }

    private enrichWithTimestamp(block: Block): void {
        const time = new Date().getTime().toString().slice(0, -3);
        block.time = parseInt(time);
    }

    async ensureGenesisBlock(): Promise<any> {
        try {
            await this.levelDbRepository.get('0');
        } catch (e) {
            throw new Error(SystemError.NPBE1);
        }
    }

    async generateGenesis(): Promise<any> {
        const genesis_block: Block = new Block('GENESIS');
        this.enrichWithTimestamp(genesis_block);
        genesis_block.height = 0;
        genesis_block.previousBlockHash = '';
        genesis_block.hash = this.hashingService.getHash(JSON.stringify(genesis_block));
        return this.levelDbRepository.add(genesis_block.height, genesis_block);
    }


    async getBlockHeight(): Promise<number> {
        const keys = await this.levelDbRepository.getKeys();
        return keys.length;
    }

    async getBlock(key: number): Promise<Block> {
        return this.levelDbRepository.get(key);
    }

    async getBlockStats(): Promise<BlockStats> {
        const height = await this.getBlockHeight();
        return {
            blocks: height
        };
    }

    async getLatestBlock(): Promise<Block> {
        const keys = await this.levelDbRepository.getKeys();
        if (keys && keys.length > 0) {
            return this.getBlock(keys[keys.length - 1]);
        } else {
            throw new Error(SystemError.NPBE3);
        }
    }

    async validateBlock(height: number): Promise<boolean> {
        const block = await this.getBlock(height);
        const hash = block.hash;
        block.hash = '';
        const block_hash = this.hashingService.getHash(JSON.stringify(block));
        if (block_hash === hash) {
            return true;
        } else {
            this.logService.warn(`${Warnings.NPBW4} Block #${height} - invalid hash: ${block.hash} <> ${block_hash}`);
            return false;
        }
    }

    async validateChain(): Promise<boolean> {
        const keys = await this.levelDbRepository.getKeys();
        const errorBlocks: number[] = [];
        let itr = 0;
        while (itr < keys.length) {
            const isValid = await this.validateBlock(itr);
            if (!isValid) {
                errorBlocks.push(itr);
            }
            itr++;
        }
        return errorBlocks.length === 0;
    }

}