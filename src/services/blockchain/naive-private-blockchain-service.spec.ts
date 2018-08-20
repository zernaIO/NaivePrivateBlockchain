import 'reflect-metadata';
import {expect} from 'chai';
import 'mocha';
import {NaivePrivateBlockchainService} from './naive-private-blockchain-service';
import {Block, BlockchainRepository, BlockchainService, BlockStats, HashingService, LogService} from '../../types/core';
import {SHA256HashingService} from '../hashing/SHA256HashingService';
import * as sinon from 'sinon';
import * as _ from 'lodash';

describe('NaivePrivateBlockchainService', () => {

    const validBlocks = [
        { hash: '10af472ab3803eb984c4effd85188a9749076c8815df0c72711ef522b2ac9bd0',
            height: 7,
            body: 6,
            time: 1534780445,
            previousBlockHash: '190d4809f95500cdb093be14fa935b72f4378ed5d13dd60b39e4dc601469bea8' },
        { hash: 'dd4f0a5aa9005ea6e9cfc4a0fe319e349c44d6b3c59cbcf045eb598f1d0f4ba3',
            height: 8,
            body: 7,
            time: 1534780445,
            previousBlockHash: '10af472ab3803eb984c4effd85188a9749076c8815df0c72711ef522b2ac9bd0' },
        { hash: '81739b334c6a86977d98dd06ca6ff5fb35867ddb43999f2bd44a03a1408cf348',
            height: 9,
            body: 8,
            time: 1534780445,
            previousBlockHash: 'dd4f0a5aa9005ea6e9cfc4a0fe319e349c44d6b3c59cbcf045eb598f1d0f4ba3' },
    ];

    const buildBlock = (key: number) => {
        const block: Block = new Block(key);
        block.time = 420;
        block.height = key;
        block.previousBlockHash = 'PrevHash';
        block.hash = HashingService.getHash(JSON.stringify(block));
        return block;
    };

    const promiseMock = (toReturn: any) => {
        return new Promise((resolve) => {
            resolve(toReturn);
        });
    };

    let LogMock: LogService;
    let BlockchainRepositoryMock: BlockchainRepository;
    let spy: any;
    const HashingService: HashingService = new SHA256HashingService();
    let _NaivePrivateBlockchainService: BlockchainService;

    beforeEach(() => {
        LogMock = {
            log: (payload: any) => { return promiseMock(payload); },
            warn: (payload: any) => { return promiseMock(payload); },
            error: (payload: any) => { return promiseMock(payload); }
        };

        BlockchainRepositoryMock = {
            add: (key: number, value: any) => { return promiseMock(undefined); },
            get: (key: number) => { return promiseMock(buildBlock(key)); },
            getKeys: () => { return promiseMock([0]); }
        };

        _NaivePrivateBlockchainService = new NaivePrivateBlockchainService(BlockchainRepositoryMock, HashingService, LogMock);
    });

    afterEach(() => {
       spy = undefined;
    });

    describe('addBlock',  () => {
        it('should create block meta data and call DI Services', async() => {
            spy = sinon.stub(BlockchainRepositoryMock, 'add').returns(promiseMock(undefined));
            await _NaivePrivateBlockchainService.addBlock(new Block('TEST'));
            expect(spy.calledOnce).to.be.true;
            const created_index = spy.getCall(0).args[0];
            const created_block: Block = spy.getCall(0).args[1];
            expect(created_index).to.eq(1);
            expect(_.isString(created_block.hash)).to.be.ok;
            expect(created_block.height).to.eql(1);
            expect(created_block.body).to.eql('TEST');
            // hash of buildBlock(0) which should be genesis block
            expect(created_block.previousBlockHash).to.eql('4ae2a46275b1d10b73c8be6628ea6bb2b1a9e48b0ccf4ed8059d936ae2546110');
        });
    });

    describe('generateGenesis', () => {
        it('should generate genesis block information and store it to DB DI', async () => {
            spy = sinon.stub(BlockchainRepositoryMock, 'add').returns(promiseMock(undefined));
            await _NaivePrivateBlockchainService.generateGenesis();
            expect(spy.calledOnce).to.be.true;
            const created_index = spy.getCall(0).args[0];
            const created_block: Block = spy.getCall(0).args[1];
            expect(created_index).to.eq(0);
            expect(_.isString(created_block.hash)).to.be.ok;
            expect(created_block.height).to.eql(0);
            expect(created_block.body).to.eql('GENESIS');
            expect(created_block.previousBlockHash).to.eql('');
        });
    });

    describe('getBlockStats', () => {
        it('should generate valid block stats', async () => {
            spy = sinon.stub(BlockchainRepositoryMock, 'getKeys').returns(promiseMock([0, 1, 3, 4]));
            const result: BlockStats = await _NaivePrivateBlockchainService.getBlockStats();
            expect(result.blocks).to.eql(4);
        });
    });

    describe('validateChain', () => {
        it('should return a true if chain is valid', async () => {
            spy = sinon.stub(BlockchainRepositoryMock, 'getKeys').returns(promiseMock([0, 1, 2]))
            BlockchainRepositoryMock.get = (key: number) => { return promiseMock(_.clone(validBlocks[key])); };
            const result = await _NaivePrivateBlockchainService.validateChain();
            expect(result).to.be.ok;
        });

        it('should return false if chain is not valid', async () => {
            spy = sinon.stub(BlockchainRepositoryMock, 'getKeys').returns(promiseMock([0, 1, 2]));
            BlockchainRepositoryMock.get = (key: number) => { return promiseMock(_.clone(validBlocks[key])); };
            _NaivePrivateBlockchainService = new NaivePrivateBlockchainService(BlockchainRepositoryMock, {getHash: () => 'NOT_VALID_HASH' }, LogMock);
            const result = await _NaivePrivateBlockchainService.validateChain();
            expect(result).to.be.not.ok;
        });
    });
});