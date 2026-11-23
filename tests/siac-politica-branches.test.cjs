"use strict";
const assert=require("node:assert/strict");
const {validate,ALLOWED}=require("../scripts/siac-validar-branches.cjs");
assert.equal(validate(ALLOWED).ok,true);
assert.equal(validate([...ALLOWED,"fix/novo"]).ok,false,"quarto branch deve falhar");
assert.deepEqual(validate([...ALLOWED,"fix/novo"]).extras,["fix/novo"]);
assert.equal(validate(["main","feat/siac-experiencia-didatica"]).ok,false,"branch oficial ausente deve falhar");
assert.deepEqual(validate(["main","feat/siac-experiencia-didatica"]).missing,
 ["feat/siac-motor-cromatografico"]);
assert.equal(validate(["main","main","feat/siac-motor-cromatografico"]).ok,false);
assert.equal(validate(ALLOWED.map(name=>({name}))).ok,true);
console.log("SIAC — regras de três branches verificadas.");
