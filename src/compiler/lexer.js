let lexeme_list = [
    {
      key: 'if',
      value: 'if(?![a-zA-Z0-9_])'
    },
    {
      key: 'else',
      value: 'else(?![a-zA-Z0-9_])'
    },
    {
      key: 'while',
      value: 'while(?![a-zA-Z0-9_])'
    },
    {
      key: 'do',
      value: 'do(?![a-zA-Z0-9_])'
    },
    {
      key: 'for',
      value: 'for(?![a-zA-Z0-9_])'
    },
    {
      key: 'func',
      value: 'function(?![a-zA-Z0-9_])'
    },
    {
      key: 'var',
      value: 'var(?![a-zA-Z0-9_])'
    },
    {
      key: 'return',
      value: 'return(?![a-zA-Z0-9_])'
    },
    {
      key: 'id',
      value: '[a-zA-Z_][a-zA-Z0-9_]*'
    },
    {
      key: 'number',
      value: '[0-9]+(\\.[0-9]*)?'
    },
    {
      key: 'string',
      value: '"(\\\\"|[^"])*"|' + "'(\\\\'|[^'])*'"
    },
    {
      key: 'left_round',
      value: '\\('
    },
    {
      key: 'right_round',
      value: '\\)'
    },
    {
      key: 'left_curly',
      value: '\\{'
    },
    {
      key: 'right_curly',
      value: '\\}'
    },
    {
      key: 'left_bracket',
      value: '\\['
    },
    {
      key: 'right_bracket',
      value: '\\]'
    },
    {
      key: 'semi_colon',
      value: ';'
    },
    {
      key: 'colon',
      value: ':'
    },
    {
      key: 'comma',
      value: ','
    },
    {
      key: 'dot',
      value: '\\.'
    },
    {
      key: 'equality',
      value: '=='
    },
    {
      key: 'not_equal',
      value: '!='
    },
    {
      key: 'less_equal',
      value: '<='
    },
    {
      key: 'greater_equal',
      value: '>='
    },
    {
      key: 'strict_less',
      value: '<'
    },
    {
      key: 'strict_great',
      value: '>'
    },
    {
      key: 'equality',
      value: '=='
    },
    {
      key: 'not_equal',
      value: '!='
    },
    {
      key: 'less_equal',
      value: '<='
    },
    {
      key: 'greater_equal',
      value: '>='
    },
    {
      key: 'strict_less',
      value: '<'
    },
    {
      key: 'strict_great',
      value: '>'
    },
  
    // Operators
    {
      key: 'assign',
      value: '='
    },
    {
      key: 'increment',
      value: '\\+\\+'
    },
    {
      key: 'decrement',
      value: '--'
    },
    {
      key: 'power',
      value: '\\*\\*'
    },
    {
      key: 'add',
      value: '\\+'
    },
    {
      key: 'minus',
      value: '-'
    },
    {
      key: 'multiply',
      value: '\\*'
    },
    {
      key: 'divide',
      value: '/'
    },
    {
      key: 'modulo',
      value: '%'
    }
  ];
  
  function lexer(data){
    let strippedLexemes = [];
    let line = 0;
  
    while (data) {
      let matches = null;
      if ((matches = data.match(/^[ \t\v\f]+/))) {
      } else if ((matches = data.match(/^[\r\n]+/))) {
        strippedLexemes.push({ key: 'new_line', line: line });
        line += matches[0].length;
      }
      for (let i = 0; !matches && i < lexeme_list.length; i++) {
        if ((matches = data.match(RegExp('^(' + lexeme_list[i].value + ')'))))
          strippedLexemes.push({ key: lexeme_list[i].key, val: matches[0], line: line });
      }
      if (matches) data = data.substring(matches[0].length);
      else if ((matches = data.match(/^\S+/))) {
        console.error('Unknown lexeme: ' + matches[0]);
        data = data.substring(matches[0].length);
      } else break;
    }
    return strippedLexemes;
  }
  
  module.exports = lexer;
  