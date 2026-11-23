"use strict";
// Namespace primário do SIAC. O antigo nome é somente ponte temporária para
// módulos estruturais ainda em migração; ambos apontam para o MESMO objeto.
window.SIAC = Object.assign(window.SIAC || {}, {
  version: "0.2.0-dev.0", MAX_TUBES: 10, CAPACITY_ML: 5
});
window.SIAB = window.SIAC;
