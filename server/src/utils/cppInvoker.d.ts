declare class CppInvoker {
    private process;
    private executablePath;
    constructor();
    private startProcess;
    generateUnique(url: string): Promise<string>;
    insertExisting(url: string, shortCode: string): Promise<void>;
    private sendCommand;
    stopProcess(): void;
}
export declare const cppInvoker: CppInvoker;
export {};
//# sourceMappingURL=cppInvoker.d.ts.map