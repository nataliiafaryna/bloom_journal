const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

const flowerImages = [
    "flowerimages/1.png",
    "flowerimages/2.png",
    "flowerimages/3.png",
    "flowerimages/4.png",
    "flowerimages/5.png",
    "flowerimages/6.png",
    "flowerimages/7.png",
    "flowerimages/8.png",
    "flowerimages/9.png",
    "flowerimages/10.png",
];

// Today
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// DOM elements
const monthName = document.getElementById("monthName");
const dateRange = document.getElementById("dateRange");
const gardenBox = document.getElementById("flowerGrid");
const prev = document.getElementById("prevMonth");
const next = document.getElementById("nextMonth");

// Modal
const modal = document.getElementById("modal");
const monthList = document.getElementById("monthList");
const closePicker = document.getElementById("closePicker");

// Data storage for user's flowers
let userGarden = JSON.parse(localStorage.getItem('userGarden')) || {};

// Initialize current month in storage if not exists
const currentMonthKey = `${currentYear}-${currentMonth}`;
if (!userGarden[currentMonthKey]) {
    userGarden[currentMonthKey] = {
        flowers: [],
        positions: []
    };
    saveGardenData();
}

// CLICK ON MONTH NAME → open modal
document.querySelector(".month-title").onclick = () => modal.classList.remove("hidden");

// Build month list
months.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = "month-item";
    div.innerText = m;

    // Disable future months
    const isFutureMonth = currentYear === currentDate.getFullYear() ? i > currentDate.getMonth() : currentYear > currentDate.getFullYear();
    if (isFutureMonth) {
        div.classList.add("disabled");
    } else {
        div.onclick = () => {
            currentMonth = i;
            renderPage();
            modal.classList.add("hidden");
        };
    }

    monthList.appendChild(div);
});

closePicker.onclick = () => modal.classList.add("hidden");

// Next/Prev Month
prev.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderPage();
};

next.onclick = () => {
    // Don't allow navigating to future months
    const nextMonth = currentMonth + 1;
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
    const adjustedNextMonth = nextMonth % 12;
    
    if (nextYear > currentDate.getFullYear() || 
        (nextYear === currentDate.getFullYear() && adjustedNextMonth > currentDate.getMonth())) {
        return; // Don't navigate to future
    }
    
    currentMonth = adjustedNextMonth;
    currentYear = nextYear;
    renderPage();
};

// Days in month
function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

// Save garden data to localStorage
function saveGardenData() {
    localStorage.setItem('userGarden', JSON.stringify(userGarden));
}

// Generate fixed positions that don't overlap
function generateNonOverlappingPositions(count, containerWidth, containerHeight, itemWidth, itemHeight) {
    const positions = [];
    const margin = 10; // Minimum margin between flowers
    
    for (let i = 0; i < count; i++) {
        let attempts = 0;
        let position;
        let overlapping;
        
        do {
            overlapping = false;
            position = {
                x: Math.random() * (containerWidth - itemWidth),
                y: Math.random() * (containerHeight - itemHeight)
            };
            
            // Check if this position overlaps with any existing position
            for (const existingPos of positions) {
                const horizontalOverlap = 
                    Math.abs(position.x - existingPos.x) < itemWidth + margin;
                const verticalOverlap = 
                    Math.abs(position.y - existingPos.y) < itemHeight + margin;
                    
                if (horizontalOverlap && verticalOverlap) {
                    overlapping = true;
                    break;
                }
            }
            
            attempts++;
        } while (overlapping && attempts < 100); // Prevent infinite loop
        
        positions.push(position);
    }
    
    return positions;
}

// Add a flower to current month (simulate user earning a flower)
function addFlowerToCurrentMonth() {
    const monthKey = `${currentYear}-${currentMonth}`;
    
    if (!userGarden[monthKey]) {
        userGarden[monthKey] = {
            flowers: [],
            positions: []
        };
    }
    
    // Add a random flower
    const randomFlower = flowerImages[Math.floor(Math.random() * flowerImages.length)];
    userGarden[monthKey].flowers.push(randomFlower);
    
    // Generate new positions for all flowers in this month
    const containerWidth = gardenBox.clientWidth - 90; // Account for flower width
    const containerHeight = gardenBox.clientHeight - 90; // Account for flower height
    
    userGarden[monthKey].positions = generateNonOverlappingPositions(
        userGarden[monthKey].flowers.length,
        containerWidth,
        containerHeight,
        90, // flower width
        90  // flower height
    );
    
    saveGardenData();
    renderGarden();
}

// Render garden based on current month
function renderGarden() {
    gardenBox.innerHTML = "";
    
    const monthKey = `${currentYear}-${currentMonth}`;
    const monthData = userGarden[monthKey];
    
    // Check if this is a future month
    const isFutureMonth = currentYear > currentDate.getFullYear() || 
        (currentYear === currentDate.getFullYear() && currentMonth > currentDate.getMonth());
    
    if (isFutureMonth) {
        // Show empty state for future months
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "empty-garden";
        emptyMsg.textContent = "Цей місяць ще не настав. Заповнюйте щоденник щодня, щоб отримувати квітки!";
        gardenBox.appendChild(emptyMsg);
        return;
    }
    
    if (!monthData || monthData.flowers.length === 0) {
        // Show empty state for months with no flowers
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "empty-garden";
        emptyMsg.textContent = "У цьому місяці ще немає квітів. Заповнюйте щоденник щодня!";
        gardenBox.appendChild(emptyMsg);
        return;
    }
    
    // Render flowers at their fixed positions
    let delay = 0;
    
    monthData.flowers.forEach((flowerSrc, index) => {
        const img = document.createElement("img");
        img.className = "flower";
        img.src = flowerSrc;
        
        // Use the stored position
        if (monthData.positions && monthData.positions[index]) {
            img.style.left = monthData.positions[index].x + "px";
            img.style.top = monthData.positions[index].y + "px";
        }
        
        img.style.setProperty("--delay", `${delay}s`);
        
        gardenBox.appendChild(img);
        
        // Add wind animation after appearance
        setTimeout(() => {
            img.classList.add("wind");
        }, (delay + 0.9) * 1000);
        
        delay += 0.15;
    });
}

function renderPage() {
    monthName.textContent = months[currentMonth];
    
    const days = getDaysInMonth(currentMonth, currentYear);
    dateRange.textContent = `1–${days}/${currentMonth + 1}/${currentYear}`;
    
    renderGarden();
    
    // Update button states
    prev.disabled = false;
    
    // Disable next button if it would go to future
    const nextMonth = currentMonth + 1;
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
    const adjustedNextMonth = nextMonth % 12;
    
    if (nextYear > currentDate.getFullYear() || 
        (nextYear === currentDate.getFullYear() && adjustedNextMonth > currentDate.getMonth())) {
        next.disabled = true;
    } else {
        next.disabled = false;
    }
}

// Demo: Add a flower when clicking on the garden (remove this in production)
gardenBox.addEventListener('click', function(e) {
    if (!e.target.classList.contains('flower')) {
        addFlowerToCurrentMonth();
    }
});

// Initialize
renderPage();