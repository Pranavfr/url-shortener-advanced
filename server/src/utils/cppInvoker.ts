import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import fs from 'fs';

class CppInvoker {
    private process: ChildProcessWithoutNullStreams | null = null;
    private executablePath: string;

    constructor() {
        // Adjust for Windows (.exe) vs Linux
        const isWindows = process.platform === 'win32';
        const binName = isWindows ? 'hash_gen.exe' : 'hash_gen';
        this.executablePath = path.resolve(__dirname, '../../..', 'cpp', binName);
    }

    private startProcess() {
        if (!fs.existsSync(this.executablePath)) {
            throw new Error(`C++ executable not found at ${this.executablePath}. Please compile it.`);
        }

        this.process = spawn(this.executablePath);
        
        this.process.on('error', (err) => {
            console.error('Failed to start C++ process:', err);
        });
        
        this.process.on('exit', (code) => {
            console.log(`C++ process exited with code ${code}`);
            this.process = null;
        });
    }

    public async generateUnique(url: string): Promise<string> {
        return this.sendCommand(`GENERATE ${url}`);
    }
    
    public async insertExisting(url: string, shortCode: string): Promise<void> {
        await this.sendCommand(`INSERT ${url} ${shortCode}`);
    }

    private sendCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.process) {
                this.startProcess();
            }

            if (!this.process) {
                return reject(new Error("Process could not be started"));
            }

            const onData = (data: Buffer) => {
                const response = data.toString().trim();
                // Clean up listeners
                this.process?.stdout.removeListener('data', onData);
                this.process?.stderr.removeListener('data', onError);
                resolve(response);
            };

            const onError = (data: Buffer) => {
                this.process?.stdout.removeListener('data', onData);
                this.process?.stderr.removeListener('data', onError);
                reject(new Error(data.toString()));
            };

            this.process.stdout.once('data', onData);
            this.process.stderr.once('data', onError);

            this.process.stdin.write(command + '\n');
        });
    }

    public stopProcess() {
        if (this.process) {
            this.process.stdin.write('EXIT\n');
            this.process.kill();
            this.process = null;
        }
    }
}

export const cppInvoker = new CppInvoker();
