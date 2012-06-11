var thunk = function (f, lst) {
    return { tag: "thunk", func: f, args: lst };
};

var thunkValue = function (x) {
    return { tag: "value", val: x };
};

var sumThunk = function (n, cont) {
    if (n <= 1) return thunk(cont, [1]);
    else {
        var new_cont = function (v) {
            return thunk(cont, [v + n]);
        };
        return thunk(sumThunk, [n - 1, new_cont]);
    }
};


var evalThunk = function (thk) {
    if (thk.tag === "value") {
        return thk.val;
    }
    if (thk.tag === "thunk") {
        var sub_expr = thk.func.apply(null, thk.args);
        return evalThunk(sub_expr);
    }
};


var bigSumEval = function (n) {
    // Your code here
    var thk = sumThunk (n, thunkValue); 
    return evalThunk(thk);
};


var trampoline = function (thk) {
    while (true) {
        if (thk.tag === "value") {
            return thk.val;
        }
        if (thk.tag === "thunk") {
            thk = thk.func.apply(null, thk.args);
        }
    }
};

var bigSum = function (n) {
    // Your code here
    var thk = sumThunk (n, thunkValue); 
    return trampoline(thk);
};


/*
getting the n-th element in a list, 
reversing a list, 
inserting into a binary search tree.
A function that recursively evaluates ASTs that contain numbers, additions, and multiplications.
*/



/* Fibonacci */
var fib = function(n){
    if(n<2) return n;
    else return fib(n-2) + fib(n-1);
}

var fibcps = function(n, k){
  if(n<2) return k(n);
  else
    return fibcps(n-1, function(x){
           return fibcps(n-2, function(y){
                  return k(x + y);
           });
    });
}

var id = function (x){ return x; }

var fibThunk = function (n, k){
  if(n<2) return thunk(k,[n]);
  else
    return thunk(fibThunk,[n-1, function(x){
           return thunk (fibThunk, [n-2, function(y){
                  return thunk(k,[x + y]);
           }]);
    }]);
}


for(var i=0; i<10; i++){
   console.log(trampoline(fibThunk(i, thunkValue)), fibcps(i, id), fib(i));
}



/* Count nodes in a binary tree */
var shrub = {
    data: 'b',
    left: {
        data: 'a',
        left: null,
        right: null
    },
    right: null
};



var count = function(tree) {
    if(tree === null)
        return 0;
    else 
        return 1 + count(tree.left) + count(tree.right);
};



var countcps = function(tree, k) {
    if(tree === null)
        return k(0);
    else 
        return countcps(tree.left, function(c1){
           return countcps(tree.right, function(c2){ 
                  return k(c1 + c2 + 1);
           });
        });
};

var countThunk = function(tree, k) {
    if(tree === null)
        return thunk(k,[0]);
    else 
        return thunk(countThunk, [tree.left, function(c1){
           return thunk(countThunk, [tree.right, function(c2){ 
                  return thunk(k,[c1 + c2 + 1]);
           }]);
        }]);
};



console.log(trampoline(countThunk(shrub, thunkValue)), countcps(shrub, id), count(shrub));



/* Reverse a list */

var reverse = function (lst){
    if(lst.length === 0)
        return [];
    else
        return reverse(lst.splice(1)).concat([lst[0]]);
}

var reversecps = function (lst, k){
    if(lst.length === 0)
        return k([]);
    else
        return reversecps(lst.splice(1), function(revlst){
            return k(revlst.concat([lst[0]]));
        });
}

var reverseThunk = function (lst, k){
    if(lst.length === 0)
        return thunk(k,[[]]);
    else
        return thunk(reverseThunk, [lst.splice(1), function(revlst){
            return thunk(k, [ revlst.concat([lst[0]]) ]);
        }]);
}


console.log(trampoline(reverseThunk([1,2,3,4,5,6,7,8,9], thunkValue))); 
console.log(reversecps([1,2,3,4,5,6,7,8,9], id));
console.log(reverse([1,2,3,4,5,6,7,8,9]));

var seq = function (n){
    var res = new Array (n);
    for (var i=0; i<n; i++)
        res[i] = i;
    return res;
}

console.log(trampoline(reverseThunk(seq(15000), thunkValue)).splice(0,10)); 
