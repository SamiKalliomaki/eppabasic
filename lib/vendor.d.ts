// This is a dummy file referencing libraries which are in irregular places.
// Hope that we can get rid of this file asap.
// See: https://github.com/TypeStrong/grunt-ts/issues/216#issuecomment-83946550

/// <reference path="jquery" />
/// <reference path="es6-promise" />
/// <reference path="i18n" />
/// <reference path="requirejs" />
/// <reference path="EventEmitter" />
/// <reference path='xregexp'/>
/// <reference path='esrever'/>
/// <reference path='random'/>
/// <reference path='jasmine'/>

// Shims
interface Array<T> {
    find(predicate: (value: T, index: number, obj: Array<T>) => boolean, thisArg?: any): T;
}

interface Function {
    name: string;
}


interface IteratorResult<T> {
    done: boolean;
    value?: T;
}

interface Iterator<T> {
    //[Symbol.iterator](): Iterator<T>;
    next(): IteratorResult<T>;
}

interface Iterable<T> {
  //[Symbol.iterator](): Iterator<T>;
}

interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    entries(): Iterator<[T, T]>;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    keys(): Iterator<T>;
    size: number;
    values(): Iterator<T>;
    // [Symbol.iterator]():Iterator<T>;
    // [Symbol.toStringTag]: string;
}

interface SetConstructor {
    new <T>(): Set<T>;
    new <T>(iterable: Iterable<T>): Set<T>;
    prototype: Set<any>;
}
declare var Set: SetConstructor;

interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    entries(): Iterator<[K, V]>;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    keys(): Iterator<K>;
    set(key: K, value?: V): Map<K, V>;
    size: number;
    values(): Iterator<V>;
    // [Symbol.iterator]():Iterator<[K,V]>;
    // [Symbol.toStringTag]: string;
}

interface MapConstructor {
    new <K, V>(): Map<K, V>;
    new <K, V>(iterable: Iterable<[K, V]>): Map<K, V>;
    prototype: Map<any, any>;
}
declare var Map: MapConstructor;
