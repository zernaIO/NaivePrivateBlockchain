import 'reflect-metadata';
require('dotenv').config();

/* ===== Dependency Injection with inversify =================
|  Learn more: https://github.com/inversify/InversifyJS      |
|  =========================================================*/
import {Container} from "inversify";


import {DI} from "./constants/di";
import {
    Block, BlockchainRepository, BlockchainRunner, BlockchainService, HashingService,
    LogService
} from './types/core';
import {SimpleConsoleLoggingService} from './services/logging/simple-console-logging-service';
import {NaivePrivateBlockchainService} from './services/blockchain/naive-private-blockchain-service';
import {LeveldbLocalRepository} from './repositories/local/leveldb-local-repository';
import {Service} from './constants/services';
import * as _ from 'lodash';
import {Warnings} from './constants/warnings';
import {SystemError} from './constants/error';
import {Fallback} from './constants/fallback';
import {SHA256HashingService} from './services/hashing/SHA256HashingService';

// init IOC outside of runner. This could be placed in seperate file
const ioc = new Container({ defaultScope: 'Singleton' });
ioc.bind<LogService>(DI.LogService).to(SimpleConsoleLoggingService);
ioc.bind<BlockchainService>(DI.BlockchainService).to(NaivePrivateBlockchainService);
ioc.bind<BlockchainRepository>(DI.LevelDbRepository).to(LeveldbLocalRepository);
ioc.bind<HashingService>(DI.HashingService).to(SHA256HashingService);


export class NaivePrivateBlockchainRunner implements BlockchainRunner {

    private logService: LogService;
    private blockchainService: BlockchainService;
    private service: string;

    constructor() {
        this.logService = ioc.get(DI.LogService);
        this.blockchainService = ioc.get(DI.BlockchainService);
        this.ensureService();
    }

    private ensureService() {
        if (_.isNil(process.env.SERVICE)) {
            this.logService.warn(Warnings.NPBW2);
            this.service = Service.CHAIN_VERIFY;
        } else {
            this.service = process.env.SERVICE;
        }
    }

    private getBlocksToCreate(): number {
        let number_of_blocks;
        if (_.isNil(process.env.BLOCKS_TO_CREATE)) {
            this.logService.warn(Warnings.NPBW3);
            number_of_blocks = Fallback.NUMBER_OF_BLOCKS;
        } else {
            number_of_blocks = process.env.BLOCKS_TO_CREATE;
        }
        return <number>number_of_blocks;
    }

    async runService() {
        this.logService.log(`Run Service: ${this.service}`);
        try {
            switch (this.service) {
                case Service.GENESIS_GENERATE : {
                    await this.blockchainService.generateGenesis();
                    break;
                }
                case Service.CHAIN_VERIFY : {
                    await this.blockchainService.ensureGenesisBlock();
                    const isValid =  await this.blockchainService.validateChain();
                    if (isValid) {
                        this.logService.log('Chain is valid.');
                    } else {
                        this.logService.error(SystemError.NPBE4);
                    }
                    break;
                }
                case Service.CREATE_BLOCKS : {
                    await this.blockchainService.ensureGenesisBlock();
                    const blocks_to_create = this.getBlocksToCreate();
                    let itr = 0;
                    while (itr < blocks_to_create) {
                        await this.blockchainService.addBlock(new Block(itr));
                        itr++;
                    }
                    break;
                }
                case Service.BLOCK_STATS : {
                    const stats = await this.blockchainService.getBlockStats();
                    this.logService.log(JSON.stringify(stats));
                    break;
                }
                default: {
                    this.logService.error(SystemError.NPBE2);
                }
            }
        } catch (e) {
            this.logService.error(e);
        }
    }


}
const logService: LogService = <LogService>ioc.get(DI.LogService);
new NaivePrivateBlockchainRunner().runService().then(() => logService.log('DONE'));