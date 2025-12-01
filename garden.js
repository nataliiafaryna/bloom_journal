
/* -------------------
   EMOTIONS
------------------- */
const emotionList = [
    "happiness", "joy", "calmness", "acceptance", "love",
    "trust", "surprise", "admiration", "interest"
];

const flowerImages = {
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

/* -------------------
   FIXED POSITIONS
------------------- */
const basePositions = {
    happiness: { x: 10, y: 15 },
    joy: { x: 30, y: 25 },
    calmness: { x: 50, y: 10 },
    acceptance: { x: 70, y: 20 },
    love: { x: 85, y: 35 },
    trust: { x: 15, y: 55 },
    surprise: { x: 40, y: 70 },
    admiration: { x: 65, y: 60 },
    interest: { x: 80, y: 80 }
};

/* -------------------
   КОНСТАНТИ ДЛЯ РОЗМІЩЕННЯ
------------------- */
const GARDEN_BOUNDS = {
    minX: 5,
    maxX: 95,
    minY: 5,
    maxY: 95
};

const FLOWER_SIZE = {
    width: 55,
    height: 55
};

const GARDEN_WIDTH_PX = 800;
const GARDEN_HEIGHT_PX = 450;
const MIN_DISTANCE_PX = 60;

/* -------------------
   ELEMENTS - ДОДАЄМО ВСІ ЕЛЕМЕНТИ
------------------- */
const filterContainer = document.getElementById("filterEmotions");
const modalEmotionContainer = document.getElementById("modalEmotions");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const cancelModal = document.getElementById("cancelModal");
const saveModal = document.getElementById("saveModal");
const noteText = document.getElementById("noteText");
const garden = document.getElementById("garden");
const themeToggle = document.getElementById("themeToggle");
const currentMonthLabel = document.getElementById("currentMonth");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const viewModal = document.getElementById("viewModal");
const closeViewModal = document.getElementById("closeViewModal");
const viewDate = document.getElementById("viewDate");
const viewEmotions = document.getElementById("viewEmotions");
const viewText = document.getElementById("viewText");
const themeLabel = document.getElementById("themeLabel");

// Menu elements
const menuToggle = document.getElementById("menu-toggle");
const menuPanel = document.getElementById("menu-panel");
const backdrop = document.getElementById("menu-backdrop");
const menuGarden = document.getElementById("menuGarden");
const menuArchive = document.getElementById("menuArchive");
const menuCalendar = document.getElementById("menuCalendar");
const menuStats = document.getElementById("menuStats");
const menuLogout = document.getElementById("menuLogout");

/* -------------------
   STATE
------------------- */
let activeFilters = [];
let modalSelected = [];
let allEntries = [];
let currentUserId = localStorage.getItem("currentUserId") || "user123";
let currentDate = new Date();
let occupiedPositions = [];

/* -------------------
   ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ РОЗМІЩЕННЯ
------------------- */
function percentToPixels(percentX, percentY) {
    return {
        x: (percentX / 100) * GARDEN_WIDTH_PX,
        y: (percentY / 100) * GARDEN_HEIGHT_PX
    };
}

function checkCollision(pos1, pos2) {
    const pos1Px = percentToPixels(pos1.x, pos1.y);
    const pos2Px = percentToPixels(pos2.x, pos2.y);
    
    const distance = Math.sqrt(
        Math.pow(pos1Px.x - pos2Px.x, 2) + 
        Math.pow(pos1Px.y - pos2Px.y, 2)
    );
    
    return distance < MIN_DISTANCE_PX;
}

function isWithinBounds(position) {
    return position.x >= GARDEN_BOUNDS.minX && 
           position.x <= GARDEN_BOUNDS.maxX &&
           position.y >= GARDEN_BOUNDS.minY && 
           position.y <= GARDEN_BOUNDS.maxY;
}

function findFreePosition(basePosition, occupiedPositions, maxAttempts = 50) {
    let position = { ...basePosition };
    let attempts = 0;
    
    let hasCollision = occupiedPositions.some(occupiedPos => 
        checkCollision(position, occupiedPos)
    );
    
    if (!hasCollision && isWithinBounds(position)) {
        return position;
    }
    
    const angleStep = 15;
    const radiusStep = 2;
    let radius = 0;
    let angle = 0;
    
    while (attempts < maxAttempts) {
        if (angle >= 360) {
            radius += radiusStep;
            angle = 0;
        }
        
        const rad = angle * Math.PI / 180;
        const newX = basePosition.x + Math.cos(rad) * radius;
        const newY = basePosition.y + Math.sin(rad) * radius;
        
        position = { x: newX, y: newY };
        
        if (isWithinBounds(position)) {
            hasCollision = occupiedPositions.some(occupiedPos => 
                checkCollision(position, occupiedPos)
            );
            
            if (!hasCollision) {
                return position;
            }
        }
        
        angle += angleStep;
        attempts++;
    }
    
    return position;
}
/* -------------------
   ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ РОЗМІЩЕННЯ
------------------- */
function percentToPixels(percentX, percentY) {
    return {
        x: (percentX / 100) * GARDEN_WIDTH_PX,
        y: (percentY / 100) * GARDEN_HEIGHT_PX
    };
}

function checkCollision(pos1, pos2) {
    const pos1Px = percentToPixels(pos1.x, pos1.y);
    const pos2Px = percentToPixels(pos2.x, pos2.y);
    
    const distance = Math.sqrt(
        Math.pow(pos1Px.x - pos2Px.x, 2) + 
        Math.pow(pos1Px.y - pos2Px.y, 2)
    );
    
    return distance < MIN_DISTANCE_PX;
}

function isWithinBounds(position) {
    return position.x >= GARDEN_BOUNDS.minX && 
           position.x <= GARDEN_BOUNDS.maxX &&
           position.y >= GARDEN_BOUNDS.minY && 
           position.y <= GARDEN_BOUNDS.maxY;
}

function findFreePosition(basePosition, occupiedPositions, maxAttempts = 100) {
    let position = { ...basePosition };
    let attempts = 0;
    
    // Спочатку перевіряємо чи базова позиція вільна
    let hasCollision = occupiedPositions.some(occupiedPos => 
        checkCollision(position, occupiedPos)
    );
    
    if (!hasCollision && isWithinBounds(position)) {
        return position;
    }
    
    // Якщо позиція зайнята, шукаємо спіраллю
    const angleStep = 15; // градусів
    const radiusStep = 3; // відсотків
    let radius = 5; // починаємо з 5% радіусу
    let angle = 0;
    
    while (attempts < maxAttempts) {
        if (angle >= 360) {
            radius += radiusStep;
            angle = 0;
        }
        
        const rad = angle * Math.PI / 180;
        const newX = basePosition.x + Math.cos(rad) * radius;
        const newY = basePosition.y + Math.sin(rad) * radius;
        
        position = { x: newX, y: newY };
        
        if (isWithinBounds(position)) {
            hasCollision = occupiedPositions.some(occupiedPos => 
                checkCollision(position, occupiedPos)
            );
            
            if (!hasCollision) {
                return position;
            }
        }
        
        angle += angleStep;
        attempts++;
    }
    
    // Якщо не знайшли вільну позицію, повертаємо хоча б у межах саду
    position.x = Math.max(GARDEN_BOUNDS.minX, Math.min(GARDEN_BOUNDS.maxX, position.x));
    position.y = Math.max(GARDEN_BOUNDS.minY, Math.min(GARDEN_BOUNDS.maxY, position.y));
    return position;
}

/* -------------------
   GET FLOWER POSITION
------------------- */
function getFlowerPosition(emotion, dateString, entryId, emotionIndex) {
    const date = new Date(dateString);
    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    
    const basePos = basePositions[emotion] || { x: 50, y: 50 };
    
    // Більш унікальний хеш для кожного квітка
    const hash = entryId + emotionIndex * 100 + emotion.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const uniqueOffsetX = (Math.sin(hash * 0.1) * 10) + (dayOfMonth % 10) - 5;
    const uniqueOffsetY = (Math.cos(hash * 0.2) * 10) + (month * 3) - 6;
    
    let initialPosition = {
        x: basePos.x + uniqueOffsetX,
        y: basePos.y + uniqueOffsetY
    };
    
    // Гарантуємо що позиція в межах саду
    initialPosition.x = Math.max(GARDEN_BOUNDS.minX, 
                               Math.min(GARDEN_BOUNDS.maxX, initialPosition.x));
    initialPosition.y = Math.max(GARDEN_BOUNDS.minY, 
                               Math.min(GARDEN_BOUNDS.maxY, initialPosition.y));
    
    return initialPosition;
}
/* -------------------
   GET FLOWER POSITION
------------------- */
function getFlowerPosition(emotion, dateString, entryId, emotionIndex) {
    const date = new Date(dateString);
    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    
    const basePos = basePositions[emotion] || { x: 50, y: 50 };
    
    const hash = emotion.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const dayHash = dayOfMonth * 37 + month * 17 + hash + entryId + emotionIndex;
    
    const uniqueOffsetX = Math.sin(dayHash * 0.1) * 8;
    const uniqueOffsetY = Math.cos(dayHash * 0.2) * 8;
    
    let initialPosition = {
        x: basePos.x + uniqueOffsetX,
        y: basePos.y + uniqueOffsetY
    };
    
    initialPosition.x = Math.max(GARDEN_BOUNDS.minX, 
                               Math.min(GARDEN_BOUNDS.maxX, initialPosition.x));
    initialPosition.y = Math.max(GARDEN_BOUNDS.minY, 
                               Math.min(GARDEN_BOUNDS.maxY, initialPosition.y));
    
    return initialPosition;
}

/* -------------------
   RENDER GARDEN
------------------- */
/* -------------------
   RENDER GARDEN
------------------- */
function renderGarden() {
    console.log("Rendering garden...");
    garden.innerHTML = "";
    let filtered = [...allEntries];
    occupiedPositions = [];

    if (activeFilters.length > 0) {
        filtered = filtered.filter(entry => 
            entry.emotions.some(e => activeFilters.includes(e))
        );
    }

    filtered = filtered.filter(entry => {
        const d = new Date(entry.date);
        return d.getMonth() === currentDate.getMonth() && 
               d.getFullYear() === currentDate.getFullYear();
    });

    // Сортуємо за датою та ID для консистентності
    filtered.sort((a, b) => {
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        return a.id - b.id;
    });

    // Проходимо по всіх записах
    filtered.forEach(entry => {
        // Проходимо по всіх емоціях у записі
        entry.emotions.forEach((emotion, emotionIndex) => {
            // Отримуємо базову позицію
            let position = getFlowerPosition(emotion, entry.date, entry.id, emotionIndex);
            
            // Шукаємо вільну позицію
            position = findFreePosition(position, occupiedPositions);
            
            // Додаємо позицію до зайнятих
            occupiedPositions.push({ ...position });
            
            // Створюємо квітку
            createFlowerElement(entry, emotion, emotionIndex, position);
        });
    });

    if (filtered.length === 0) {
        showEmptyGardenMessage();
    }

    updateMonthAndStats();
}
/* -------------------
   CREATE FLOWER ELEMENT - БЕЗ КРУЖОЧКА
------------------- */
function createFlowerElement(entry, emotion, emotionIndex, position) {
    const flowerDiv = document.createElement("div");
    flowerDiv.className = "flower-entry";
    flowerDiv.dataset.entryId = entry.id;
    flowerDiv.dataset.emotion = emotion;
    
    const img = document.createElement("img");
    img.src = flowerImages[emotion] || "flowerimages/1.png";
    img.className = "flower";
    img.alt = emotion;
    img.style.setProperty('--i', emotionIndex);
    
    flowerDiv.style.left = `${position.x}%`;
    flowerDiv.style.top = `${position.y}%`;
    flowerDiv.style.transform = "translate(-50%, -50%)";
    
    const randomRotation = (entry.id + emotionIndex) % 20 - 10;
    img.style.transform += ` rotate(${randomRotation}deg)`;
    
    flowerDiv.appendChild(img);
    
    flowerDiv.onclick = (e) => {
        e.stopPropagation();
        openViewModal(entry);
    };
    
    const dateStr = new Date(entry.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    flowerDiv.title = `${dateStr}\n${emotion}\n"${entry.text.substring(0, 30)}${entry.text.length > 30 ? '...' : ''}"`;
    
    garden.appendChild(flowerDiv);
}

/* -------------------
   SHOW EMPTY GARDEN MESSAGE
------------------- */
function showEmptyGardenMessage() {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-garden";
    emptyMessage.innerHTML = `
        <p>No flowers in this month yet.</p>
        <p>Click the + button to add your first entry!</p>
    `;
    emptyMessage.style.position = "absolute";
    emptyMessage.style.top = "50%";
    emptyMessage.style.left = "50%";
    emptyMessage.style.transform = "translate(-50%, -50%)";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.color = "rgba(255, 255, 255, 0.7)";
    emptyMessage.style.fontSize = "18px";
    emptyMessage.style.padding = "20px";
    emptyMessage.style.background = "rgba(0, 0, 0, 0.1)";
    emptyMessage.style.borderRadius = "10px";
    garden.appendChild(emptyMessage);
}

/* -------------------
   INITIALIZE
------------------- */
function init() {
    console.log("Initializing app...");
    renderEmotionButtons();
    setupEventListeners();
    loadEntries();
    updateThemeLabel();
    updateMonthAndStats();
    
    // Автоматично встановити сьогоднішню дату у фільтрі
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const filterDateInput = document.getElementById("filterDate");
    if (filterDateInput) {
        filterDateInput.value = formattedDate;
    }
    
    console.log("App initialized with date:", formattedDate);
}

/* -------------------
   RENDER EMOTION BUTTONS
------------------- */
function renderEmotionButtons() {
    emotionList.forEach(e => {
        const btn = document.createElement("div");
        btn.className = "emotion";
        btn.textContent = e;
        btn.onclick = () => toggleFilterEmotion(btn, e);
        filterContainer.appendChild(btn);

        const mbtn = document.createElement("div");
        mbtn.className = "emotion";
        mbtn.textContent = e;
        mbtn.onclick = () => toggleModalEmotion(mbtn, e);
        modalEmotionContainer.appendChild(mbtn);
    });
}

/* -------------------
   TOGGLE EMOTIONS
------------------- */
function toggleFilterEmotion(btn, emotion) {
    btn.classList.toggle("active");
    if (activeFilters.includes(emotion)) {
        activeFilters = activeFilters.filter(e => e !== emotion);
    } else {
        activeFilters.push(emotion);
    }
    renderGarden();
}

function toggleModalEmotion(btn, emotion) {
    btn.classList.toggle("active");
    if (modalSelected.includes(emotion)) {
        modalSelected = modalSelected.filter(e => e !== emotion);
    } else {
        modalSelected.push(emotion);
    }
}

/* -------------------
   SETUP EVENT LISTENERS - ВИПРАВЛЯЄМО ДОДАВАННЯ
------------------- */
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Перевіряємо чи знайдені всі елементи
    console.log("Add button found:", !!addBtn);
    console.log("Modal found:", !!modal);
    console.log("Save button found:", !!saveModal);
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.onclick = toggleTheme;
    }
    
    // Menu
    if (menuToggle) {
        menuToggle.addEventListener("click", toggleMenu);
    }
    
    if (backdrop) {
        backdrop.addEventListener("click", closeMenu);
    }
    
    // ESC to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
    
    // Menu navigation
    if (menuGarden) menuGarden.addEventListener("click", () => {
        closeMenu();
        window.location.href = "garden.html";
    });
    
    if (menuArchive) menuArchive.addEventListener("click", () => {
        closeMenu();
        window.location.href = "archive.html";
    });
    
    if (menuCalendar) menuCalendar.addEventListener("click", () => {
        closeMenu();
        window.location.href = "calendar.html";
    });
    
    if (menuStats) menuStats.addEventListener("click", () => {
        closeMenu();
        window.location.href = "stats.html";
    });
    
    if (menuLogout) menuLogout.addEventListener("click", logout);
    
    // Add button - ФІКСУЄМО!
    if (addBtn) {
        console.log("Setting up add button click handler");
        addBtn.addEventListener("click", openAddModal);
    } else {
        console.error("Add button not found!");
    }
    
    // Modal buttons
    if (cancelModal) {
        cancelModal.addEventListener("click", closeAddModal);
    }
    
    if (saveModal) {
        saveModal.addEventListener("click", saveEntry);
    }
    
    // Month navigation
    if (prevMonthBtn) prevMonthBtn.addEventListener("click", goToPrevMonth);
    if (nextMonthBtn) nextMonthBtn.addEventListener("click", goToNextMonth);
    
    // View modal
    if (closeViewModal) closeViewModal.addEventListener("click", closeViewModalFunc);
    
    window.addEventListener("click", (e) => {
        if (e.target === viewModal) closeViewModalFunc();
    });
    
    // Filter date
    const filterDate = document.getElementById("filterDate");
    if (filterDate) {
        filterDate.addEventListener("change", (e) => {
            const selectedDate = new Date(e.target.value);
            if (!isNaN(selectedDate.getTime())) {
                currentDate = selectedDate;
                renderGarden();
            }
        });
    }
    
    console.log("Event listeners setup complete");
}

/* -------------------
   MENU FUNCTIONS
------------------- */
function toggleMenu() {
    menuPanel.classList.toggle("active");
    backdrop.classList.toggle("active");
}

function closeMenu() {
    menuPanel.classList.remove("active");
    backdrop.classList.remove("active");
}

/* -------------------
   MODAL FUNCTIONS - ВИПРАВЛЯЄМО!
------------------- */
function openAddModal() {
    console.log("openAddModal called");
    if (!currentUserId) {
        alert("Please log in first");
        return;
    }
    console.log("Opening modal...");
    modal.style.display = "flex";
    modal.classList.add("active");
    noteText.value = "";
    modalSelected = [];
    document.querySelectorAll(".modal-emotions .emotion").forEach(b => b.classList.remove("active"));
    console.log("Modal opened successfully");
}

function closeAddModal() {
    console.log("closeAddModal called");
    modal.style.display = "none";
    modal.classList.remove("active");
}

function saveEntry() {
    console.log("saveEntry called");
    if (!currentUserId) {
        alert("Please log in first");
        return;
    }
    if (modalSelected.length === 0) {
        alert("Select at least 1 emotion.");
        return;
    }
    const text = noteText.value.trim();
    if (!text) {
        alert("Write something.");
        return;
    }

    const entry = {
        id: Date.now(),
        userId: currentUserId,
        emotions: [...modalSelected],
        text: text,
        date: new Date().toISOString()
    };
    
    console.log("Saving entry:", entry);
    allEntries.push(entry);
    localStorage.setItem('gardenEntries', JSON.stringify(allEntries));
    
    closeAddModal();
    renderGarden();
    console.log("Entry saved successfully");
}

/* -------------------
   LOAD ENTRIES
------------------- */
function loadEntries() {
    console.log("Loading entries...");
    if (!currentUserId) return;
    
    const saved = localStorage.getItem('gardenEntries');
    if (saved) {
        allEntries = JSON.parse(saved);
        console.log("Loaded entries from localStorage:", allEntries.length);
    } else {
        const today = new Date();
        const sampleEntries = [
            {
                id: 1,
                userId: currentUserId,
                emotions: ["happiness", "joy"],
                text: "Had a wonderful day with friends!",
                date: new Date(today.getFullYear(), today.getMonth(), 5, 10, 30).toISOString()
            },
            {
                id: 2,
                userId: currentUserId,
                emotions: ["happiness", "calmness"],
                text: "Feeling peaceful after meditation",
                date: new Date(today.getFullYear(), today.getMonth(), 10, 14, 20).toISOString()
            },
            {
                id: 3,
                userId: currentUserId,
                emotions: ["love", "trust"],
                text: "Spent quality time with family",
                date: new Date(today.getFullYear(), today.getMonth(), 15, 18, 45).toISOString()
            }
        ];
        
        allEntries = sampleEntries;
        localStorage.setItem('gardenEntries', JSON.stringify(allEntries));
        console.log("Created sample entries:", allEntries.length);
    }
    
    renderGarden();
}

/* -------------------
   VIEW MODAL
------------------- */
function openViewModal(entry) {
    console.log("Opening view modal for entry:", entry.id);
    viewDate.textContent = new Date(entry.date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    viewEmotions.textContent = entry.emotions.join(", ");
    viewText.textContent = entry.text;
    viewModal.style.display = "flex";
    viewModal.classList.add("active");
}

function closeViewModalFunc() {
    viewModal.style.display = "none";
    viewModal.classList.remove("active");
}

/* -------------------
   MONTH FUNCTIONS
------------------- */
function updateMonthAndStats() {
    currentMonthLabel.textContent = currentDate.toLocaleString("en", { 
        month: "long", 
        year: "numeric" 
    });

    const monthEntries = allEntries.filter(entry => {
        const d = new Date(entry.date);
        return d.getMonth() === currentDate.getMonth() && 
               d.getFullYear() === currentDate.getFullYear();
    });

    const statTotal = document.getElementById("statTotal");
    const statMonth = document.getElementById("statMonth");
    
    if (statTotal) statTotal.textContent = monthEntries.length;
    if (statMonth) statMonth.textContent = currentDate.toLocaleString("en", { month: "long" });
}

function goToPrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderGarden();
}

function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderGarden();
}

/* -------------------
   THEME FUNCTIONS
------------------- */
function toggleTheme() {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeLabel();
}

function updateThemeLabel() {
    if (!themeLabel) return;
    const isDark = document.body.classList.contains("dark");
    themeLabel.textContent = isDark ? "Dark" : "Light";
}

/* -------------------
   LOGOUT
------------------- */
function logout() {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("theme");
    localStorage.removeItem("gardenEntries");
    alert("You have been logged out");
    window.location.href = "login_html";
}

/* -------------------
   DEBUG FUNCTIONS
------------------- */
function debugApp() {
    console.log("=== DEBUG INFO ===");
    console.log("All entries:", allEntries);
    console.log("Active filters:", activeFilters);
    console.log("Modal selected:", modalSelected);
    console.log("Current date:", currentDate);
    console.log("Occupied positions:", occupiedPositions);
    console.log("=== END DEBUG ===");
}

/* -------------------
   INITIALIZE APP
------------------- */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    
    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
    
    // Initialize
    init();
    
    // Add debug to window
    window.debugApp = debugApp;
    
    console.log("App initialized successfully");
});