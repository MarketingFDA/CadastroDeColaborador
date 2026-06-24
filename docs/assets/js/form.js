const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIYICOdOqFOLkqY0QgVMoemDI0_T7xSW0fxye26llOqvlm2N2b5iOHxbQa9h3rfvbYlw/exec';

const TOTAL_STEPS = 5;
const STEP_LABELS = {
  1: 'Dados Pessoais',
  2: 'Dados Bancários e Emergência',
  3: 'Sobre Você',
  4: 'Reconhecimento e Comemorações',
  5: 'Ações Internas',
};

let currentStep = 1;

const form = document.getElementById('cadastro-form');
const progressTrack = document.getElementById('progress-track');
const progressLabel = document.getElementById('progress-label');
const errorBanner = document.getElementById('error-banner');
const submitBtn = document.getElementById('submit-btn');

function buildProgressDots() {
  progressTrack.innerHTML = '';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement('div');
    dot.className = 'step-dot';
    dot.innerHTML = '<div class="fill"></div>';
    progressTrack.appendChild(dot);
  }
}

function updateProgress() {
  const dots = progressTrack.querySelectorAll('.step-dot .fill');
  dots.forEach((fill, idx) => {
    fill.style.width = idx < currentStep ? '100%' : '0%';
  });
  progressLabel.textContent = `Passo ${currentStep} de ${TOTAL_STEPS} · ${STEP_LABELS[currentStep]}`;
}

function showStep(step) {
  document.querySelectorAll('.step-panel').forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.step) === step);
  });
  currentStep = step;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
  const panel = form.querySelector(`.step-panel[data-step="${step}"]`);
  const requiredFields = panel.querySelectorAll('[required]');
  for (const field of requiredFields) {
    if (!field.value.trim()) {
      field.focus();
      field.style.borderColor = 'var(--danger)';
      setTimeout(() => { field.style.borderColor = ''; }, 2000);
      return false;
    }
  }
  return true;
}

document.querySelectorAll('[data-next]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
  });
});

document.querySelectorAll('[data-prev]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (currentStep > 1) showStep(currentStep - 1);
  });
});

// Mostra/esconde campos condicionais ("Outro", "Sim" com descrição, etc.)
document.querySelectorAll('[data-toggle-conditional]').forEach((input) => {
  input.addEventListener('change', () => {
    const boxId = input.dataset.toggleConditional;
    const box = document.getElementById(boxId);
    if (!box) return;
    // Para radios do mesmo grupo, fecha as outras condicionais do grupo
    const groupName = input.name;
    form.querySelectorAll(`input[name="${groupName}"]`).forEach((sibling) => {
      const siblingBoxId = sibling.dataset.toggleConditional;
      if (siblingBoxId && siblingBoxId !== boxId) {
        document.getElementById(siblingBoxId)?.classList.remove('show');
      }
    });
    box.classList.toggle('show', input.checked);
  });
});

function collectFormData() {
  const data = {};
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    if (data[key] !== undefined) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
    } else {
      data[key] = value;
    }
  }
  return data;
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.add('show');
}

function hideError() {
  errorBanner.classList.remove('show');
}

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

function buildPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const marginL = 15, marginR = 15, pageW = 210;
  const colLabel = marginL, colValue = 85, maxW = pageW - marginR - colValue;
  let y = 20;

  const checkPage = (needed = 8) => {
    if (y + needed > 280) { doc.addPage(); y = 20; }
  };

  // Cabeçalho
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 210, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Ficha de Cadastro de Colaborador — Fradema', marginL, 9.5);
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(8);
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  doc.text('Gerado em ' + agora, pageW - marginR, 9.5, { align: 'right' });
  y = 22;

  FIELD_LABELS.forEach((entry) => {
    if (entry.section) {
      checkPage(12);
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.4);
      doc.line(marginL, y, pageW - marginR, y);
      y += 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(entry.section.toUpperCase(), marginL, y);
      y += 6;
      return;
    }
    const [key, label] = entry;
    let val = data[key];
    if (!val || (Array.isArray(val) && val.length === 0)) return;
    if (Array.isArray(val)) val = val.join(', ');
    val = String(val);

    const lines = doc.splitTextToSize(val, maxW);
    const needed = Math.max(lines.length * 5, 6);
    checkPage(needed + 2);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(91, 97, 120);
    doc.text(label, colLabel, y);

    doc.setTextColor(31, 35, 51);
    doc.setFont('helvetica', 'bold');
    doc.text(lines, colValue, y);

    y += needed + 1;
  });

  return doc.output('datauristring').split(',')[1];
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(currentStep)) return;
  hideError();

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span>Enviando...';

  try {
    const data = collectFormData();
    const pdfBase64 = buildPDF(data);
    const nome = data.nomeCompleto || 'Colaborador';
    const fileName = 'Cadastro_' + nome.replace(/\s+/g, '_') + '.pdf';

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...data, pdfBase64, fileName }),
    });
    if (!res.ok) {
      let message = 'Não foi possível enviar agora. Tente novamente em instantes.';
      try {
        const errBody = await res.json();
        if (errBody?.message) message = errBody.message;
      } catch { /* sem corpo JSON */ }
      throw new Error(message);
    }

    form.style.display = 'none';
    document.getElementById('progress-track').style.display = 'none';
    document.getElementById('progress-label').style.display = 'none';
    document.getElementById('success-screen').classList.add('active');
  } catch (err) {
    showError(err.message || 'Erro ao enviar. Verifique sua conexão e tente novamente.');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

buildProgressDots();
updateProgress();
