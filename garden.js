/* -------------------
   EMOTIONS
------------------- */
const emotionList = [
    "happiness", "joy", "calmness", "acceptance", "love",
    "trust", "surprise", "admiration", "interest"
];

const flowerImages = {
    happiness: "images/flowers/happy.png",
    joy: "images/flowers/joy.png",
    calmness: "images/flowers/calm.png",
    acceptance: "images/flowers/acceptance.png",
    love: "images/flowers/love.png",
    trust: "images/flowers/trust.png",
    surprise: "images/flowers/surprise.png",
    admiration: "images/flowers/admiration.png",
    interest: "images/flowers/interest.png"
};

/* -------------------
   ELEMENTS
------------------- */
const filterContainer = document.getElementById("filterEmotions");
const modalEmotionContainer = document.getElementById("modalEmotions");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const cancelModal = document.getElementById("cancelModal");
const saveModal = document.getElementById("saveModal");
const noteText = document.getElementById("noteText");
const garden = document.getElementById("garden");
const logoutBtn = document.getElementById("logoutBtn");
const themeToggle = document.getElementById("themeToggle");
const currentMonthLabel = document.getElementById("currentMonth");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const viewModal = document.getElementById("viewModal");
const closeViewModal = document.getElementById("closeViewModal");
const viewDate = document.getElementById("viewDate");
const viewEmotions = document.getElementById("viewEmotions");
const viewText = document.getElementById("viewText");

/* -------------------
   STATE
------------------- */
let activeFilters = [];
let modalSelected = [];
let allEntries = [];
let currentUserId = localStorage.getItem("currentUserId");
let currentDate = new Date(); // поточний місяць

/* -------------------
   RENDER EMOTIONS
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
renderEmotionButtons();

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
   MODAL OPEN/CLOSE
------------------- */
addBtn.onclick = () => {
    if (!currentUserId) {
        alert("Please log in first");
        return;
    }
    modal.style.display = "flex";
    noteText.value = "";
    modalSelected = [];
    document.querySelectorAll(".modal-emotions .emotion").forEach(b => b.classList.remove("active"));
};

cancelModal.onclick = () => modal.style.display = "none";

saveModal.onclick = async () => {
    if (!currentUserId) { alert("Please log in first"); return; }
    if (modalSelected.length === 0) { alert("Select at least 1 emotion."); return; }
    const text = noteText.value.trim();
    if (!text) { alert("Write something."); return; }

    const entry = { userId: currentUserId, emotions: modalSelected, text, date: new Date().toISOString() };
    try {
        await fetch("/add-entry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry)
        });
        modal.style.display = "none";
        await loadEntries();
    } catch (err) { console.error("Save error:", err); }
};

/* -------------------
   LOAD ENTRIES
------------------- */
async function loadEntries() {
    if (!currentUserId) return;
    try {
        const res = await fetch(`/entries?userId=${currentUserId}`);
        allEntries = await res.json();
        renderGarden();
    } catch (err) { console.error("Load error:", err); }
}
loadEntries();

/* -------------------
   VIEW MODAL
------------------- */
function openViewModal(entry) {
    viewDate.textContent = new Date(entry.date).toLocaleString();
    viewEmotions.textContent = entry.emotions.join(", ");
    viewText.textContent = entry.text;
    viewModal.style.display = "flex";
}

closeViewModal.onclick = () => viewModal.style.display = "none";
window.addEventListener("click", (e) => { if (e.target === viewModal) viewModal.style.display = "none"; });

/* -------------------
   UPDATE MONTH LABEL & STATS
------------------- */
function updateMonthAndStats() {
    // оновлюємо текст місяця
    currentMonthLabel.textContent = currentDate.toLocaleString("en", { month: "long", year: "numeric" });

    // обчислюємо записи поточного місяця
    const monthEntries = allEntries.filter(entry => {
        const d = new Date(entry.date);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });

    document.getElementById("statTotal").textContent = monthEntries.length;
    document.getElementById("statMonth").textContent = currentDate.toLocaleString("en", { month: "long" });
    document.getElementById("statMonth2").textContent = currentDate.toLocaleString("en", { month: "long" });
}

/* -------------------
   MONTH NAVIGATION
------------------- */
prevMonthBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderGarden();
};

nextMonthBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderGarden();
};

/* -------------------
   RENDER GARDEN
------------------- */
function renderGarden() {
    garden.innerHTML = "";
    let filtered = [...allEntries];

    // фільтр за емоціями
    if (activeFilters.length > 0) {
        filtered = filtered.filter(entry => entry.emotions.some(e => activeFilters.includes(e)));
    }

    // фільтр за місяцем
    filtered = filtered.filter(entry => {
        const d = new Date(entry.date);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });

    filtered.forEach(entry => {
        const bouquet = document.createElement("div");
        bouquet.style.position = "absolute";
        bouquet.style.left = Math.random() * 85 + "%";
        bouquet.style.top = Math.random() * 85 + "%";
        bouquet.style.cursor = "pointer";

        entry.emotions.forEach(em => {
            const img = document.createElement("img");
            img.src = flowerImages[em];
            img.className = "flower";
            img.style.width = "40px";
            img.style.marginLeft = "-10px";
            img.style.marginTop = "-10px";
            bouquet.appendChild(img);
        });

        bouquet.onclick = () => openViewModal(entry);
        garden.appendChild(bouquet);
    });
    updateMonthAndStats();
    updateStats();
}

/* -------------------
   UPDATE STATS
------------------- */
function updateStats() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const monthEntries = allEntries.filter(entry => {
        const d = new Date(entry.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });

    document.getElementById("statTotal").textContent = monthEntries.length;
    document.getElementById("statMonth").textContent = currentDate.toLocaleString("en", { month: "long" });
    document.getElementById("statMonth2").textContent = currentDate.toLocaleString("en", { month: "long" });
}

/* -------------------
   LOGOUT
------------------- */
logoutBtn.onclick = () => {
    localStorage.removeItem("currentUserId");
    currentUserId = null;
    window.location.href = "log_in.html";
};

/* -------------------
   THEME TOGGLE
------------------- */
themeToggle.onclick = () => document.body.classList.toggle("dark");
