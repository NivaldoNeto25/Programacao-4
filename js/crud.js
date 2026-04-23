
let myGames = JSON.parse(localStorage.getItem('myGames')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function saveToLocalStorage() {
    localStorage.setItem('myGames', JSON.stringify(myGames));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}


function getCurrentUser() {
    return currentUser;
}

function loginUser(email, senha) {
    const userFound = users.find(u => u.email === email && u.senha === senha);
    if (userFound) {
        currentUser = userFound;
        saveToLocalStorage();
        return { success: true, user: currentUser };
    }
    return { success: false, message: 'E-mail ou senha incorretos.' };
}

function registerUser(nome, email, senha) {
    const emailExists = users.find(u => u.email === email);
    if (emailExists) {
        return { success: false, message: 'Este e-mail já está em uso!' };
    }
    const newUser = { id: Date.now(), nome: nome, email: email, senha: senha };
    users.push(newUser);
    currentUser = newUser;
    saveToLocalStorage();
    return { success: true, user: currentUser };
}

function logoutUser() {
    currentUser = null;
    saveToLocalStorage();
}


function createGame(gameData) {
    const newGame = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.nome,
        ...gameData
    };
    myGames.push(newGame);
    saveToLocalStorage();
}

function updateGame(id, gameData) {
    const gameIndex = myGames.findIndex(game => game.id === id);
    if (gameIndex !== -1) {
        myGames[gameIndex] = { ...myGames[gameIndex], ...gameData };
        saveToLocalStorage();
    }
}

function deleteGameData(id) {
    myGames = myGames.filter(game => game.id !== id);
    saveToLocalStorage();
}

function getGameById(id) {
    return myGames.find(game => game.id === id);
}

function getUserGames() {
    if (!currentUser) return [];
    return myGames.filter(game => game.userId === currentUser.id);
}

function getAllReviews() {
    return myGames
        .filter(game => game.review && game.review.trim() !== "")
        .reverse();
}