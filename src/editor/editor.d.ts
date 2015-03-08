﻿import Runtime = require('runtime/Runtime');

declare class Editor {
    getCode(): string;
    setcode(code: string): void;
    setRuntime(runtime: Runtime): void;
    runCode(): void;
    run(compiled: string): void;
    showHelp(): void;
    showErrors(errors: Error[]): void;
    openRuntime(): void;
    closeRuntime(): void;
    runtimeReady(func?: () => void): void;
}

export = Editor;