/**
 * Melhor do Mundo - Sistema de Votação Interativo
 */

// Dados padrão iniciais caso não haja nada no localStorage
const INITIAL_CANDIDATES = [
  {
    id: "neymar",
    name: "Neymar Jr.",
    role: "Futebol • Al-Hilal / Brasil",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&auto=format&fit=crop&q=80",
    votes: 47
  },
  {
    id: "mbappe",
    name: "Kylian Mbappé",
    role: "Futebol • Real Madrid / França",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&auto=format&fit=crop&q=80",
    votes: 39
  },
  {
    id: "vinijr",
    name: "Vinicius Jr.",
    role: "Futebol • Real Madrid / Brasil",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=200&auto=format&fit=crop&q=80",
    votes: 31
  },
  {
    id: "bellingham",
    name: "Jude Bellingham",
    role: "Futebol • Real Madrid / Inglaterra",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=200&auto=format&fit=crop&q=80",
    votes: 24
  },
  {
    id: "pedri",
    name: "Pedri",
    role: "Futebol • Barcelona / Espanha",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&auto=format&fit=crop&q=80",
    votes: 18
  },
  {
    id: "haaland",
    name: "Erling Haaland",
    role: "Futebol • Man. City / Noruega",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200&auto=format&fit=crop&q=80",
    votes: 15
  }
];

const STORAGE_KEY = 'melhor_do_mundo_candidates_v2';

// Estado local
let candidates = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadCandidates();
  renderApp();
  setupEventListeners();
});

// Carrega candidatos do localStorage ou do padrão
function loadCandidates() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      candidates = JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao carregar dados salvos:", e);
      candidates = [...INITIAL_CANDIDATES];
    }
  } else {
    candidates = [...INITIAL_CANDIDATES];
    saveCandidates();
  }
}

// Salva candidatos no localStorage
function saveCandidates() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
}

// Renderiza tudo na tela
function renderApp() {
  // Ordena por votos (decrescente)
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
  
  // Total de votos
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  
  // Atualiza painel superior de estatísticas
  updateHeaderStats(sortedCandidates, totalVotes);

  // Renderiza grid de cards
  const grid = document.getElementById('candidatesGrid');
  grid.innerHTML = '';

  sortedCandidates.forEach((candidate, index) => {
    const isLeader = index === 0 && candidate.votes > 0;
    const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
    
    // Posição no ranking
    let rankBadgeText = `#${index + 1}`;
    let rankIcon = 'ph-medal';
    if (index === 0) {
      rankBadgeText = '👑 1º Lugar';
    } else if (index === 1) {
      rankBadgeText = '🥈 2º Lugar';
    } else if (index === 2) {
      rankBadgeText = '🥉 3º Lugar';
    }

    const card = document.createElement('article');
    card.className = `candidate-card ${isLeader ? 'is-top-1' : ''}`;
    card.dataset.id = candidate.id;

    card.innerHTML = `
      <div class="card-header-bar">
        <span class="rank-badge">${rankBadgeText}</span>
        <button class="card-remove-btn" title="Excluir candidato" onclick="removeCandidate('${candidate.id}')">
          <i class="ph-bold ph-trash"></i>
        </button>
      </div>

      <div class="candidate-profile">
        <div class="avatar-wrapper">
          <img 
            class="candidate-avatar" 
            src="${candidate.image || generateDefaultAvatar(candidate.name)}" 
            alt="${candidate.name}"
            onerror="this.onerror=null; this.src='${generateDefaultAvatar(candidate.name)}';"
          />
        </div>
        <div class="candidate-details">
          <h3 class="candidate-name" title="${candidate.name}">${candidate.name}</h3>
          <p class="candidate-role">${candidate.role || 'Candidato(a)'}</p>
        </div>
      </div>

      <div class="vote-metrics">
        <div class="metrics-top">
          <div class="votes-count-wrapper">
            <span class="votes-number">${candidate.votes}</span>
            <span class="votes-text">${candidate.votes === 1 ? 'voto' : 'votos'}</span>
          </div>
          <span class="votes-percentage">${percentage}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>

      <button class="vote-action-btn" onclick="castVote('${candidate.id}', event)">
        <i class="ph-bold ph-thumbs-up"></i>
        Votar Neste
      </button>
    `;

    grid.appendChild(card);
  });
}

// Atualiza o resumo do cabeçalho
function updateHeaderStats(sortedCandidates, totalVotes) {
  document.getElementById('totalVotesCount').textContent = totalVotes.toLocaleString('pt-BR');
  document.getElementById('candidatesCount').textContent = candidates.length;

  const leaderElement = document.getElementById('currentLeaderName');
  if (sortedCandidates.length > 0 && totalVotes > 0) {
    leaderElement.textContent = sortedCandidates[0].name;
  } else {
    leaderElement.textContent = 'Sem votos ainda';
  }
}

// Votação
window.castVote = function(candidateId, event) {
  const previousLeaderId = getLeaderId();
  const candidate = candidates.find(c => c.id === candidateId);
  if (!candidate) return;

  candidate.votes += 1;
  saveCandidates();

  // Efeito sonoro simples via Web Audio API (opcional, sem dependências externas)
  playVoteSound();

  // Efeito visual de "+1" flutuante
  if (event) {
    createFloatingPlusOne(event.currentTarget || event.target);
  }

  // Verifica se assumiu a liderança agora e solta celebração
  const newLeaderId = getLeaderId();
  if (newLeaderId === candidateId && previousLeaderId !== candidateId && candidate.votes > 1) {
    triggerLeaderCelebration();
  }

  // Atualiza visual
  renderApp();
};

// Retorna ID do líder atual
function getLeaderId() {
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  return sorted[0].votes > 0 ? sorted[0].id : null;
}

// Efeito de +1 flutuando sobre o botão clicado
function createFloatingPlusOne(buttonElement) {
  const plusOne = document.createElement('span');
  plusOne.className = 'floating-plus-one';
  plusOne.textContent = '+1 VOTO!';

  // Posiciona relativo ao botão
  const rect = buttonElement.getBoundingClientRect();
  plusOne.style.left = `${rect.width / 2 - 35}px`;
  plusOne.style.top = `-10px`;

  buttonElement.appendChild(plusOne);

  setTimeout(() => {
    plusOne.remove();
  }, 850);
}

// Sons sintonizados com Web Audio API
function playVoteSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    // Silencioso se navegador bloquear áudio automático
  }
}

// Chuva de confetes quando há novo líder
function triggerLeaderCelebration() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06efb4', '#a855f7', '#e879f9', '#c084fc', '#ffffff']
    });
  }
}

// Remover candidato
window.removeCandidate = function(candidateId) {
  const candidate = candidates.find(c => c.id === candidateId);
  if (!candidate) return;

  const confirmRemoval = confirm(`Deseja realmente remover "${candidate.name}" da votação?`);
  if (confirmRemoval) {
    candidates = candidates.filter(c => c.id !== candidateId);
    saveCandidates();
    renderApp();
  }
};

// Gerador de avatar com iniciais elegantes caso não tenha foto
function generateDefaultAvatar(name) {
  const cleanName = encodeURIComponent(name || 'V');
  return `https://ui-avatars.com/api/?name=${cleanName}&background=1e293b&color=f59e0b&bold=true&size=128`;
}

// Configuração dos Eventos e Modais
function setupEventListeners() {
  const modalBackdrop = document.getElementById('modalBackdrop');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelModal = document.getElementById('btnCancelModal');
  const addCandidateForm = document.getElementById('addCandidateForm');

  const resetModalBackdrop = document.getElementById('resetModalBackdrop');
  const btnResetVotes = document.getElementById('btnResetVotes');
  const btnCloseResetModal = document.getElementById('btnCloseResetModal');
  const btnCancelReset = document.getElementById('btnCancelReset');
  const btnConfirmReset = document.getElementById('btnConfirmReset');

  // Abrir Modal de Adicionar
  btnOpenModal.addEventListener('click', () => {
    modalBackdrop.classList.add('active');
    document.getElementById('candidateName').focus();
  });

  // Fechar Modal de Adicionar
  const closeModal = () => {
    modalBackdrop.classList.remove('active');
    addCandidateForm.reset();
  };
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  // Submissão do novo candidato
  addCandidateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('candidateName').value.trim();
    const role = document.getElementById('candidateRole').value.trim();
    const image = document.getElementById('candidateImage').value.trim();

    if (!name) return;

    const newCandidate = {
      id: 'cand_' + Date.now(),
      name: name,
      role: role || 'Candidato Oficial',
      image: image || '',
      votes: 0
    };

    candidates.push(newCandidate);
    saveCandidates();
    renderApp();
    closeModal();

    // Feedback visual
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  });

  // Modal de Reset
  btnResetVotes.addEventListener('click', () => {
    resetModalBackdrop.classList.add('active');
  });

  const closeResetModal = () => {
    resetModalBackdrop.classList.remove('active');
  };
  btnCloseResetModal.addEventListener('click', closeResetModal);
  btnCancelReset.addEventListener('click', closeResetModal);

  btnConfirmReset.addEventListener('click', () => {
    candidates.forEach(c => c.votes = 0);
    saveCandidates();
    renderApp();
    closeResetModal();
  });

  // Fechar modais ao clicar no fundo
  window.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
    if (e.target === resetModalBackdrop) closeResetModal();
  });

  // Atalho ESC para fechar modais
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeResetModal();
    }
  });
}
