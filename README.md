# Nicole Life

Nicole Life é um site estático de rotina pessoal com visual elegante, claro e feminino, feito para acompanhar tarefas, planejamento semanal, sonhos, hábitos, foco e diário.

## Como abrir

1. Abra a pasta `Nicole-Life`.
2. Dê dois cliques em `index.html`.
3. Use normalmente no navegador.

Não é necessário backend, banco de dados ou servidor. Os dados ficam salvos no `LocalStorage` do navegador.

## Estrutura

```text
Nicole-Life/
  index.html
  css/
    style.css
  js/
    app.js
    charts.js
    storage.js
  assets/
  README.md
```

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos da pasta `Nicole-Life`.
3. Acesse `Settings` no repositório.
4. Entre em `Pages`.
5. Selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Salve e aguarde o link de publicação.

## Como personalizar

- Frases e textos principais: edite `index.html`.
- Cores, espaçamentos e estilo visual: edite as variáveis no início de `css/style.css`.
- Tarefas, hábitos e metas iniciais: edite `js/storage.js`.
- Regras de interação: edite `js/app.js`.
- Gráficos: edite `js/charts.js`.

## Recursos

- Dashboard com saudação para Nicole.
- Data, dia da semana e horário em tempo real.
- Tarefas com adicionar, editar, excluir e concluir.
- Planejamento semanal com progresso, total concluído e dia mais produtivo.
- Objetivos com prazo e barra de progresso.
- Rastreador de hábitos com calendário e sequência.
- Pomodoro com sessões realizadas e tempo focado.
- Diário com salvamento automático.
- Gráficos com Chart.js.
- Layout responsivo e pronto para GitHub Pages.
