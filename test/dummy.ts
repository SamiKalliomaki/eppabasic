/// <reference path="../lib/jasmine" />

export class DummySuite {
    constructor() {}

    TrueExpectationsTest() {
        expect(true).toBe(true);
    }

    NotExpectationsTest() {
        expect(false).not.toBe(true);
        expect(true).not.toBe(false);
    }

    StringExpectationsTest() {
        expect('').toBe('');
        expect('abba').toBe('abba');
        expect('true').not.toBe(true);
    }
}
