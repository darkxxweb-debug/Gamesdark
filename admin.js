const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

const ADMIN_PASSWORD = 'DARKX2025';

document.addEventListener('DOMContentLoaded', function() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const addGameForm = document.getElementById('addGameForm');
    
    // Check if already logged in
    const isAdminLoggedIn = localStorage.getItem('darkxAdminLoggedIn');
    
    if (isAdminLoggedIn === 'true') {
        showAdminPanel();
        loadGamesForAdmin();
        loadStats();
    } else {
        document.getElementById('adminLogin').classList.remove('d-none');
    }
    
    // Event Listeners
    adminLoginBtn.addEventListener('click', adminLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);
    
    // Enter key for admin login
    const adminPasswordInput = document.getElementById('adminPassword');
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adminLogin();
            }
        });
    }
    
    // Form submission
    if (addGameForm) {
        addGameForm.addEventListener('submit', addNewGame);
    }
});

// Admin Login
function adminLogin() {
    const password = document.getElementById('adminPassword').value.trim();
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('darkxAdminLoggedIn', 'true');
        showAdminPanel();
        loadGamesForAdmin();
        loadStats();
        showAdminNotification('Admin login successful!', 'success');
    } else {
        showAdminNotification('Invalid admin password!', 'danger');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

function showAdminPanel() {
    document.getElementById('adminLogin').classList.add('d-none');
    document.getElementById('adminPanel').classList.remove('d-none');
}

function adminLogout() {
    localStorage.removeItem('darkxAdminLoggedIn');
    location.reload();
}

// Add New Game
async function addNewGame(e) {
    e.preventDefault();
    
    const gameData = {
        title: document.getElementById('gameTitle').value,
        description: document.getElementById('description').value,
        downloadLink: document.getElementById('downloadLink').value,
        category: document.getElementById('gameCategory').value,
        platform: document.getElementById('platform').value,
        fileSize: document.getElementById('fileSize').value,
        thumbnail: document.getElementById('thumbnail').value || '',
        isFeatured: document.getElementById('isFeatured').checked,
        version: '1.0'
    };
    
    try {
        const response = await fetch(`${API_URL}/games`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': ADMIN_PASSWORD
            },
            body: JSON.stringify(gameData)
        });
        
        if (!response.ok) throw new Error('Failed to add game');
        
        const result = await response.json();
        
        // Reset form
        document.getElementById('addGameForm').reset();
        
        // Reload games list
        loadGamesForAdmin();
        loadStats();
        
        showAdminNotification('Game added successfully!', 'success');
        console.log('Game added:', result);
    } catch (error) {
        console.error('Error adding game:', error);
        showAdminNotification('Failed to add game. Please try again.', 'danger');
    }
}

// Load Games for Admin
async function loadGamesForAdmin() {
    try {
        const response = await fetch(`${API_URL}/games`);
        
        if (!response.ok) throw new Error('Failed to load games');
        
        const games = await response.json();
        displayGamesTable(games);
    } catch (error) {
        console.error('Error loading games:', error);
        document.getElementById('gamesTable').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load games
                </td>
            </tr>
        `;
    }
}

// Display Games in Table
function displayGamesTable(games) {
    const tbody = document.getElementById('gamesTable');
    
    if (games.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No games added yet. Add your first game above.
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    games.forEach(game => {
        const date = new Date(game.uploadedAt).toLocaleDateString();
        
        html += `
            <tr>
                <td>
                    <strong class="text-light">${game.title}</strong>
                    ${game.isFeatured ? 
                        '<span class="badge bg-warning ms-2">Featured</span>' : 
                        ''
                    }
                </td>
                <td>
                    <span class="badge bg-info">${game.category}</span>
                </td>
                <td>
                    <span class="badge bg-secondary">${game.downloadCount}</span>
                </td>
                <td class="text-muted">${date}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning me-2" onclick="editGame('${game._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGame('${game._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Delete Game
async function deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    try {
        const response = await fetch(`${API_URL}/games/${gameId}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': ADMIN_PASSWORD
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete game');
        
        // Reload games list
        loadGamesForAdmin();
        loadStats();
        
        showAdminNotification('Game deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting game:', error);
        showAdminNotification('Failed to delete game.', 'danger');
    }
}

// Edit Game (simplified - you can expand this)
function editGame(gameId) {
    // For simplicity, we'll just open a prompt to edit
    // In a real app, you'd have a proper edit form
    const newTitle = prompt('Enter new game title:');
    if (newTitle) {
        updateGame(gameId, { title: newTitle });
    }
}

async function updateGame(gameId, updates) {
    try {
        const response = await fetch(`${API_URL}/games/${gameId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': ADMIN_PASSWORD
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) throw new Error('Failed to update game');
        
        // Reload games list
        loadGamesForAdmin();
        
        showAdminNotification('Game updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating game:', error);
        showAdminNotification('Failed to update game.', 'danger');
    }
}

// Load Stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/games`);
        const games = await response.json();
        
        const totalGames = games.length;
        const totalDownloads = games.reduce((sum, game) => sum + game.downloadCount, 0);
        const featuredGames = games.filter(game => game.isFeatured).length;
        
        document.getElementById('statsContainer').innerHTML = `
            <div class="mb-3">
                <h3 class="text-warning">${totalGames}</h3>
                <small class="text-muted">Total Games</small>
            </div>
            <div class="mb-3">
                <h3 class="text-info">${totalDownloads}</h3>
                <small class="text-muted">Total Downloads</small>
            </div>
            <div>
                <h3 class="text-success">${featuredGames}</h3>
                <small class="text-muted">Featured Games</small>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function showAdminNotification(message, type = 'info') {
    // Simple alert for admin panel
    alert(`${type.toUpperCase()}: ${message}`);
}

// Export functions for global use
window.editGame = editGame;
window.deleteGame = deleteGame;
window.loadGamesForAdmin = loadGamesForAdmin;
