// EMOTION CONFIGURATION
const emotionColors = {
    happiness: '#FFD166',
    joy: '#06D6A0',
    calmness: '#118AB2',
    acceptance: '#073B4C',
    love: '#EF476F',
    trust: '#7209B7',
    surprise: '#F3722C',
    admiration: '#90BE6D',
    interest: '#577590'
};

const emotionNames = {
    happiness: "Happiness",
    joy: "Joy",
    calmness: "Calmness",
    acceptance: "Acceptance",
    love: "Love",
    trust: "Trust",
    surprise: "Surprise",
    admiration: "Admiration",
    interest: "Interest"
};

// STATE
let allEntries = [];
let timeFilter = 'all';
let emotionChart = null;
let monthlyChart = null;

// DOM ELEMENTS
const totalEntriesEl = document.getElementById('totalEntries');
const totalFlowersEl = document.getElementById('totalFlowers');
const activeDaysEl = document.getElementById('activeDays');
const topEmotionEl = document.getElementById('topEmotion');

// INSIGHTS
const patternInsightEl = document.getElementById('patternInsight');
const timeInsightEl = document.getElementById('timeInsight');
const growthInsightEl = document.getElementById('growthInsight');

// DETAILED STATS
const emotionFrequencyEl = document.getElementById('emotionFrequency');
const recentActivityEl = document.getElementById('recentActivity');
const achievementsEl = document.getElementById('achievements');

// MENU ELEMENTS
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const backdrop = document.getElementById('menu-backdrop');
const menuGarden = document.getElementById('menuGarden');
const menuArchive = document.getElementById('menuArchive');
const menuStats = document.getElementById('menuStats');
const menuLogout = document.getElementById('menuLogout');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

// INITIALIZE
function init() {
    loadEntries();
    setupEventListeners();
    renderAllStats();
    setupCharts();
}

// LOAD ENTRIES
function loadEntries() {
    const saved = localStorage.getItem('gardenEntries');
    if (saved) {
        allEntries = JSON.parse(saved);
        console.log(`Loaded ${allEntries.length} entries for statistics`);
    } else {
        allEntries = [];
        console.log('No entries found for statistics');
    }
}

// FILTER ENTRIES BY TIME PERIOD
function getFilteredEntries() {
    const now = new Date();
    
    switch(timeFilter) {
        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return allEntries.filter(entry => new Date(entry.date) >= weekAgo);
            
        case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return allEntries.filter(entry => new Date(entry.date) >= monthAgo);
            
        case 'year':
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return allEntries.filter(entry => new Date(entry.date) >= yearAgo);
            
        case 'all':
        default:
            return allEntries;
    }
}

// CALCULATE STATISTICS
function calculateStats(entries) {
    if (entries.length === 0) {
        return {
            totalEntries: 0,
            totalFlowers: 0,
            activeDays: 0,
            emotionCounts: {},
            daysByMonth: {},
            heatmapData: {},
            insights: {}
        };
    }
    
    // Basic counts
    const totalEntries = entries.length;
    const totalFlowers = entries.reduce((sum, entry) => sum + entry.emotions.length, 0);
    
    // Count unique days
    const uniqueDays = new Set(entries.map(entry => {
        const date = new Date(entry.date);
        return date.toDateString();
    })).size;
    
    // Emotion frequency
    const emotionCounts = {};
    entries.forEach(entry => {
        entry.emotions.forEach(emotion => {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
    });
    
    // Monthly activity
    const daysByMonth = {};
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        daysByMonth[monthYear] = (daysByMonth[monthYear] || 0) + 1;
    });
    
    // Heatmap data (last 365 days)
    const heatmapData = {};
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        heatmapData[dateKey] = 0;
    }
    
    entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const dateKey = entryDate.toISOString().split('T')[0];
        if (heatmapData[dateKey] !== undefined) {
            heatmapData[dateKey] += 1;
        }
    });
    
    // Calculate insights
    const insights = calculateInsights(entries, emotionCounts);
    
    return {
        totalEntries,
        totalFlowers,
        activeDays: uniqueDays,
        emotionCounts,
        daysByMonth,
        heatmapData,
        insights
    };
}

// CALCULATE INSIGHTS
function calculateInsights(entries, emotionCounts) {
    if (entries.length === 0) {
        return {
            pattern: "Start writing to discover your emotional patterns!",
            time: "Write at different times to see when you're most active.",
            growth: "Your journey begins with the first entry!"
        };
    }
    
    // Find top emotion
    const topEmotion = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)[0];
    
    // Analyze time patterns
    const hourCounts = {};
    entries.forEach(entry => {
        const hour = new Date(entry.date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const topHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0];
    
    // Calculate growth (last month vs previous month)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    const lastMonthEntries = entries.filter(entry => {
        const date = new Date(entry.date);
        return date >= lastMonth && date < now;
    });
    
    const prevMonthEntries = entries.filter(entry => {
        const date = new Date(entry.date);
        return date >= twoMonthsAgo && date < lastMonth;
    });
    
    const growth = lastMonthEntries.length - prevMonthEntries.length;
    const growthPercent = prevMonthEntries.length > 0 
        ? Math.round((growth / prevMonthEntries.length) * 100)
        : lastMonthEntries.length > 0 ? 100 : 0;
    
    return {
        pattern: `Your most frequent emotion is ${emotionNames[topEmotion[0]] || topEmotion[0]}, appearing ${topEmotion[1]} times.`,
        time: `You're most active around ${topHour[0]}:00, with ${topHour[1]} entries during that hour.`,
        growth: growth >= 0 
            ? `Great progress! You wrote ${growth} more entries this month (${growthPercent}% increase).`
            : `You wrote ${Math.abs(growth)} fewer entries this month.`
    };
}

// RENDER ALL STATISTICS
function renderAllStats() {
    const entries = getFilteredEntries();
    const stats = calculateStats(entries);
    
    // Update overview cards
    totalEntriesEl.textContent = stats.totalEntries;
    totalFlowersEl.textContent = stats.totalFlowers;
    activeDaysEl.textContent = stats.activeDays;
    
    // Find top emotion
    if (stats.totalEntries > 0) {
        const topEmotion = Object.entries(stats.emotionCounts)
            .sort(([,a], [,b]) => b - a)[0];
        topEmotionEl.textContent = emotionNames[topEmotion[0]] || topEmotion[0];
    } else {
        topEmotionEl.textContent = '-';
    }
    
    // Update insights
    patternInsightEl.textContent = stats.insights.pattern;
    timeInsightEl.textContent = stats.insights.time;
    growthInsightEl.textContent = stats.insights.growth;
    
    // Render detailed stats
    renderEmotionFrequency(stats.emotionCounts);
    renderRecentActivity(entries);
    renderAchievements(stats);
    renderHeatmap(stats.heatmapData);
    
    // Update charts
    updateCharts(stats);
}

// RENDER EMOTION FREQUENCY
function renderEmotionFrequency(emotionCounts) {
    emotionFrequencyEl.innerHTML = '';
    
    if (Object.keys(emotionCounts).length === 0) {
        emotionFrequencyEl.innerHTML = '<p class="no-data">No emotions recorded yet</p>';
        return;
    }
    
    // Sort by frequency
    const sortedEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a);
    
    // Calculate total for percentages
    const total = sortedEmotions.reduce((sum, [,count]) => sum + count, 0);
    
    sortedEmotions.forEach(([emotion, count]) => {
        const percentage = Math.round((count / total) * 100);
        
        const item = document.createElement('div');
        item.className = 'emotion-item';
        
        item.innerHTML = `
            <div class="emotion-name">
                <span class="emotion-dot" style="background: ${emotionColors[emotion] || '#999'}"></span>
                ${emotionNames[emotion] || emotion}
            </div>
            <div>
                <span class="emotion-count">${count}</span>
                <div class="emotion-bar">
                    <div class="emotion-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
        
        emotionFrequencyEl.appendChild(item);
    });
}

// RENDER RECENT ACTIVITY
function renderRecentActivity(entries) {
    recentActivityEl.innerHTML = '';
    
    if (entries.length === 0) {
        recentActivityEl.innerHTML = '<p class="no-data">No recent activity</p>';
        return;
    }
    
    // Get 5 most recent entries
    const recentEntries = [...entries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentEntries.forEach(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        item.innerHTML = `
            <div class="activity-date">${dateStr}</div>
            <div class="activity-content">
                <div class="activity-emotions">${entry.emotions.map(e => emotionNames[e] || e).join(', ')}</div>
                <div class="activity-preview">${entry.text.substring(0, 60)}${entry.text.length > 60 ? '...' : ''}</div>
            </div>
        `;
        
        recentActivityEl.appendChild(item);
    });
}

// RENDER ACHIEVEMENTS
function renderAchievements(stats) {
    achievementsEl.innerHTML = '';
    
    const achievements = [
        {
            id: 'first_entry',
            title: 'First Entry',
            description: 'Write your first journal entry',
            icon: '✍️',
            check: (stats) => stats.totalEntries >= 1,
            progress: (stats) => Math.min(stats.totalEntries, 1)
        },
        {
            id: 'emotion_explorer',
            title: 'Emotion Explorer',
            description: 'Record 5 different emotions',
            icon: '🌸',
            check: (stats) => Object.keys(stats.emotionCounts).length >= 5,
            progress: (stats) => Math.min(Object.keys(stats.emotionCounts).length, 5)
        },
        {
            id: 'weekly_writer',
            title: 'Weekly Writer',
            description: 'Write for 7 consecutive days',
            icon: '📅',
            check: (stats) => stats.activeDays >= 7,
            progress: (stats) => Math.min(stats.activeDays, 7)
        },
        {
            id: 'flower_gardener',
            title: 'Flower Gardener',
            description: 'Grow 25 flowers total',
            icon: '🌼',
            check: (stats) => stats.totalFlowers >= 25,
            progress: (stats) => Math.min(stats.totalFlowers, 25)
        },
        {
            id: 'emotional_balance',
            title: 'Emotional Balance',
            description: 'Record at least 3 positive emotions',
            icon: '⚖️',
            check: (stats) => {
                const positiveEmotions = ['happiness', 'joy', 'calmness', 'love', 'admiration'];
                return positiveEmotions.some(e => stats.emotionCounts[e] >= 3);
            },
            progress: (stats) => {
                const positiveEmotions = ['happiness', 'joy', 'calmness', 'love', 'admiration'];
                const maxCount = Math.max(...positiveEmotions.map(e => stats.emotionCounts[e] || 0));
                return Math.min(maxCount, 3);
            }
        }
    ];
    
    achievements.forEach(achievement => {
        const completed = achievement.check(stats);
        const progress = achievement.progress(stats);
        const max = typeof achievement.progress(stats) === 'number' ? 
            (achievement.id === 'first_entry' ? 1 : 
             achievement.id === 'emotion_explorer' ? 5 :
             achievement.id === 'weekly_writer' ? 7 :
             achievement.id === 'flower_gardener' ? 25 : 3) : 1;
        
        const percentage = Math.round((progress / max) * 100);
        
        const item = document.createElement('div');
        item.className = 'achievement-item';
        if (completed) {
            item.classList.add('completed');
        }
        
        item.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-progress">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
        
        achievementsEl.appendChild(item);
    });
}

// RENDER HEATMAP
function renderHeatmap(heatmapData) {
    const heatmapEl = document.getElementById('heatmap');
    heatmapEl.innerHTML = '';
    
    // Create 52 weeks (columns) x 7 days (rows) grid
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // 52 weeks * 7 days - 1
    
    // Fill heatmap
    for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        const count = heatmapData[dateKey] || 0;
        
        const dayEl = document.createElement('div');
        dayEl.className = 'heatmap-day';
        dayEl.dataset.count = Math.min(count, 4); // Cap at 4 for color scale
        dayEl.dataset.tooltip = `${date.toLocaleDateString()}: ${count} ${count === 1 ? 'entry' : 'entries'}`;
        
        heatmapEl.appendChild(dayEl);
    }
}

// SETUP CHARTS
function setupCharts() {
    // Emotion Distribution Chart
    const emotionCtx = document.getElementById('emotionChart').getContext('2d');
    emotionChart = new Chart(emotionCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            family: "'Ysabeau Infant', sans-serif"
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw} (${context.parsed}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
    
    // Monthly Activity Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Entries',
                data: [],
                borderColor: '#8FA38B',
                backgroundColor: 'rgba(143, 163, 139, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}

// UPDATE CHARTS WITH DATA
function updateCharts(stats) {
    // Update Emotion Chart
    const emotionEntries = Object.entries(stats.emotionCounts)
        .sort(([,a], [,b]) => b - a);
    
    emotionChart.data.labels = emotionEntries.map(([emotion]) => emotionNames[emotion] || emotion);
    emotionChart.data.datasets[0].data = emotionEntries.map(([,count]) => count);
    emotionChart.data.datasets[0].backgroundColor = emotionEntries.map(([emotion]) => emotionColors[emotion] || '#999');
    emotionChart.update();
    
    // Update Monthly Chart
    const monthEntries = Object.entries(stats.daysByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6); // Last 6 months
    
    monthlyChart.data.labels = monthEntries.map(([month]) => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short' });
    });
    monthlyChart.data.datasets[0].data = monthEntries.map(([,count]) => count);
    monthlyChart.update();
}

// SETUP EVENT LISTENERS
function setupEventListeners() {
    // Menu (same as other pages)
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
    
    if (menuStats) menuStats.addEventListener('click', () => {
        closeMenu();
        window.location.href = 'stats.html';
    });
    
    if (menuLogout) menuLogout.addEventListener('click', logout);
    
    // Theme
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Time filters
    document.querySelectorAll('.time-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.time-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter and re-render
            timeFilter = this.dataset.period;
            renderAllStats();
        });
    });
    
    // Export buttons
    document.getElementById('exportJson')?.addEventListener('click', exportJson);
    document.getElementById('exportCsv')?.addEventListener('click', exportCsv);
    document.getElementById('printStats')?.addEventListener('click', printStats);
    
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

// EXPORT FUNCTIONS
function exportJson() {
    const data = {
        entries: allEntries,
        statistics: calculateStats(allEntries),
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garden-statistics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Statistics exported as JSON!');
}

function exportCsv() {
    if (allEntries.length === 0) {
        alert('No data to export');
        return;
    }
    
    let csv = 'Date,Emotions,Text\n';
    allEntries.forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString();
        const emotions = entry.emotions.join('; ');
        const text = entry.text.replace(/"/g, '""');
        csv += `"${date}","${emotions}","${text}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garden-entries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Data exported as CSV!');
}

function printStats() {
    window.print();
}

// REFRESH ON RESIZE
window.addEventListener('resize', () => {
    if (emotionChart) emotionChart.resize();
    if (monthlyChart) monthlyChart.resize();
});

// START THE APP
document.addEventListener('DOMContentLoaded', init);

// DEBUG FUNCTION
window.debugStats = function() {
    console.log('=== STATS DEBUG ===');
    console.log('Total entries:', allEntries.length);
    console.log('Time filter:', timeFilter);
    
    const entries = getFilteredEntries();
    const stats = calculateStats(entries);
    console.log('Current stats:', stats);
    
    console.log('=== END DEBUG ===');
};