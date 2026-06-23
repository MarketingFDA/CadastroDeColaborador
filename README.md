# Cadastro de Colaborador

Ficha de cadastro web para novos colaboradores. Frontend estático (`docs/`) publicado via GitHub Pages; backend (`backend/`) recebe o formulário e envia por email para o RH.

## Estrutura

- `docs/` — formulário em HTML/CSS/JS puro, sem build step, publicado em `marketingfda.github.io/CadastroDeColaborador`. Multi-etapas (5 passos), design glassmorphism.
- `backend/` — serviço Express que recebe `POST /submit` e envia o conteúdo por email via Gmail SMTP (nodemailer). Deploy no Render (`render.yaml` na raiz).

## Configuração do backend (Render)

Variáveis de ambiente necessárias (`sync: false` no `render.yaml`, configurar manualmente no painel do Render):

- `GMAIL_USER` — endereço Gmail remetente (ex: `recrutamento.fradema@gmail.com`)
- `GMAIL_APP_PASSWORD` — Senha de App gerada em myaccount.google.com → Segurança → Verificação em duas etapas → Senhas de app
- `RECRUTAMENTO_EMAILS` — destinatários separados por vírgula
- `CORS_ORIGIN` — origem permitida (URL do GitHub Pages)

## Rodando localmente

```bash
cd backend
npm install
cp .env.example .env   # preencher GMAIL_APP_PASSWORD
npm start
```

Para testar o frontend contra o backend local, abra `docs/index.html` definindo antes:
```html
<script>window.__CADASTRO_API_BASE_URL__ = 'http://localhost:3000';</script>
```
