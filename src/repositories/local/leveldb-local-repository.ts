import {inject, injectable} from "inversify";
import * as _ from "lodash";
import {BlockchainRepository, LogService} from '../../types/core';
import {DI} from '../../constants/di';
import {Warnings} from '../../constants/warnings';
import {Fallback} from '../../constants/fallback';

@injectable()
export class LeveldbLocalRepository implements BlockchainRepository {

    private logService: LogService;
    private level = require('level');
    private db: any;

    constructor(@inject(DI.LogService) logService: LogService) {
        this.logService = logService;
        this.ensureDb();
    }

    private ensureDb(): void {
        let db_path: string;
        if (_.isNil(process.env.DB)) {
            db_path = Fallback.DB_PATH;
            this.logService.warn(Warnings.NPBW1);
        } else {
            db_path = <string> process.env.DB;
        }
        this.db = this.level(db_path, {
            valueEncoding: 'json'
        });
    }

    async add(key: number, value: string): Promise<any> {
        return this.db.put(key, value);
    }

    async get(key: number): Promise<any> {
        return this.db.get(key);
    }

    async getKeys(): Promise<any> {
        return new Promise<any>((resolve: Function, reject: Function) => {
            const result: number[] = [];
            this.db.createKeyStream()
                .on('data',  (data: any) => {
                    result.push(parseFloat(data));
                })
                .on('end',  () =>  resolve(result))
                .on('error',  (err: any) => {
                    reject(err);
                });
        });
    }

}