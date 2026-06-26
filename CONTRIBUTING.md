# Contribuindo

## Fluxo de desenvolvimento

1. Crie um branch a partir de `main`: `git checkout -b feat/minha-mudanca`.
2. Faça as alterações em `components/SGEPApp.jsx` (ou nos arquivos de configuração).
3. Garanta que o build passa: `npm run build`.
4. Abra um Pull Request descrevendo a mudança.

## Convenções

- A aplicação reside num único componente cliente. Ao adicionar funcionalidade, mantenha o estado em `App` e passe via props.
- Toda mutação de entregas deve passar por `commitTasks` para preservar o histórico de undo/redo.
- Evite `localStorage`, `sessionStorage`, `window.confirm` e APIs não garantidas no ambiente de execução. Para observadores como `ResizeObserver`, sempre proteja com `typeof ... !== 'undefined'`.
- Antes de commitar, rode `npm run build` — o compilador SWC do Next.js é mais estrito que o Babel e detecta JSX desbalanceado que outras checagens podem tolerar.

## Validação rápida de JSX

```bash
npm run build   # falha cedo em qualquer erro de sintaxe/estrutura JSX
```
