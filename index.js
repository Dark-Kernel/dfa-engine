"use strict";
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// DFA Class Definition
class DFA {
  constructor(alphabet, delta, initial, final) {
    this.alphabet = alphabet.slice(0);
    this.states = Object.getOwnPropertyNames(delta).sort();
    this.delta = delta;
    this.initial = initial;
    this.final = final.slice(0);
    this.isMinimized = false;
  }

  accepts(str) {
    let state = this.initial;
    for (let i = 0; i < str.length; ++i) {
      state = this.delta[state][str[i]];
    }
    return this.final.indexOf(state) !== -1;
  }

  test(str) {
    return this.accepts(str);
  }

  toNFA() {
    let newDelta = {};
    for (let state of this.states) {
      newDelta[state] = {};
      for (let sym of this.alphabet) {
        newDelta[state][sym] = [this.delta[state][sym]];
      }
    }
    return new NFA(this.alphabet, newDelta, [this.initial], this.final);
  }

  // Other DFA methods...
}

// NFA Class Definition
class NFA {
  constructor(alphabet, delta, initial, final) {
    this.alphabet = alphabet.slice(0);
    this.states = Object.getOwnPropertyNames(delta).sort();
    this.delta = delta;
    this.initial = initial.slice(0);
    this.final = final.slice(0);
  }

  epsilonClosure(states) {
    let out = deduped(states);
    let processing = out.slice(0);
    while (processing.length > 0) {
      let cur = processing.pop();
      let next = this.delta[cur][''];
      if (next === undefined) continue;
      for (let state of next) {
        if (!processing.includes(state) && !out.includes(state)) {
          processing.push(state);
          out.push(state);
        }
      }
    }
    return out;
  }

  accepts(str) {
    let states = this.epsilonClosure(this.initial);
    for (let sym of str) {
      states = this.step(states, sym);
    }
    return this.final.some(f => states.includes(f));
  }

  // Other NFA methods...
}

// Utility Functions
function deduped(l) {
  return Array.from(new Set(l)).sort();
}

app.post('/api/dfa/accepts', (req, res) => {
  const { alphabet, delta, initial, final, string } = req.body;
  const dfa = new DFA(alphabet, delta, initial, final);
  const result = dfa.accepts(string);
  res.json({ accepts: result });
});

app.post('/api/nfa/accepts', (req, res) => {
  const { alphabet, delta, initial, final, string } = req.body;
  const dfa = new DFA(alphabet, delta, initial, final);
  const result = dfa.accepts(string);
  res.json({ accepts: result });
});

app.get('/api', (req, res) => {
   res.send('Yes I am working'); 
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

