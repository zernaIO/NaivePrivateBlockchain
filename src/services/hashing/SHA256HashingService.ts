import {HashingService} from '../../types/core';
import {injectable} from 'inversify';

@injectable()
export class SHA256HashingService implements HashingService {

    private SHA256 = require('crypto-js/sha256');

    getHash(value: string): string {
        return this.SHA256(value).toString();
    }
}