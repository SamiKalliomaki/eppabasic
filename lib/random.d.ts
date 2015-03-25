declare module 'random' {
    interface engine {}
    interface mt19937 extends engine {
        (): number;
        seed(value: number): void;
        sedWithArray(value: number[]): void;
        autoSeed(): void;
        discard(count: number): void;
    }
    interface distribution<T> {
        (engine: engine): T;
    }


    export module engines {
        export function mt19937(): mt19937;
    }

    export function integer(min: number, max: number): distribution<number>;
    export function real(min: number, max: number, inclusive: boolean): distribution<number>;
    export function bool(): distribution<boolean>;
    export function bool(percentage: number): distribution<boolean>;
    export function bool(numerator: number, dominator: number): distribution<boolean>;
    export function pick<T>(engine: engine, arr: T[], begin?: number, end?: number): () => T;
    export function picker<T>(arr: T[], begin?: number, end?: number): distribution<T>;
    export function shuffle(engine: engine, arr: any[]): void;
    export function sample(engine: engine, population: any[], sampleSize: number): any[];
    export function die(sideCount): distribution<number>;
    export function dice(sidCount, dieCount): distribution<number>;
    export function uuid4(engine: engine): string;
    export function string(): (engine: engine, length: number) => string;
    export function string(pool: string[]): (engine: engine, length: number) => string;
    export function hex(ucase?: boolean): (engine: engine, length: number) => string;
    export function date(start: Date, end: Date): distribution<Date>;
}
