class Register {
    /**
     * Name of the register.
     */
    private _name: string;

    /**
     * Converts the register to a string for debug purposes.
     */
    toString(): string {
        return this._name;
    }
}

export = Register;
