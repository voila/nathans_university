if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalScheem = require('../scheem').evalScheem;
    var parse = PEG.buildParser(fs.readFileSync(
        'scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var assert = chai.assert;
    var expect = chai.expect;
    var parse = SCHEEM.parse;
    
}

suite('if', function() {
    test('then clause', function() {
        assert.deepEqual(
            evalScheem(['if', ['=','x',5], ['*','x',3], '#f'], {x:5}),
            15
        );
    });

    test('else clause', function() {
        assert.deepEqual(
            evalScheem(['if', ['=','x',3], ['*','x',3], '#f'], {x:5, '#f': false}),
            false
        );
    });
    // wrong number of arguments
    expect(function () {
          evalScheem(['if', ['=','x',3], ['*','x',3]], {x:5});
    }).to.throw();
});

suite('predicates', function() {
    test('=', function() {
        assert.deepEqual(
            evalScheem(['=', 5, 'x'], {x:5}),
            '#t'
        );
    });
    test('<', function() {
        assert.deepEqual(
            evalScheem(['<', 3, 'x'], {x:5}),
            '#t'
        );
    });
    // wrong number of arguments
    expect(function () {
          evalScheem(['begin'], {});
    }).to.throw();
});


suite('set!', function() {
    test('existing binding', function() {
        assert.deepEqual(
            evalScheem(['set!', 'x', 3], {x:5}),
            0
        );
    });
    // unbound variable
    expect(function () {
          evalScheem(['set!', 'x', 3], {});
    }).to.throw();
});

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
});

suite('arithmetic', function() {
    // unbound variable
    expect(function () {
          evalScheem(['+', 'x', 2], {});
    }).to.throw();

    // wrong number of arguments
    expect(function () {
          evalScheem(['+',], {});
    }).to.throw();
    expect(function () {
          evalScheem(['+', 3], {});
    }).to.throw();

    // division by zero
    expect(function () {
          evalScheem(['/', 5, 0], {});
    }).to.throw();

    test('literal numbers', function() {
        assert.deepEqual(
            evalScheem(['+', 3, 3], {}),
            6
        );
    });
    test('a bound variable', function() {
        assert.deepEqual(
            evalScheem(['+', 3, 'x'], {x: 3}),
            6
        );
    });
/*
    test('a floating point', function() {
        assert.equal(
            evalScheem(['+', 3.14, 3.0], {}),
            6.14
        );
    });
*/

});