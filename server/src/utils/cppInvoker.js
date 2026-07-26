"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cppInvoker = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class CppInvoker {
    process = null;
    executablePath;
    constructor() {
        // Adjust for Windows (.exe) vs Linux
        const isWindows = process.platform === 'win32';
        const binName = isWindows ? 'hash_gen.exe' : 'hash_gen';
        this.executablePath = path_1.default.resolve(__dirname, '../../..', 'cpp', binName);
    }
    startProcess() {
        if (!fs_1.default.existsSync(this.executablePath)) {
            throw new Error(`C++ executable not found at ${this.executablePath}. Please compile it.`);
        }
        this.process = (0, child_process_1.spawn)(this.executablePath);
        this.process.on('error', (err) => {
            console.error('Failed to start C++ process:', err);
        });
        this.process.on('exit', (code) => {
            console.log(`C++ process exited with code ${code}`);
            this.process = null;
        });
    }
    async generateUnique(url) {
        return this.sendCommand(`GENERATE ${url}`);
    }
    async insertExisting(url, shortCode) {
        await this.sendCommand(`INSERT ${url} ${shortCode}`);
    }
    sendCommand(command) {
        return new Promise((resolve, reject) => {
            if (!this.process) {
                this.startProcess();
            }
            if (!this.process) {
                return reject(new Error("Process could not be started"));
            }
            const onData = (data) => {
                const response = data.toString().trim();
                // Clean up listeners
                this.process?.stdout.removeListener('data', onData);
                this.process?.stderr.removeListener('data', onError);
                resolve(response);
            };
            const onError = (data) => {
                this.process?.stdout.removeListener('data', onData);
                this.process?.stderr.removeListener('data', onError);
                reject(new Error(data.toString()));
            };
            this.process.stdout.once('data', onData);
            this.process.stderr.once('data', onError);
            this.process.stdin.write(command + '\n');
        });
    }
    stopProcess() {
        if (this.process) {
            this.process.stdin.write('EXIT\n');
            this.process.kill();
            this.process = null;
        }
    }
}
exports.cppInvoker = new CppInvoker();
//# sourceMappingURL=cppInvoker.js.map