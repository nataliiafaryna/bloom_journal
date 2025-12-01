// EMOTION TO FLOWER MAPPING (must match garden.js)
const emotionFlowerMap = {
    happiness: "flowerimages/1.png",
    joy: "flowerimages/2.png",
    calmness: "flowerimages/3.png",
    acceptance: "flowerimages/4.png",
    love: "flowerimages/5.png",
    trust: "flowerimages/6.png",
    surprise: "flowerimages/7.png",
    admiration: "flowerimages/8.png",
    interest: "flowerimages/9.png"
};

// MONTH NAMES
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// STATE
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let allEntries = [];

// DOM ELEMENTS
const gardenArea = document.getElementById('gardenArea');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const monthPicker = document.getElementById('monthPicker');
const monthModal = document.getElementById('monthModal');
const monthGrid = document.getElementById('monthGrid');
const closeModal = document.getElementById('closeModal');

// STATS
const statEntries = document.getElementById('statEntries');
const statFlowers = document.getElementById('statFlowers');
const statEmotions = document.getElementById('statEmotions');

// MENU ELEMENTS
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const backdrop = document.getElementById('menu-backdrop');
const menuGarden = document.getElementById('menuGarden');
const menuArchive = document.getElementById('menuArchive');
const menuLogout = document.getElementById('menuLogout');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

// INITIALIZE
function init() {
    loadEntries();
    setupEventListeners();
    updateMonthDisplay();
    renderMonthGrid();
    renderGarden();
}

// LOAD ENTRIES FROM LOCALSTORAGE
function loadEntries() {
    const saved = localStorage.getItem('gardenEntries');
    if (saved) {
        allEntries = JSON.parse(saved);
        console.log(`Loaded ${allEntries.length} entries from garden`);
    } else {
        allEntries = [];
        console.log('No garden entries found');
    }
}

// SETUP EVENT LISTENERS
function setupEventListeners() {
    // Month navigation
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', goToPrevMonth);
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', goToNextMonth);
    
    // Month picker
    if (monthPicker) monthPicker.addEventListener('click', () => {
        monthModal.style.display = 'flex';
    });
    
    if (closeModal) closeModal.addEventListener('click', () => {
        monthModal.style.display = 'none';
    });
    
    // Close modal on backdrop click
    window.addEventListener('click', (e) => {
        if (e.target === monthModal) {
            monthModal.style.display = 'none';
        }
    });
    
    // Menu (same as garden)
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
    
    if (menuGarden) menuGarden.addEventListener('click', () => {
        closeMenu();
        window.location.href = 'garden.html';
    });
    
    if (menuArchive) menuArchive.addEventListener('click', () => {
        closeMenu();
        window.location.href = 'archive.html';
    });
    
    if (menuLogout) menuLogout.addEventListener('click', logout);
    
    // Theme
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        if (themeLabel) themeLabel.textContent = 'Dark';
    }
}

// MENU FUNCTIONS
function toggleMenu() {
    menuPanel.classList.toggle('active');
    backdrop.classList.toggle('active');
}

function closeMenu() {
    menuPanel.classList.remove('active');
    backdrop.classList.remove('active');
}

function logout() {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('theme');
    alert('You have been logged out');
    window.location.href = 'login.html';
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (themeLabel) themeLabel.textContent = isDark ? 'Dark' : 'Light';
}

// MONTH NAVIGATION
function goToPrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateMonthDisplay();
    renderGarden();
}

function goToNextMonth() {
    const now = new Date();
    
    // Don't go to future months
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
    }
    
    const isFuture = nextYear > now.getFullYear() || 
                    (nextYear === now.getFullYear() && nextMonth > now.getMonth());
    
    if (!isFuture) {
        currentMonth = nextMonth;
        currentYear = nextYear;
        updateMonthDisplay();
        renderGarden();
    }
}

// UPDATE MONTH DISPLAY
function updateMonthDisplay() {
    if (currentMonthEl) {
        currentMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    // Update button states
    const now = new Date();
    const isFuture = currentYear > now.getFullYear() || 
                    (currentYear === now.getFullYear() && currentMonth > now.getMonth());
    
    if (prevMonthBtn) prevMonthBtn.disabled = false;
    if (nextMonthBtn) {
        // Check if next month would be future
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
        }
        
        const nextIsFuture = nextYear > now.getFullYear() || 
                           (nextYear === now.getFullYear() && nextMonth > now.getMonth());
        
        nextMonthBtn.disabled = nextIsFuture;
    }
}

// GET ENTRIES FOR CURRENT MONTH
function getEntriesForCurrentMonth() {
    return allEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
    });
}

// RENDER GARDEN
function renderGarden() {
    gardenArea.innerHTML = '';
    
    const monthEntries = getEntriesForCurrentMonth();
    
    // Update stats
    updateStats(monthEntries);
    
    // Check if it's a future month
    const now = new Date();
    const isFutureMonth = currentYear > now.getFullYear() || 
                         (currentYear === now.getFullYear() && currentMonth > now.getMonth());
    
    if (isFutureMonth) {
        showEmptyState('This month is in the future', 'Come back later to see your flowers!');
        return;
    }
    
    if (monthEntries.length === 0) {
        showEmptyState('No flowers this month', 'Write in your garden to grow flowers here!');
        return;
    }
    
    // Get all flowers from entries
    const allFlowers = [];
    monthEntries.forEach(entry => {
        entry.emotions.forEach(emotion => {
            const flowerSrc = emotionFlowerMap[emotion];
            if (flowerSrc) {
                allFlowers.push({
                    src: flowerSrc,
                    emotion: emotion,
                    date: entry.date,
                    text: entry.text
                });
            }
        });
    });
    
    // Render flowers
    const containerWidth = gardenArea.clientWidth - 100;
    const containerHeight = gardenArea.clientHeight - 100;
    
    allFlowers.forEach((flower, index) => {
        // Calculate position (avoid overlap)
        const x = 50 + (index % 5) * 80 + Math.random() * 30;
        const y = 50 + Math.floor(index / 5) * 80 + Math.random() * 30;
        
        // Make sure it stays in bounds
        const finalX = Math.min(x, containerWidth);
        const finalY = Math.min(y, containerHeight);
        
        createFlower(flower, finalX, finalY, index);
    });
}

// CREATE FLOWER ELEMENT
function createFlower(flower, x, y, index) {
    const img = document.createElement('img');
    img.className = 'archive-flower';
    img.src = flower.src;
    img.alt = flower.emotion;
    
    // Position
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    
    // Add delay for animation
    img.style.animationDelay = `${index * 0.1}s`;
    
    // Tooltip
    const dateStr = new Date(flower.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    img.title = `${dateStr}\n${flower.emotion}\n"${flower.text.substring(0, 40)}${flower.text.length > 40 ? '...' : ''}"`;
    
    // Click to show details
    img.addEventListener('click', () => {
        showFlowerDetails(flower);
    });
    
    gardenArea.appendChild(img);
}

// SHOW FLOWER DETAILS
function showFlowerDetails(flower) {
    const dateStr = new Date(flower.date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    alert(`🌸 Flower Details 🌸\n\n` +
          `Date: ${dateStr}\n` +
          `Emotion: ${flower.emotion}\n` +
          `Note: ${flower.text}`);
}

// SHOW EMPTY STATE
function showEmptyState(title, message) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-archive';
    emptyDiv.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <a href="garden.html" class="nav-btn" style="display: inline-block; margin-top: 20px;">
            Go to Garden
        </a>
    `;
    gardenArea.appendChild(emptyDiv);
}

// UPDATE STATISTICS
function updateStats(entries) {
    if (!entries || entries.length === 0) {
        statEntries.textContent = '0';
        statFlowers.textContent = '0';
        statEmotions.textContent = '0';
        return;
    }
    
    // Count total flowers (each emotion = 1 flower)
    const totalFlowers = entries.reduce((total, entry) => total + entry.emotions.length, 0);
    
    // Count unique emotions
    const allEmotions = new Set();
    entries.forEach(entry => {
        entry.emotions.forEach(emotion => allEmotions.add(emotion));
    });
    
    statEntries.textContent = entries.length;
    statFlowers.textContent = totalFlowers;
    statEmotions.textContent = allEmotions.size;
}

// RENDER MONTH GRID FOR MODAL
function renderMonthGrid() {
    monthGrid.innerHTML = '';
    
    const now = new Date();
    const currentYearNow = now.getFullYear();
    const currentMonthNow = now.getMonth();
    
    // Show current year and previous year
    for (let year = currentYearNow; year >= currentYearNow - 1; year--) {
        for (let month = 11; month >= 0; month--) {
            // Skip future months
            const isFuture = year > currentYearNow || 
                           (year === currentYearNow && month > currentMonthNow);
            
            // Check if this month has entries
            const hasEntries = allEntries.some(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.getMonth() === month && 
                       entryDate.getFullYear() === year;
            });
            
            const monthOption = document.createElement('div');
            monthOption.className = 'month-option';
            monthOption.textContent = `${monthNames[month]} ${year}`;
            monthOption.dataset.month = month;
            monthOption.dataset.year = year;
            
            // Add classes based on state
            if (isFuture) {
                monthOption.classList.add('future');
            } else if (hasEntries) {
                monthOption.classList.add('has-data');
            }
            
            // Highlight current month
            if (month === currentMonth && year === currentYear) {
                monthOption.classList.add('active');
            }
            
            // Add click handler (only for non-future months)
            if (!isFuture) {
                monthOption.addEventListener('click', () => {
                    currentMonth = month;
                    currentYear = year;
                    updateMonthDisplay();
                    renderGarden();
                    monthModal.style.display = 'none';
                    
                    // Update active state
                    document.querySelectorAll('.month-option').forEach(el => {
                        el.classList.remove('active');
                    });
                    monthOption.classList.add('active');
                });
            }
            
            monthGrid.appendChild(monthOption);
        }
    }
}

// START THE APP
document.addEventListener('DOMContentLoaded', init);

// DEBUG FUNCTION
window.debugArchive = function() {
    console.log('=== ARCHIVE DEBUG ===');
    console.log('Current month:', currentMonth, currentYear);
    console.log('Total entries:', allEntries.length);
    
    const monthEntries = getEntriesForCurrentMonth();
    console.log('Current month entries:', monthEntries.length);
    
    monthEntries.forEach((entry, i) => {
        console.log(`Entry ${i}:`, {
            date: entry.date,
            emotions: entry.emotions,
            text: entry.text.substring(0, 50) + '...'
        });
    });
    
    console.log('=== END DEBUG ===');
};