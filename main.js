const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api'; // For Heroku deployment

const APP_PASSWORD = 'DARKX-OFFICIAL2025';

// DOM Elements
const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
const mainContent = document.getElementById('mainContent');
const submitPasswordBtn = document.getElementById('submitPassword');
const whatsappBtn = document.getElementById('whatsappBtn');
const passwordInput = document.getElementById('passwordInput');
const togglePasswordBtn = document.getElementById('togglePassword');
const gamesContainer = document.getElementById('gamesContainer');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated
    const isAuthenticated = localStorage.getItem('darkxAuthenticated');
    
    if (isAuthenticated === 'true') {
        showMainContent();
        loadGames();
    } else {
        passwordModal.show();
    }
    
    // Event Listeners
    submitPasswordBtn.addEventListener('click', authenticateUser);
    whatsappBtn.addEventListener('click', openWhatsApp);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    // Enter key for password
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            authenticateUser();
        }
    });
});

// Authentication
function authenticateUser() {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === APP_PASSWORD) {
        localStorage.setItem('darkxAuthenticated', 'true');
        passwordModal.hide();
        showMainContent();
        loadGames();
        showNotification('Access granted! Welcome to DARKX Games.', 'success');
    } else {
        showNotification('Invalid passcode. Please purchase from owner.', 'danger');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function showMainContent() {
    mainContent.classList.remove('d-none');
    document.body.style.overflow = 'auto';
}

// Load Games from API
async function loadGames() {
    try {
        const response = await fetch(`${API_URL}/games/protected/all`, {
            headers: {
                'x-app-password': APP_PASSWORD
            }
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                localStorage.removeItem('darkxAuthenticated');
                passwordModal.show();
                throw new Error('Authentication required');
            }
            throw new Error('Failed to load games');
        }
        
        const games = await response.json();
        displayGames(games);
    } catch (error) {
        console.error('Error loading games:', error);
        gamesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${error.message}
                </div>
                <button class="btn btn-warning" onclick="loadGames()">
                    <i class="fas fa-redo me-2"></i>Retry
                </button>
            </div>
        `;
    }
}

// Display Games
function displayGames(games) {
    if (games.length === 0) {
        gamesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No games available yet. Check back soon!
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    games.forEach(game => {
        const categoryColor = getCategoryColor(game.category);
        
        html += `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="game-card card h-100">
                    <div class="position-relative">
                        <img src="${game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}" 
                             class="card-img-top" alt="${game.title}">
                        ${game.isFeatured ? `
                            <span class="position-absolute top-0 end-0 m-2 badge bg-warning">
                                <i class="fas fa-crown me-1"></i>Featured
                            </span>
                        ` : ''}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-light">${game.title}</h5>
                        <p class="card-text text-muted flex-grow-1">${game.description}</p>
                        
                        <div class="mb-3">
                            <span class="badge ${categoryColor} me-2">${game.category}</span>
                            <span class="badge bg-info me-2">${game.platform}</span>
                            <span class="badge bg-secondary">${game.fileSize}</span>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <small class="text-muted">
                                <i class="fas fa-download me-1"></i>
                                ${game.downloadCount} downloads
                            </small>
                            <button class="btn btn-warning btn-sm" onclick="downloadGame('${game._id}', '${game.title}')">
                                <i class="fas fa-download me-1"></i>Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    gamesContainer.innerHTML = html;
}

// Download Game
async function downloadGame(gameId, gameTitle) {
    try {
        // Increment download count
        await fetch(`${API_URL}/games/download/${gameId}`, {
            method: 'PUT'
        });
        
        // Get game details
        const response = await fetch(`${API_URL}/games/${gameId}`);
        const game = await response.json();
        
        // Open download link in new tab
        window.open(game.downloadLink, '_blank');
        
        // Show confirmation
        showNotification(`Downloading ${gameTitle}...`, 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Failed to download game. Please try again.', 'danger');
    }
}

// Helper Functions
function getCategoryColor(category) {
    const colors = {
        'Action': 'bg-danger',
        'Adventure': 'bg-success',
        'RPG': 'bg-primary',
        'Sports': 'bg-info',
        'Racing': 'bg-warning',
        'Strategy': 'bg-purple',
        'Other': 'bg-secondary'
    };
    return colors[category] || 'bg-secondary';
}

function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.innerHTML = type === 'password' ? 
        '<i class="fas fa-eye"></i>' : 
        '<i class="fas fa-eye-slash"></i>';
}

function openWhatsApp() {
    const phone = '255775710774';
    const message = 'Hi, I want to buy DARKX Games passcode for TSh 1000.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Export for global use
window.downloadGame = downloadGame;
window.loadGames = loadGames;
