'use strict';

var parser = (function() {
  var _err;
  var _lex;
  var _curr;
  var _ast;
  var _precedence = [
    { lx: ['equality', 'not_equal'] },
    { lx: ['strict_less', 'less_equal', 'greater_equal', 'strict_great'] },
    { lx: ['add', 'minus'] },
    { lx: ['multiply', 'divide', 'modulo'] },
    { lx: 'power', func: ruleUnary }
  ];

  function parser(lexemes) {
    var tmp;

    _err = false;
    _lex = lexemes;
    shift();
    _ast = { key: 'block', children: [] };
    while ((tmp = ruleBlock())) {
      _ast.children.push(tmp);
    }
    if (_curr)
      error('Unexpected symbol at the end of expression: ' + _curr.key);
    return _err ? null : _ast;
  }

  function ruleBlock() {
    var node;
    if (accept('left_curly')) {
      shift();
      node = { key: 'block', children: [] };
      do {
        node.children.push(ruleBlock());
      } while (!accept('right_curly') && !_err);
      shift();
    } else
      node =
        ruleIf() ||
        ruleWhile() ||
        ruleDoWhile() ||
        ruleFor() ||
        ruleInstruction();
    return node;
  }

  function ruleFor() {
    var node = false;
    var def = { key: 'number', val: 1 };

    if (accept('for')) {
      node = { key: _curr.key, children: [] };
      shift();
      if (!expect('left_round')) return false;
      shift();
      node.children.push(ruleAssign() || def);
      if (!expect('semi_colon')) return false;
      shift();
      node.children.push(ruleAssign() || def);
      if (!expect('semi_colon')) return false;
      shift();
      node.children.push(ruleAssign() || def);
      if (!expect('right_round')) return false;
      shift();
      node.children.push(ruleBlock());
    }
    return node;
  }

  function ruleDoWhile() {
    var node = false;

    if (accept('do')) {
      node = { key: _curr.key, children: [] };
      shift();
      node.children.push(ruleBlock());
      if (!expect('while') || !shift() || !expect('left_round') || !shift())
        return false;
      node.children.push(ruleAssign());
      if (
        !expect('right_round') ||
        !shift() ||
        !expect('semi_colon') ||
        !shift()
      )
        return false;
    }
    return node;
  }

  function ruleWhile() {
    var node = false;

    if (accept('while')) {
      node = { key: _curr.key, children: [] };
      shift();
      if (!expect('left_round')) return false;
      shift();
      node.children.push(ruleAssign());
      if (!expect('right_round')) return false;
      shift();
      node.children.push(ruleBlock());
    }
    return node;
  }

  function ruleIf() {
    var node = false;

    if (accept('if')) {
      node = { key: _curr.key, children: [] };
      shift();
      if (!expect('left_round')) return false;
      shift();
      node.children.push(ruleAssign());
      if (!expect('right_round')) return false;
      shift();
      node.children.push(ruleBlock());
      if (accept('else')) {
        shift();
        node.children.push(ruleBlock());
      }
    }
    return node;
  }


  function ruleInstruction() {
    var node = ruleAssign();
    if (!node || !expect('semi_colon')) return false;
    shift();
    return node;
  }

  function ruleAssign() {
    var parent;
    var node;
    var tmp;
    if (accept('id') && ['assign'].includes(_lex[0].key)) {
      node = { key: _lex[0].key, children: [] };
      node.children.push({ key: _curr.key, val: _curr.val });
      shift();
      shift();
      if (!(tmp = operatorPipeline(0))) return false;
      node.children.push(tmp);
    } else if (!(node = operatorPipeline(0))) return false;
    return node;
  }

  function operatorPipeline(id) {
    var state = _precedence[id];
    var node;
    var parent;
    var tmp;

    node = state.func ? state.func() : operatorPipeline(id + 1);
    while (accept(state.lx)) {
      parent = { key: _curr.key, children: [node] };
      shift();
      if (!(tmp = state.func ? state.func() : operatorPipeline(id + 1)))
        return false;
      parent.children.push(tmp);
      node = parent;
    }
    return node;
  }

  function ruleUnary() {
    var node;
    var tmp;

    if (accept('minus')) {
      node = { key: _curr.key, children: [] };
      node.children.push({ key: 'number', val: 0 });
      shift();
      if (!(tmp = ruleBase())) return false;
      node.children.push(tmp);
    } else if (accept(['increment', 'decrement'])) {
      node = { key: _curr.key, children: [] };
      shift();
      if (!expect('id')) return false;
      node.children.push({ key: _curr.key, val: _curr.val });
      shift();
    } else {
      if (accept('add')) shift();
      if (!(node = ruleBase())) return false;
    }
    return node;
  }

  function ruleBase() {
    var node = false;
    var tmp;

    if ((tmp = ruleFuncCall()) || (tmp = ruleFunc())) node = tmp;
    else if (accept('string')) {
      node = { key: _curr.key, val: _curr.val.substr(1, _curr.val.length - 2) };
      shift();
    } else if (accept('number')) {
      node = { key: _curr.key, val: parseFloat(_curr.val) };
      shift();
    } else if (accept('id')) {
      node = { key: _curr.key, val: _curr.val };
      shift();
    } else if (accept('left_round')) {
      shift();
      node = ruleAssign();
      if (expect('right_round')) shift();
    } else return false;
    return node;
  }

  function ruleFunc() {
    var node = false;
    var args = { key: 'args', children: [] };

    if (accept('func')) {
      node = { key: _curr.key, children: [] };
      shift();
      if (!expect('left_round') || !shift()) return false;
      if (expect('id')) {
        args.children.push({ key: _curr.key, val: _curr.val });
        shift();
        while (accept('comma') && shift()) {
          if (!expect('id')) return false;
          args.children.push({ key: _curr.key, val: _curr.val });
          shift();
        }
      }
      node.children.push(args);
      if (!expect('right_round') || !shift()) return false;
      node.children.push(ruleBlock());
    }
    return node;
  }

  function ruleFuncCall() {
    var node = null;
    var tmp;

    if (accept('id') && _lex[0].key == 'left_round') {
      node = {
        key: 'func_call',
        children: [{ key: _curr.key, val: _curr.val }]
      };
      shift();
      shift();
      if ((tmp = ruleAssign())) {
        node.children.push(tmp);
        while (accept('comma') && shift()) {
          if (!(tmp = ruleAssign())) return false;
          node.children.push(tmp);
        }
      }
      if (!expect('right_round') || !shift()) return false;
    }
    return node;
  }

  function accept(lx) {
    if (!_curr) return false;
    if (typeof lx == 'string') {
      if (_curr.key == lx) return true;
    } else {
      for (var i in lx) {
        if (_curr.key == lx[i]) return true;
      }
    }
    return false;
  }

  function expect(lx) {
    if (accept(lx)) return true;
    if (_curr)
      error('Expected symbol "' + lx + '" but got "' + _curr.key + '"');
    else error('Expected symbol "' + lx + '"');
    return false;
  }

  function shift() {
    do _curr = _lex.shift();
    while (_curr && _curr.key == 'new_line');
    return true;
  }

  function error(msg) {
    if (_curr) console.error('Error at line ' + _curr.line + ': ' + msg);
    else console.error('Error: ' + msg);
    _err = true;
  }

  return parser;
})();

module.exports = parser;
