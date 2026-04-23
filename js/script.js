// CRUD
let myGames = JSON.parse(localStorage.getItem('myGames')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Função universal para salvar tudo no navegador
function saveData() {
    localStorage.setItem('myGames', JSON.stringify(myGames));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

let currentEditId = null;

const formElement = document.querySelector("#cadastro form");
const cardsContainer = document.querySelector(".games-grid");

// === SISTEMA DE AUTENTICAÇÃO ===
let isLoginMode = true;
const authForm = document.getElementById('auth-form');
const authToggle = document.getElementById('auth-toggle');
const groupNome = document.getElementById('group-nome');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');

// Alterna entre a tela de Login e a tela de Registro
authToggle.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        groupNome.style.display = 'none';
        authTitle.innerText = 'Login';
        authBtn.innerText = 'Entrar';
        authToggle.innerText = 'Não tem conta? Registre-se';
        document.getElementById('auth-nome').removeAttribute('required');
    } else {
        groupNome.style.display = 'block';
        authTitle.innerText = 'Criar Conta';
        authBtn.innerText = 'Cadastrar';
        authToggle.innerText = 'Já tem conta? Faça Login';
        document.getElementById('auth-nome').setAttribute('required', 'true');
    }
});

// Intercepta o envio do formulário de Login/Registro
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const senha = document.getElementById('auth-senha').value;
    const nome = document.getElementById('auth-nome').value;

    if (isLoginMode) {
        // LÓGICA DE LOGIN: Procura um usuário com o mesmo email e senha
        const userFound = users.find(u => u.email === email && u.senha === senha);
        if (userFound) {
            currentUser = userFound;
            saveData();
            updateHeader();
            renderGames();
            renderReviews();
            closeModal('modal-login');
            alert(`Bem-vindo de volta, ${currentUser.nome}!`);
        } else {
            alert('E-mail ou senha incorretos.');
        }
    } else {
        // LÓGICA DE REGISTRO: Verifica se o e-mail já existe
        const emailExists = users.find(u => u.email === email);
        if (emailExists) {
            alert('Este e-mail já está em uso!');
            return;
        }
        // Cria o usuário com um ID incremental/timestamp
        const newUser = { id: Date.now(), nome: nome, email: email, senha: senha };
        users.push(newUser);
        currentUser = newUser; // Já loga o usuário automaticamente
        saveData();
        updateHeader();
        renderGames();
        renderReviews();
        closeModal('modal-login');
        alert('Conta criada com sucesso!');
    }
    authForm.reset();
});

// Atualiza o botão de Login no Header e a ação dele
function updateHeader() {
    const navLogin = document.querySelector('.nav-login');
    if (currentUser) {
        navLogin.innerText = `Sair (${currentUser.nome})`;
        navLogin.onclick = () => {
            currentUser = null;
            saveData();
            updateHeader();
            renderGames();
            renderReviews();
            alert('Você saiu da sua conta.');
        };
    } else {
        navLogin.innerText = 'Login';
        navLogin.onclick = () => openModal('modal-login');
    }
}

formElement.addEventListener("submit", function (event) {
  event.preventDefault();

  const inputName = document.getElementById("game-name").value;
  const inputPlatform = document.getElementById("platform").value;
  const inputRating = document.getElementById("rating").value;
  const inputHours = document.getElementById("hours").value;
  const inputReview = document.getElementById("review").value;

  const newGame = {
    id: currentEditId ? currentEditId : Date.now(),
    userId: currentUser.id,
    userName: currentUser.nome,
    name: inputName,
    platform: inputPlatform,
    rating: inputRating,
    hours: inputHours,
    review: inputReview,
  };

  if (currentEditId !== null) {
    const gameIndex = myGames.findIndex(function (game) {
      return game.id === currentEditId;
    });

    myGames[gameIndex] = newGame;
    currentEditId = null;
  } else {
    myGames.push(newGame);
  }

  formElement.reset();

  saveData();

  renderGames();

  closeModal("modal-cadastro");

  renderReviews();
});

function renderGames() {
  cardsContainer.innerHTML = "";

  // 1. Se não tiver ninguém logado, mostra mensagem padrão
  if (!currentUser) {
    cardsContainer.innerHTML = '<p class="empty-message">Faça login para ver sua biblioteca.</p>';
    return;
  }

  const submitButton = formElement.querySelector('button[type="submit"]');

  if (currentEditId !== null) {
    submitButton.innerText = "Salvar Alterações";
  } else {
    submitButton.innerText = "Salvar Jogo";
  }

  // 2. FILTRO MÁGICO: Pega o array completo, mas separa só os jogos do usuário atual
  const userGames = myGames.filter(function (game) {
      return game.userId === currentUser.id;
  });

  // 3. Verifica se O USUÁRIO tem jogos, e não o array global
  if (userGames.length === 0) {
    cardsContainer.innerHTML = '<p class="empty-message">Nenhum jogo registrado na sua biblioteca.</p>';
    return;
  }

  // 4. Faz o loop apenas nos jogos do usuário (userGames em vez de myGames)
  userGames.forEach(function (game) {
    const card = document.createElement("div");
    card.classList.add("game-card");

    card.innerHTML = `
            <h3>${game.name}</h3>
            <p><strong>Plataforma:</strong> ${game.platform}</p>
            <p><strong>Nota:</strong> ${game.rating}</p>
            <p><strong>Horas jogadas:</strong> ${game.hours}</p>
            <p><strong>Review:</strong> ${game.review}</p>
            <div class="card-actions">
                <button class="btn-edit" onclick="editGame(${game.id})">Editar</button>
                <button class="btn-delete" onclick="deleteGame(${game.id})">Excluir</button>
            </div>
        `;
    cardsContainer.appendChild(card);
  });
}

function deleteGame(gameId) {
  myGames = myGames.filter(function (game) {
    return game.id !== gameId;
  });
  saveData();
  renderGames();
}

function editGame(gameId) {
  const gameToEdit = myGames.find(function (game) {
    return game.id === gameId;
  });
  if (gameToEdit) {
    currentEditId = gameId;

    document.getElementById("modal-title").innerText = "Editar Jogo";
    document.getElementById("game-name").value = gameToEdit.name;
    document.getElementById("platform").value = gameToEdit.platform;
    document.getElementById("rating").value = gameToEdit.rating;
    document.getElementById("hours").value = gameToEdit.hours;
    document.getElementById("review").value = gameToEdit.review;

    closeModal("modal-biblioteca");
    openModal("modal-cadastro");

    saveData();
    renderGames();
  }
}

// MODAL

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-content").scrollTop = 0;
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

window.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal-overlay")) {
    event.target.classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

function openNewGameForm() {
    // Se não tiver ninguém logado, barra a ação e abre o Login
    if (!currentUser) {
        openModal('modal-login');
        return; 
    }

    currentEditId = null;
    formElement.reset();
    document.getElementById("modal-title").innerText = "Adicionar Jogo";
    formElement.querySelector('button[type="submit"]').innerText = "Salvar Jogo";
    openModal("modal-cadastro");
}

// Função para renderizar a seção estilo Letterboxd na página principal
function renderReviews() {
    const reviewsContainer = document.getElementById('reviews-list');
    if (!reviewsContainer) return; // Se não achar a div, ignora

    reviewsContainer.innerHTML = '';

    // Filtra apenas os jogos que têm algum texto na caixa de review
    const gamesWithReviews = myGames.filter(game => game.review && game.review.trim() !== "");

    if (gamesWithReviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="empty-message">Nenhuma review registrada ainda. Jogue algo e conte para nós!</p>';
        return;
    }

    const reversedGames = [...gamesWithReviews].reverse();

    const ultimasReviews = reversedGames.slice(0, 5);

    ultimasReviews.forEach(game => {
        // Lógica para transformar sua nota de 0 a 10 em 5 estrelinhas
        const starCount = Math.round(game.rating / 2);
        const starsHTML = '★'.repeat(starCount); 

        const reviewEl = document.createElement('div');
        reviewEl.classList.add('review-item');
        
        // Monta o HTML idêntico ao estilo criado no CSS
        reviewEl.innerHTML = `
            <div class="review-poster-placeholder">🎮</div>
            <div class="review-content">
                <div class="review-title-row">
                    <span class="review-game-title">${game.name}</span>
                </div>
                <div class="review-meta">
                    <span class="review-author-avatar"></span>
                    <span class="review-author-name">${game.userName || 'Usuário Desconhecido'}</span>
                    <span class="review-stars">${starsHTML}</span>
                </div>
                <p class="review-text">"${game.review}"</p>
                <div class="review-likes"><span>❤️</span> 0 curtidas</div>
            </div>
        `;
        
        reviewsContainer.appendChild(reviewEl);
    });
}

updateHeader();
renderGames();
renderReviews();