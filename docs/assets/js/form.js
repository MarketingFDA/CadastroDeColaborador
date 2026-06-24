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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(currentStep)) return;
  hideError();

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span>Enviando...';

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(collectFormData()),
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
