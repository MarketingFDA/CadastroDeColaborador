require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json({ limit: '256kb' }));

const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigins.length ? corsOrigins : '*' }));

// Rótulos exibidos no email, na mesma ordem da ficha em papel.
const FIELD_LABELS = [
  { section: 'Dados Pessoais' },
  ['nomeCompleto', 'Nome completo'],
  ['nomeSocial', 'Nome pelo qual gosta de ser chamado(a)'],
  ['dataNascimento', 'Data de nascimento'],
  ['escolaridade', 'Escolaridade'],
  ['rg', 'RG'],
  ['rgEmissor', 'Órgão emissor'],
  ['rgDataExpedicao', 'Data de expedição'],
  ['cpf', 'CPF'],
  ['pis', 'PIS'],
  ['sexo', 'Sexo'],
  ['estadoCivil', 'Estado civil'],
  ['telefone', 'Telefone'],
  ['emailPessoal', 'E-mail pessoal'],
  ['endereco', 'Endereço'],
  ['bairro', 'Bairro'],
  ['cep', 'CEP'],
  ['cidadeEstado', 'Cidade/Estado onde reside'],
  { section: 'Dados Bancários' },
  ['contaBB', 'Possui conta no Banco do Brasil?'],
  ['tipoConta', 'Tipo de conta'],
  ['agencia', 'Agência'],
  ['conta', 'Conta'],
  { section: 'Contato de Emergência' },
  ['emergenciaNome', 'Nome'],
  ['emergenciaParentesco', 'Grau de parentesco'],
  ['emergenciaTelefone', 'Telefone'],
  { section: 'Sobre Você' },
  ['sobreVoce', 'Conte um pouco sobre você'],
  ['hobbies', 'Hobbies favoritos'],
  ['hobbiesOutro', 'Outro hobby'],
  ['fumante', 'Fumante'],
  ['timeFutebol', 'Time de futebol'],
  ['estiloMusical', 'Estilo musical favorito'],
  ['comidaPreferida', 'Comida preferida'],
  ['filmeSerie', 'Filme ou série favorita'],
  ['talento', 'Habilidade ou talento pouco conhecido'],
  ['necessidadeEspecifica', 'Possui necessidade específica/adaptação?'],
  ['necessidadeDescricao', 'Descrição da necessidade'],
  { section: 'Reconhecimento e Comunicação' },
  ['reconhecimento', 'Como prefere receber reconhecimento'],
  ['participaAcoes', 'Gosta de participar de ações internas?'],
  ['interesseCampanhas', 'Interesse em campanhas/eventos/gravações'],
  { section: 'Aniversário e Comemorações' },
  ['presenteIdeal', 'Presente ideal de aniversário'],
  ['presenteOutro', 'Outro presente'],
  ['tipoChocolate', 'Tipo de chocolate preferido'],
  ['chocolateOutro', 'Outro chocolate'],
  ['restricaoAlimentar', 'Possui restrição alimentar?'],
  ['restricoes', 'Quais restrições'],
  ['alimentoEvita', 'Alimento que evita'],
  ['bebidaPreferida', 'Bebida preferida em eventos'],
  ['bebidaOutro', 'Outra bebida'],
  { section: 'Ações Internas (opcional)' },
  ['tamanhoCamiseta', 'Tamanho de camiseta/uniforme'],
  ['lojaValePresente', 'Loja/tipo de vale-presente preferido'],
  ['brindePreferencia', 'Preferência de brinde corporativo'],
  ['brindeOutro', 'Outro brinde'],
];

function formatValue(value) {
  if (value === undefined || value === null || value === '') return '<span style="color:#9aa0b4;">—</span>';
  if (Array.isArray(value)) return escapeHtml(value.join(', '));
  return escapeHtml(String(value));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function buildEmailHtml(data) {
  const rows = FIELD_LABELS.map((entry) => {
    if (entry.section) {
      return `<tr><td colspan="2" style="padding:18px 0 8px; font-size:13px; font-weight:700; color:#6366f1; text-transform:uppercase; letter-spacing:0.04em; border-bottom:2px solid #6366f1;">${escapeHtml(entry.section)}</td></tr>`;
    }
    const [key, label] = entry;
    return `<tr>
      <td style="padding:8px 12px 8px 0; font-size:13px; color:#5b6178; width:42%; vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 0; font-size:14px; color:#1f2333; vertical-align:top;">${formatValue(data[key])}</td>
    </tr>`;
  }).join('');

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif; max-width:680px; margin:0 auto; padding:24px;">
    <h2 style="color:#1f2333; margin-bottom:4px;">Nova ficha de cadastro recebida</h2>
    <p style="color:#5b6178; font-size:13px; margin-top:0;">Enviada em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (horário de Brasília)</p>
    <table style="width:100%; border-collapse:collapse;">${rows}</table>
  </div>`;
}

function buildEmailText(data) {
  return FIELD_LABELS.map((entry) => {
    if (entry.section) return `\n=== ${entry.section} ===`;
    const [key, label] = entry;
    const value = Array.isArray(data[key]) ? data[key].join(', ') : (data[key] || '—');
    return `${label}: ${value}`;
  }).join('\n');
}

let cachedTransporter = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error('GMAIL_USER/GMAIL_APP_PASSWORD não configurados no backend');
  }
  if (cachedTransporter) return cachedTransporter;

  // Host/porta explícitos em vez do atalho service:'gmail' — mais fácil de
  // diagnosticar, e com timeouts curtos pra nunca deixar a requisição travada
  // pra sempre (sem timeout, uma SMTP travada faz o Express nunca responder).
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass: pass.replace(/\s+/g, '') },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return cachedTransporter;
}

app.post('/submit', async (req, res) => {
  const data = req.body || {};

  if (!data.nomeCompleto || !data.cpf || !data.telefone || !data.emailPessoal) {
    return res.status(400).json({ message: 'Preencha ao menos nome, CPF, telefone e e-mail.' });
  }

  const recipients = (process.env.RECRUTAMENTO_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    console.error('RECRUTAMENTO_EMAILS não configurado');
    return res.status(500).json({ message: 'Configuração de destinatários ausente no servidor.' });
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Ficha de Cadastro" <${process.env.GMAIL_USER}>`,
      to: recipients.join(', '),
      replyTo: data.emailPessoal,
      subject: `Nova ficha de cadastro — ${data.nomeCompleto}`,
      text: buildEmailText(data),
      html: buildEmailHtml(data),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Falha ao enviar email da ficha de cadastro:', err.message);
    res.status(502).json({ message: 'Não foi possível enviar agora. Tente novamente em instantes.' });
  }
});

app.get('/', (_req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Cadastro de Colaborador backend rodando na porta ${port}`));
