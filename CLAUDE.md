# Cadastro de Colaborador — notas do projeto

- Frontend (`docs/`) é estático, sem build step, publicado via GitHub Pages na pasta `/docs` da branch `main` — mesmo padrão do repo `MarketingFDA/DisparadorOficialFDA`.
- Backend (`backend/`) é um Express minúsculo (não NestJS — não vale a complexidade pra um único endpoint `POST /submit`). Deploy no Render (`render.yaml` na raiz, Blueprint), plano free.
- Envio de email via `nodemailer` + Gmail SMTP (`service: 'gmail'`), autenticando com `GMAIL_USER` + `GMAIL_APP_PASSWORD` (Senha de App, não a senha normal da conta). Conta usada: `recrutamento.fradema@gmail.com`. Destinatários em `RECRUTAMENTO_EMAILS` (lista separada por vírgula).
- O formulário propositalmente não cita o nome da empresa em nenhum texto visível na UI — só nos emails de destino (`@fradema.com.br`), que não aparecem pro usuário final.
- Frontend e backend são publicados/deployados de forma independente (GitHub Pages não depende do Render e vice-versa) — alterar só o formulário não exige redeploy do backend.
- Nunca expor `GMAIL_APP_PASSWORD` no frontend nem commitar em `.env` — só como env var no Render (`sync: false` no `render.yaml`, preenchido manualmente no painel).
- Validação client-side é só UX (campos obrigatórios por passo); o backend valida de novo (`nomeCompleto`, `cpf`, `telefone`, `emailPessoal`) antes de enviar o email — não confiar só no JS do navegador.
