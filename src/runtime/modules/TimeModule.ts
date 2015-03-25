/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');

/**
 * Basic time functions.
 */
class TimeModule implements Module {
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

        this._functions.set('Function Timer() As Double', (): number => {
            return (new Date()).getTime() / 1000;
        });
        this._functions.set('Sub Wait(Double)', (seconds: number): void => {
            this._runtime.delay(seconds * 1000);
            this._runtime.program.breakExec();
        });
        this._functions.set('Function Year() As Integer', (): number => {
            return (new Date()).getFullYear();
        });
        this._functions.set('Function Month() As Integer', (): number => {
            return (new Date()).getMonth();
        });
        this._functions.set('Function Day() As Integer', (): number => {
            return (new Date()).getDate();
        });
        this._functions.set('Function Weekday() As Integer', (): number => {
            return (new Date()).getDay();
        });
        this._functions.set('Function Hour() As Integer', (): number => {
            return (new Date()).getHours();
        });
        this._functions.set('Function Minute() As Integer', (): number => {
            return (new Date()).getMinutes();
        });
        this._functions.set('Function Second() As Integer', (): number => {
            return (new Date()).getSeconds();
        });
        this._functions.set('Function MilliSecond() As Integer', (): number => {
            return (new Date()).getMilliseconds();
        });
        this._functions.set('Function Time() As String', (): number => {
            var date = new Date();
            var hours = '0' + date.getHours();
            var minutes = '0' + date.getMinutes();
            var seconds = '0' + date.getSeconds();
            var str = hours.substr(0, -2) + ':'
                    + minutes.substr(0, -2) + ':'
                    + seconds.substr(0, -2);
            return util.ebstring.toEB(str, this._runtime);
        });
        this._functions.set('Function Date() As String', (): number => {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var str = day + '.' + month + '.' + year;
            return util.ebstring.toEB(str, this._runtime);
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

export = TimeModule;
