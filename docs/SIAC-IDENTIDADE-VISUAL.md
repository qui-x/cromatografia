# SIAC — Identidade visual inicial

**Nome:** SIAC — Simulador Interativo de Análise Cromatográfica.
**Título:** A Identidade das Cores Ocultas.

## Escopo fechado desta etapa
1. Ícone vetorial oficial (SVG) e derivados PNG PWA de 192, 512 e 180 px, incluindo máscara segura.
2. Paleta sólida para temas claro/escuro.
3. Abertura ilustrativa de cromatografia em papel mantendo o mecanismo de pular e desativar a animação do SIAB.

## Cores
- Azul-petróleo: `#0B5472` — marca e botões primários
- Verde-azulado: `#2E9B8F` — técnica, destaques e camadas
- Laranja: `#D96C1F` — terceira banda e ênfase
- Creme: `#F4E9D8` — fundo claro, papel e superfície
- Grafite: `#1F2D3D` — texto e contornos
- Ciano complementar: `#16839A` — primeira banda

Os tokens de tema escuro/alto contraste servem para legibilidade, sem reintroduzir gradientes roxos.

## Compatibilidade
- A iconografia de navegação do SIAB continua inalterada em `js/ui/icons.js`.
- O namespace `window.SIAB` é preservado nesta etapa para evitar quebrar o código de origem.
- A abertura é uma ilustração didática da separação, não uma simulação cromatográfica quantitativa.
- Conteúdo científico e controles ácido-base da base ainda aguardam migração para SIAC; esta etapa é apenas visual.
- A preferência de abertura usa `siac_abertura`, não interfere com `siab_abertura`.
- Manter opções de movimento reduzido, modo claro, modo escuro e alto contraste.

## Transparência do ícone
- `assets/siac-icone.svg`: símbolo oficial com fundo transparente para cabeçalho, marca, telas, abertura e favicon.
- `assets/siac-icone-app.svg`: variante com fundo sólido somente para instalação PWA; os PNGs de aplicativo são gerados desta variante.
- A transparência do símbolo não significa painéis translúcidos. Fundos e cartões do SIAC permanecem sólidos.

## Animação v4 — três béqueres independentes
- Cada câmara recebe sua própria placa e uma amostra A, B ou C, mantendo dimensões equivalentes.
- Frentes de solvente avançam continuamente com `requestAnimationFrame`; bandas nunca ultrapassam suas frentes.
- São 10 bandas, com perfis e intensidades diferentes, centro concentrado, borda de difusão e rastro residual.
- Degradês restritos a manchas, rastro, umidade e solvente; interface e fundo da marca sólidos.
- Trajetórias das bandas convergem graficamente para o símbolo SIAC na conclusão.
- Prévia independente: `previews/abertura-v4.html` — para repetição e avaliação sem abrir o SIAB legado.
- **Não** são valores científicos medidos: o motor cromatográfico permanece como trabalho independente.
