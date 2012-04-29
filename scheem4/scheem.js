if (typeof module !== 'undefined') {
    // In Node load required modules
    var PEG = require('pegjs');
    var assert = require('assert');
    var fs = require('fs'); // for loading files

    // Read file contents
    var data = fs.readFileSync('scheem.peg', 'utf-8');
    // Create my parser
    var parse = PEG.buildParser(data).parse;
    var evalScheemString = function(str) {
        var expr = parse(str);
        return evalScheemString(expr, {});
    }
}

function checkArity(expr, n){
    if(expr.length !== n+1)
        throw ("wrong arity in expression: " +
              expr + " expected " + n);
}
function checkArityAtLeast(expr, n){
    if(expr.length - 1 < n)
        throw ("wrong arity in expression: " +
              expr + " expected " + n +'+');
}

function checkBound(id, env){
    if(env[id] === undefined)
        throw id + " is unbound";
}

function checkNumber(v){
    if(typeof v !== 'number')
        throw v + " is not a number";
} 

function checkNonZero(v){
    if(v === 0)
        throw "zero not allowed here";
} 

var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return env[expr];
    }
    // Look at head of list for operation
    switch (expr[0]) {

        // special forms
        case 'define':
            checkArity(expr, 2);
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;
        case 'set!':
            checkArity(expr, 2);
            checkBound(expr[1], env);
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;     
        case 'begin':
            checkArityAtLeast(expr, 1);
            for(var i=1, res=0; i<expr.length; i++){
               res = evalScheem(expr[i], env);
            }
            return res;
        case 'quote':
            checkArity(expr, 1);
            return expr[1];
        case 'if':
            checkArity(expr, 3);
            var cond = evalScheem(expr[1], env);
            if(cond === '#f')
                return evalScheem(expr[3], env);
            else
                return evalScheem(expr[2], env); 

        // primitives, put this in init_env 
        // arithmetic
        case '+':
            checkArity(expr, 2);
            checkNumber(evalScheem(expr[1], env));        
            checkNumber(evalScheem(expr[2], env));        
            return evalScheem(expr[1], env) +
                   evalScheem(expr[2], env);
        case '-':
            checkArity(expr, 2);
            checkNumber(evalScheem(expr[1], env));        
            checkNumber(evalScheem(expr[2], env));
            return evalScheem(expr[1], env) -
                   evalScheem(expr[2], env);
        case '*':
            checkArity(expr, 2);
            checkNumber(evalScheem(expr[1], env));        
            checkNumber(evalScheem(expr[2], env));
            return evalScheem(expr[1], env) *
                   evalScheem(expr[2], env);
        case '/':
            checkArity(expr, 2);
            checkNumber(evalScheem(expr[1], env));        
            checkNumber(evalScheem(expr[2], env));
            checkNonZero(evalScheem(expr[2], env));
            //check non null denominator
            return evalScheem(expr[1], env) /
                   evalScheem(expr[2], env);  

        // predicates   
        case '=':
            checkArity(expr, 2);
            var eq =
                (evalScheem(expr[1], env) ===
                 evalScheem(expr[2], env));
            if (eq) return '#t';
            return '#f';
        case '<':
            checkArity(expr, 2);
            var inf = 
                   evalScheem(expr[1], env) <
                   evalScheem(expr[2], env);
            return inf ? '#t' : '#f';
        // list operations
        case 'cons':
            checkArity(expr, 2);
            var car = evalScheem (expr[1], env);
            var cdr = evalScheem (expr[2], env);
            return [car].concat(cdr);
        case 'car':
            checkArity(expr, 1);
            return evalScheem(expr[1], env)[0];
        case 'cdr':
            checkArity(expr, 1);
            return evalScheem(expr[1], env).slice(1); 
    }
};








// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
}