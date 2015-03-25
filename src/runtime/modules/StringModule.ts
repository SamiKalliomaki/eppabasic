/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');
import XRegExp = require('xregexp');
import esrever = require('esrever');

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
            return util.ebstring.toEB(String.fromCharCode(val), this._runtime);
        });
        this._functions.set('Function InStr(String,String) As Integer', (heystackPtr: number, needlePtr: number): number => {
            var heystack = util.ebstring.fromEB(heystackPtr, this._runtime);
            var needle = util.ebstring.fromEB(needlePtr, this._runtime);
            return heystack.indexOf(needle) + 1;
        });
        this._functions.set('Function InStr(Integer,String,String) As Integer', (start: number, heystackPtr: number, needlePtr: number): number => {
            var heystack = util.ebstring.fromEB(heystackPtr, this._runtime);
            var needle = util.ebstring.fromEB(needlePtr, this._runtime);
            return heystack.indexOf(needle, start - 1) + 1;
        });
        this._functions.set('Function LCase(String) As String', (strPtr: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            str = str.toLowerCase();
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Left(String,Integer) As String', (strPtr: number, len: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            len = Math.max(Math.min(len, str.length), 0);
            str = str.substr(0, len);
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Len(String) As Integer', (strPtr: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            return str.length;
        });
        this._functions.set('Function Match(String,String) As Boolean', (strPtr: number, regexPtr: number): boolean => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            var regex = XRegExp('^' + util.ebstring.fromEB(regexPtr, this._runtime) + '$');
            return regex.test(str);
        });
        this._functions.set('Function Mid(String,Integer) As String', (strPtr: number, start: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            str = str.substr(start - 1);
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Mid(String,Integer,Integer) As String', (strPtr: number, start: number, len: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            str = str.substr(start - 1, len);
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Repeat(String,Integer) As String', (strPtr: number, count: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            var buf = [];
            for (var i = 0; i < count; i++)
                buf.push(str);
            str = buf.join('');
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Replace(String,String,String) As String', (strPtr: number, substrPtr: number, newSubstrPtr: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            var substr = util.ebstring.fromEB(substrPtr, this._runtime);
            var newSubstr = util.ebstring.fromEB(newSubstrPtr, this._runtime);
            var buf = [];
            while (true) {
                var pos = str.indexOf(substr);
                if (pos === -1)
                    break;
                buf.push(str.substr(0, pos));
                buf.push(newSubstr);
                str = str.substr(pos + substr.length);
            }
            buf.push(str);
            str = buf.join('');
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Reverse(String) As String', (strPtr: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            str = esrever.reverse(str);
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Right(String,Integer) As String', (strPtr: number, len: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            len = Math.max(Math.min(len, str.length), 0);
            str = str.substr(-len);
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Rot13(String) As String', (strPtr: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            str = str.replace(/[a-zA-Z]/g, function (c: string): string {
                var c2 = c.charCodeAt(0) + 13;
                return String.fromCharCode((c <= "Z" ? 90 : 122) >= c2 ? c2 : c2 - 26);
            });
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Trim(String) As String', (strPtr: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            str = str.trim();
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function UCase(String) As String', (strPtr: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            str = str.toUpperCase();
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Val(String) As Double', (strPtr: number): number => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            return parseFloat(str);
        });
        this._functions.set('Function Str(Integer) As String', (val: number): number => {
            return util.ebstring.toEB('' + (val | 0), this._runtime);
        });
        this._functions.set('Function Str(Number) As String', (val: number): number => {
            var pow = Math.pow(10, 8);
            val = Math.round(val * pow) / pow;
            return util.ebstring.toEB('' + (+val), this._runtime);
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
