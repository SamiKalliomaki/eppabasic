/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');

/**
 * Basic string functions.
 */
class StringModule implements Module {
    /**
     * Runtime the module is assosiated with.
     */
    private _runtime: Runtime;
    /**
     * List of functions in this module.
     */
    private _functions: Map<string, Function>;

    constructor(runtime: Runtime) {
        this._runtime = runtime;
        this._functions = new Map<string, Function>();


        this._functions.set('Function Chr(Integer) As String', (val: number): number => {
            return 0;
        });
        this._functions.set('Function InStr(String,String) As Integer', (heystackPtr: number, needlePtr: number): number => {
            return 0;
        });
        this._functions.set('Function InStr(Integer,String,String) As Integer', (start: number, heystackPtr: number, needlePtr: number): number => {
            return 0;
        });
        this._functions.set('Function LCase(String) As String', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function Left(String,Integer) As String', (strPtr: number, len: number): number => {
            return 0;
        });
        this._functions.set('Function Len(String) As Integer', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function Match(String,String) As Boolean', (strPtr: number, regexPtr: number): boolean => {
            return false;
        });
        this._functions.set('Function Mid(String,Integer) As String', (strPtr: number, start: number): number => {
            return 0;
        });
        this._functions.set('Function Mid(String,Integer,Integer) As String', (strPtr: number, start: number, len: number): number => {
            return 0;
        });
        this._functions.set('Function Repeat(String,Integer) As String', (strPtr: number, count: number): number => {
            return 0;
        });
        this._functions.set('Function Replace(String,String,String) As String', (strPtr: number, substrPtr: number, newSubstrPtr: number): number => {
            return 0;
        });
        this._functions.set('Function Reverse(String) As String', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function Right(String,Integer) As String', (strPtr: number, len: numbe): number => {
            return 0;
        });
        this._functions.set('Function Rot13(String) As String', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function Trim(String) As String', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function UCase(String) As String', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function Val(String) As Double', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function Str(Integer) As String', (val: number): number => {
            return 0;
        });
        this._functions.set('Function Str(Number) As String', (strPtr: number): number => {
            return 0;
        });
    }

    /**
     * Gets list of functions defined in this module;
     * @returns Map mapping function signatures to implementations.
     */
    getFunctions(): Map<string, Function> {
        return this._functions;
    }
}

export = StringModule;
