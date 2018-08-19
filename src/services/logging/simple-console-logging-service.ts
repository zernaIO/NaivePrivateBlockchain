import {LogService} from '../../types/core';
import {injectable} from 'inversify';

@injectable()
export class SimpleConsoleLoggingService implements LogService {

    async log(message: string): Promise<any> {
        console.log(this.generateConsoleMessage(message, 'INFO'));
    }

    async warn(message: string): Promise<any> {
        console.log(this.generateConsoleMessage(message, 'WARN'));
    }

    async error(message: string): Promise<any> {
        console.log(this.generateConsoleMessage(message, 'ERROR'));
    }

    private generateConsoleMessage(message: string, type: string) {
        return `[${new Date().getTime().toString().slice(0, -3)}] - ${type}: ${message}`;
    }

}