// CRUD

let myGames = [];
let currentEditId = null;

const formElement = document.querySelector("#cadastro form");
const cardsContainer = document.querySelector(".games-grid");

formElement.addEventListener("submit", function (event) {
  event.preventDefault();

  const inputName = document.getElementById("game-name").value;
  const inputPlatform = document.getElementById("platform").value;
  const inputRating = document.getElementById("rating").value;
  const inputHours = document.getElementById("hours").value;
  const inputReview = document.getElementById("review").value;

  const newGame = {
    id: currentEditId ? currentEditId : Date.now(),
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

  renderGames();

  closeModal("modal-cadastro");

  renderReviews();
});

function renderGames() {
  cardsContainer.innerHTML = "";

  const submitButton = formElement.querySelector('button[type="submit"]');

  if (currentEditId !== null) {
    submitButton.innerText = "Salvar Alterações";
  } else {
    submitButton.innerText = "Salvar Jogo";
  }

  if (myGames.length === 0) {
    cardsContainer.innerHTML =
      '<p class="empty-message">Nenhum jogo registrado na sua biblioteca.</p>';
    return;
  }

  myGames.forEach(function (game) {
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

    // Inverte o array para mostrar as últimas reviews adicionadas no topo
    const reversedGames = [...gamesWithReviews].reverse();

    reversedGames.forEach(game => {
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
                    <span class="review-author-name">Você</span>
                    <span class="review-stars">${starsHTML}</span>
                </div>
                <p class="review-text">"${game.review}"</p>
                <div class="review-likes"><span>❤️</span> 0 curtidas</div>
            </div>
        `;
        
        reviewsContainer.appendChild(reviewEl);
    });
}
