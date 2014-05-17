

function Atomicchecker(ast, functions) {
    this.ast = ast;
    this.functions = functions;
}

Atomicchecker.prototype = {
    /*
     * Checks types of the ast
     */
    check: function typecheck() {
        //this.visit(this.ast);
    }

}