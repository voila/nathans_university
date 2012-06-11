var lookup = function (env, v) {
    if (!(env.hasOwnProperty('bindings')))
        throw new Error(v + " not found");
    if (env.bindings.hasOwnProperty(v))
        return env.bindings[v];
    return lookup(env.outer, v);
};
var update = function (env, v, val) {
    if (env.bindings.hasOwnProperty(v)) {
        env.bindings[v] = val;
    } else {
        update(env.outer, v, val);
    }
};
var thunk = function (f) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return { tag: "thunk", func: f, args: args };
};
var thunkValue = function (x) {
    return { tag: "value", val: x };
};
var evalExpr = function(expr, env, cont) {
    if(typeof expr === 'number') {
        return thunk(cont, expr);
    }
    if (typeof expr === 'string') {
        return thunk(cont, lookup(env, expr));
    }
    switch(expr[0]) {
        case '+':
            console.log("+",expr[1],expr[2]);
            return thunk(
                evalExpr, expr[1], env,
                function(v1) {
                    return thunk(
                        evalExpr, expr[2], env,
                        function(v2) {
                            return thunk(cont, v1 + v2);
                        }
                    );
                }
            );
        case 'set!':
            console.log("set!",expr[1], expr[2]);
            return thunk(
                evalExpr, expr[2], env, 
                function(v) {
                    update(env, expr[1], v);
                    return thunk(cont, 0);
                }
            );
        default:
            throw new Error("Unknown form");
    }
};
var stepStart = function (expr, env) {
    return { 
        data: evalExpr(expr, env, thunkValue),
        done: false
    };
};
var step = function (state) {
    if (state.data.tag === "value") {
        state.done = true;
        state.data = state.data.val;
    } else if (state.data.tag === "thunk") {
        state.data = state.data.func.apply(
            null, state.data.args);
    } else {
        throw new Error("Bad thunk");
    }
};

var evalTwo = function (expr0, expr1, env) {
    var state1 = stepStart(expr0, env);
    var state2 = stepStart(expr1, env);
    while(!(state1.done && state2.done)) {
        if(!state1.done) step(state1);
        if(!state2.done) step(state2);
    }    
};

var assert_eq = function(x,y){
    console.log("----------------------------------------------------");
    console.log(x);
    console.log(y);
}
var env = { bindings: { x: 3, y: 4 }, outer: null };

//evalTwo(['set!', 'x', 7], ['set!', 'y', 10], env);
//assert_eq(env, { bindings: { x: 7, y: 10 }, outer: null },'x=7 and y=10');

evalTwo(['set!', 'x', ['+', 1, 1]], ['set!', 'y', 11], env);
assert_eq(env, { bindings: { x: 2, y: 11 }, outer: null },
    'x=1+1 and y=11');
/*
evalTwo(['set!', 'x', 13], ['set!', 'y', ['+', 2, 3]], env);
assert_eq(env, { bindings: { x: 13, y: 5 }, outer: null },
    'x=13 and y=2+3');
evalTwo(['set!', 'x', 15], ['set!', 'x', ['+', 10, 2]], env);
assert_eq(env, { bindings: { x: 12, y: 5 }, outer: null },
    'x=15 versus x=10+2');
evalTwo(['set!', 'x', ['+', 3, 5]], ['set!', 'x', 17], env);
assert_eq(env, { bindings: { x: 8, y: 5 }, outer: null },
    'x=3+5 versus x=17');
*/