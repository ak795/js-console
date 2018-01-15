let interpreter = (function() {
  let ans = '';
  let scoped = [];
  let _this;
  let _super;
  let _funcs = {
    add: function(c) {
      return evaluateExpression(c[0]) + evaluateExpression(c[1]);
    },
    minus: function(c) {
      return evaluateExpression(c[0]) - evaluateExpression(c[1]);
    },
    power: function(c) {
      return Math.pow(evaluateExpression(c[0]), evaluateExpression(c[1]));
    },
    multiply: function(c) {
      return evaluateExpression(c[0]) * evaluateExpression(c[1]);
    },
    divide: function(c) {
      return evaluateExpression(c[0]) / evaluateExpression(c[1]);
    },
    modulo: function(c) {
      return evaluateExpression(c[0]) % evaluateExpression(c[1]);
    },
    increment: function(c) {
      return setValue(c[0].val, getValue(c[0].val) + 1);
    },
    decrement: function(c) {
      return setValue(c[0].val, getValue(c[0].val) - 1);
    },
    equality: function(c) {
      return evaluateExpression(c[0]) == evaluateExpression(c[1]);
    },
    not_equal: function(c) {
      return evaluateExpression(c[0]) != evaluateExpression(c[1]);
    },
    strict_less: function(c) {
      return evaluateExpression(c[0]) < evaluateExpression(c[1]);
    },
    less_equal: function(c) {
      return evaluateExpression(c[0]) <= evaluateExpression(c[1]);
    },
    strict_great: function(c) {
      return evaluateExpression(c[0]) > evaluateExpression(c[1]);
    },
    greater_equal: function(c) {
      return evaluateExpression(c[0]) >= evaluateExpression(c[1]);
    },
    assign: function(c) {
      return setValue(c[0].val, evaluateExpression(c[1]));
    },

    block: function(c) {
      let val;
      pushScope();
      for (let i in c) val = evaluateExpression(c[i]);
      popScope();
      return val;
    },
    func_call: function(c) {
      let f = getValue(c[0].val);
      let val;

      if (
        !f ||
        (typeof f != 'function' &&
          (typeof f != 'object' || !f.key || f.key != 'func'))
      ) {
        console.error('Runtime warning: ' + c[0].val + ' is not a function');
        return null;
      }

      if (typeof f == 'object') {
        let args = f.children[0].children;
        if (c.length - 1 < args.length)
          console.warn(
            'Runtime warning: too few arguments provided to function ' +
              c[0].val
          );
        else if (c.length - 1 > args.length)
          console.warn(
            'Runtime warning: too many arguments provided to function ' +
              c[0].val
          );
        pushScope();
        for (let i = 0; i < args.length; i++)
          _this[args[i].val] =
            i + 1 < c.length ? evaluateExpression(c[i + 1]) : null;
        val = evaluateExpression(f.children[1]);
        popScope();
      } else {
        let args = [];
        if (c.length - 1 < f.length)
          console.warn(
            'Runtime warning: too few arguments provided to function ' +
              c[0].val
          );
        else if (c.length - 1 > f.length)
          console.warn(
            'Runtime warning: too many arguments provided to function ' +
              c[0].val
          );
        for (let i = 0; i < f.length; i++)
          args.push(i + 1 < c.length ? evaluateExpression(c[i + 1]) : null);
        val = f.apply(null, args);
      }
      return val;
    },

    if: function(c) {
      if (evaluateExpression(c[0])) return evaluateExpression(c[1]);
      return c.length == 2 ? null : evaluateExpression(c[2]);
    },
    while: function(c) {
      let val = null;
      pushScope();
      while (evaluateExpression(c[0])) val = evaluateExpression(c[1]);
      popScope();
      return val;
    },
    do: function(c) {
      let val = null;
      pushScope();
      do val = evaluateExpression(c[0]);
      while (evaluateExpression(c[1]));
      popScope();
      return val;
    },
    for: function(c) {
      let val = null;
      pushScope();
      for (
        evaluateExpression(c[0]);
        evaluateExpression(c[1]);
        evaluateExpression(c[2])
      )
        val = evaluateExpression(c[3]);
      popScope();
      return val;
    }
  };

  function interpreter(ast) {
    if (!ast) return null;
    ans = '';
    pushScope();
    defineBuiltins();
    let returnVal = '';
    if (evaluateExpression(ast) !== undefined) {
      returnVal = evaluateExpression(ast);
    }
    if (ans) {
      returnVal += ans;
    }
    return returnVal;
  }

  function defineBuiltins() {
    _this.cos = Math.cos;
    _this.acos = Math.acos;
    _this.sin = Math.sin;
    _this.asin = Math.asin;
    _this.tan = Math.tan;
    _this.atan = Math.atan;
    _this.atan2 = Math.atan2;
    _this.sqrt = Math.sqrt;
    _this.cbrt = Math.cbrt;
    _this.exp = Math.exp;
    _this.log = Math.log;
    _this.log10 = Math.log10;
    _this.log2 = Math.log2;
    _this.random = Math.random;
    _this.PI = Math.PI;
    _this.E = Math.E;
    _this.cout = x => {
      ans += x ;
      ans += '\n';
    };
    _this.cerr = x => {
      console.error(x);
    };
  }

  function evaluateExpression(ast) {
    if (['number', 'string'].indexOf(ast.key) != -1) return ast.val;
    if (ast.key == 'id') return getValue(ast.val);
    if (ast.key == 'func') return ast;
    if (_funcs[ast.key]) return _funcs[ast.key](ast.children);
    return null;
  }

  function setValue(key, val) {
    for (let i = scoped.length - 1; i >= 0; i--) {
      if (scoped[i][key] != undefined) {
        scoped[i][key] = val;
        return val;
      }
    }
    _this[key] = val;
    return val;
  }

  function getValue(key) {
    for (let i = scoped.length - 1; i >= 0; i--) {
      if (scoped[i][key] != undefined) return scoped[i][key];
    }
    return undefined;
  }

  function pushScope() {
    scoped.push({});
    _this = scoped[scoped.length - 1];
    _super = scoped[scoped.length - 2];
  }

  function popScope() {
    scoped.pop();
    _this = _super;
    _super = scoped[scoped.length - 2];
  }

  return interpreter;
})();

module.exports = interpreter;
