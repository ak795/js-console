<template>
  <div id="app" class="container" v-cloak>
    <div class="row">
      <textarea id="code" v-model="code"></textarea>
      <div>
        <button @click="load" :disabled="code == ''">Load</button>
        <button @click="history" :disabled="code == ''">History</button>
        <button @click="run" :disabled="code == ''">Run</button>
        <button @click="reset">Reset</button>
      </div>
    </div>
    <div :class="{ hidden : !active }">
      <h2>INPUT</h2>
      <div class="row source">
        <span>{{ code }}</span>
      </div>
      <h2>OUTPUT</h2>
      <div class="row source">
        <span> {{ result }} </span>
      </div>
      <div v-if="ok">
        <h2> LAST ENTERED LINES </h2>
        <div class="row source">
          <span> {{ storedItems }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import utils from 'util';


import lexer from './compiler/lexer';
import parser from './compiler/parser';
import interpreter from './compiler/interpreter';

export default {
  name: 'app',
  data() {
    return {
      code: '',
      consoleItems: 'ConsoleItems',
      storedItems: '',
      outLexemes: [],
      result: '',
      outParseTree: '',
      ok: false,
      active: false,
      err: false,
    }
  },
  methods: {
    load() {
      this.active = true;
      localStorage.setItem(this.consoleItems, this.code);
    },
    history() {
      this.ok = true;
      this.storedItems = localStorage.getItem(this.consoleItems);
    },
    run() {
      this.okToRun = true;
      if (this.code) {
        this.outLexemes = lexer(this.code);
        console.log(`Lexemes: ${this.outLexemes}`);
        let ast = parser(this.outLexemes);
        console.log(`AST TreeL: ${utils.inspect(ast, false, null)}`);
        console.log(`result: ${interpreter(ast)}`)
        this.result = interpreter(ast);
      }
    },
    reset() {
      this.active = false;
      localStorage.clear();
      this.code = '';
      this.storedItems = '';
      this.outLexemes = [];
      this.result = '';
    },
    input() {

    },
    output() {

    }
  }
}
</script>

<style lang="scss">
[v-cloak] {
  display: none;
}

#app,
#app textarea {
  font-size: 12px;
  font-family: 'Courier New';
}

#app.container {
  width: 500px;
  margin: 20px auto;
}

#app.row {
  margin-bottom: 20px;
}

#app textarea {
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
  height: 50px;
  margin-bottom: 5px;
}

#app h2 {
  font-size: 14px;
  border-bottom: 1px solid #666;
  color: #666;
  padding: 0 0 4px 0;
  letter-spacing: 0.05em;
}

#app .source span {
  padding: 0.2px;
  margin-right: 5px;
  color: #bbb;
  display: inline-block;
  cursor: pointer;
  border-bottom: 4px solid transparent;
}

#app .source span.current {
  font-weight: bold;
  padding: 0.2px;
  color: #666;
  display: inline-block;
  cursor: pointer;
  border-bottom: 4px solid #ccc;
}

#app>.hidden {
  display: none;
}

#app textarea:disabled {
  background: #eee;
}
</style>
