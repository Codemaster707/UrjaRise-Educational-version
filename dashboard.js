const demoStudents = [
    { rank: 1, name: "Ishaan Verma", initials: "IV", grade: "Grade 10 A", up: 1480, activities: 42, consistency: 98, avatarColor: "bg-orange-500" },
    { rank: 2, name: "Meera Krishnan", initials: "MK", grade: "Grade 9 B", up: 1395, activities: 39, consistency: 95, avatarColor: "bg-amber-500" },
    { rank: 3, name: "Rohan Das", initials: "RD", grade: "Grade 11 C", up: 1310, activities: 38, consistency: 92, avatarColor: "bg-orange-600" },
    { rank: 4, name: "Aisha Khan", initials: "AK", grade: "Grade 10 B", up: 1265, activities: 36, consistency: 90, avatarColor: "bg-red-500" },
    { rank: 5, name: "Dev Patel", initials: "DP", grade: "Grade 8 A", up: 1200, activities: 35, consistency: 88, avatarColor: "bg-amber-600" }
];

const demoActivityFeed = [
    { title: "Inter-House Quiz Sprint", desc: "Grade 10 secured 1,200 points in Mathematics round.", time: "12 mins ago", icon: "fa-trophy", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/30" },
    { title: "New Study Room Created", desc: "Dr. Sen started 'Advanced Physics Olympiad Prep'.", time: "45 mins ago", icon: "fa-chalkboard-user", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30" },
    { title: "Streak Milestone", desc: "863 students completed their 7-day consistency streak.", time: "2 hours ago", icon: "fa-fire", color: "text-red-500 bg-red-50 dark:bg-red-900/30" },
    { title: "Assignment Submissions", desc: "Grade 9 B achieved 100% submission rate in Chemistry.", time: "3 hours ago", icon: "fa-file-circle-check", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" }
];

const nudgeStudents = [
    { name: "Kabir Menon", grade: "Grade 8 B", drop: "-15% activity", initials: "KM" },
    { name: "Tanvi Rao", grade: "Grade 9 A", drop: "-18% activity", initials: "TR" },
    { name: "Aditya Bose", grade: "Grade 10 C", drop: "-12% activity", initials: "AB" }
];

const comebackStudents = [
    { name: "Nisha Gupta", grade: "Grade 11 A", surge: "+55% UP surge", initials: "NG" },
    { name: "Arjun Nair", grade: "Grade 8 C", surge: "+62% UP surge", initials: "AN" },
    { name: "Priya Shah", grade: "Grade 10 B", surge: "+48% UP surge", initials: "PS" }
];

const momentumClasses = [
    { className: "Grade 9 B", growth: "+24% engagement", leadTeacher: "Ananya Sharma" },
    { className: "Grade 11 C", growth: "+19% engagement", leadTeacher: "Vikram Malhotra" },
    { className: "Grade 8 A", growth: "+16% engagement", leadTeacher: "Sunita Rao" }
];

let progressChartInstance = null;

window.addEventListener('DOMContentLoaded', () => {
    populateLeaderboard();
    populateActivityFeed();
    populateNudgeStudents();
    populateComebackStudents();
    populateMomentumClasses();
    initProgressChart('7d');
});

function populateLeaderboard() {
    const tbody = document.getElementById('leaderboardTableBody');
    if (!tbody) return;
    tbody.innerHTML = demoStudents.map(s => `
        <tr class="hover:bg-orange-50/50 dark:hover:bg-slate-800/50 transition-all">
            <td class="py-3 px-3 flex items-center gap-3">
                <span class="w-6 text-center font-bold text-xs ${s.rank === 1 ? 'text-amber-500' : s.rank === 2 ? 'text-slate-400' : s.rank === 3 ? 'text-amber-700' : 'text-slate-500'}">#${s.rank}</span>
                <div class="w-9 h-9 rounded-xl ${s.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-sm">${s.initials}</div>
                <div>
                    <div class="font-bold text-slate-900 dark:text-white text-sm">${s.name}</div>
                    <div class="text-xs text-slate-400">${s.grade}</div>
                </div>
            </td>
            <td class="py-3 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300">${s.grade}</td>
            <td class="py-3 px-3 text-xs font-extrabold text-orange-600">${s.up.toLocaleString()} UP</td>
            <td class="py-3 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300">${s.activities} sessions</td>
            <td class="py-3 px-3">
                <div class="flex items-center gap-2">
                    <div class="w-24 bg-orange-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div class="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" style="width: ${s.consistency}%"></div>
                    </div>
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300">${s.consistency}%</span>
                </div>
            </td>
        </tr>
    `).join('');
}

function populateActivityFeed() {
    const feed = document.getElementById('activityFeedList');
    if (!feed) return;
    feed.innerHTML = demoActivityFeed.map(a => `
        <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-xl ${a.color} flex items-center justify-center flex-shrink-0 font-bold text-sm">
                <i class="fa-solid ${a.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">${a.title}</h5>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${a.desc}</p>
                <span class="text-[10px] text-orange-600 font-semibold mt-1 block">${a.time}</span>
            </div>
        </div>
    `).join('');
}

function populateNudgeStudents() {
    const list = document.getElementById('nudgeStudentsList');
    if (!list) return;
    list.innerHTML = nudgeStudents.map(n => `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-orange-50/60 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">${n.initials}</div>
                <div>
                    <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200">${n.name}</h5>
                    <p class="text-[10px] text-slate-400">${n.grade} • <span class="text-red-500 font-semibold">${n.drop}</span></p>
                </div>
            </div>
            <button onclick="sendNudge('${n.name}')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1">
                <i class="fa-solid fa-paper-plane text-[10px]"></i> Nudge
            </button>
        </div>
    `).join('');
}

function populateComebackStudents() {
    const list = document.getElementById('comebackStudentsList');
    if (!list) return;
    list.innerHTML = comebackStudents.map(c => `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-orange-50/60 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">${c.initials}</div>
                <div>
                    <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200">${c.name}</h5>
                    <p class="text-[10px] text-slate-400">${c.grade} • <span class="text-emerald-600 font-bold">${c.surge}</span></p>
                </div>
            </div>
            <button onclick="sendPraise('${c.name}')" class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1">
                <i class="fa-solid fa-medal text-[10px]"></i> Praise
            </button>
        </div>
    `).join('');
}

function populateMomentumClasses() {
    const list = document.getElementById('momentumClassesList');
    if (!list) return;
    list.innerHTML = momentumClasses.map(m => `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-orange-50/60 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs"><i class="fa-solid fa-fire text-xs"></i></div>
                <div>
                    <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200">${m.className}</h5>
                    <p class="text-[10px] text-slate-400">Lead: ${m.leadTeacher} • <span class="text-orange-600 font-bold">${m.growth}</span></p>
                </div>
            </div>
            <button onclick="viewClassDetails('${m.className}')" class="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all">
                View
            </button>
        </div>
    `).join('');
}

function initProgressChart(range) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    const is30d = range === '30d';
    const labels = is30d ? Array.from({length: 10}, (_, i => `Day ${i*3 + 1}`)) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activeStudentsData = is30d ? [720, 750, 780, 810, 800, 830, 850, 840, 860, 863] : [780, 810, 790, 840, 820, 902, 863];
    const upGeneratedData = is30d ? [4500, 4800, 5100, 5400, 5200, 5800, 6100, 6000, 6300, 6450] : [5200, 5600, 5400, 6100, 5900, 7320, 6800];

    if (progressChartInstance) {
        progressChartInstance.destroy();
    }

    progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Active Students',
                    data: activeStudentsData,
                    borderColor: '#ff5722',
                    backgroundColor: 'rgba(255, 87, 34, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Urja Points Generated',
                    data: upGeneratedData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.0)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { family: 'Inter', size: 11, weight: '600' }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 224, 215, 0.3)' }
                },
                y1: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // Update button states
    document.getElementById('btn-7d').className = is30d ? 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-all' : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 text-white shadow-sm transition-all';
    document.getElementById('btn-30d').className = is30d ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 text-white shadow-sm transition-all' : 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-all';
}

function updateChartRange(range) {
    initProgressChart(range);
}

function openCreateModal() {
    const modal = document.getElementById('appModal');
    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <i class="fa-solid fa-plus-circle text-orange-600"></i> Create New Institutional Item
            </h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <div class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Select Action Type</label>
                <select id="createType" class="w-full px-4 py-2.5 rounded-xl border border-orange-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold">
                    <option>New Study Room / Class</option>
                    <option>Inter-House Competition</option>
                    <option>Institution Announcement</option>
                    <option>Student Nudge Campaign</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Item Title / Name</label>
                <input type="text" id="createTitle" placeholder="e.g. Advanced Mathematics Sprint" class="w-full px-4 py-2.5 rounded-xl border border-orange-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Description & Details</label>
                <textarea rows="3" placeholder="Enter briefing details..." class="w-full px-4 py-2.5 rounded-xl border border-orange-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"></textarea>
            </div>
            <button onclick="submitCreation()" class="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/20">
                Publish / Create Now
            </button>
        </div>
    `;
    modal.classList.remove('hidden');
}

function openCompetitionModal() {
    const modal = document.getElementById('appModal');
    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <i class="fa-solid fa-trophy text-amber-500"></i> Inter-House Championship
            </h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <div class="space-y-4 text-sm">
            <div class="p-4 rounded-2xl bg-orange-50 dark:bg-slate-800 border border-orange-100 dark:border-slate-700">
                <div class="font-bold text-orange-700 dark:text-orange-400 mb-1">Current Leader: House Agni (Red)</div>
                <p class="text-slate-600 dark:text-slate-300 text-xs">House Agni leads with 14,850 cumulative points, closely followed by House Vayu with 14,200 points.</p>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between font-semibold text-xs text-slate-500"><span>House Standings</span><span>Points</span></div>
                <div class="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold">
                    <span>1. House Agni</span><span class="text-orange-600">14,850 UP</span>
                </div>
                <div class="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold">
                    <span>2. House Vayu</span><span class="text-amber-600">14,200 UP</span>
                </div>
                <div class="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold">
                    <span>3. House Prithvi</span><span class="text-emerald-600">12,950 UP</span>
                </div>
            </div>
            <button onclick="closeModal()" class="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md">
                Close
            </button>
        </div>
    `;
    modal.classList.remove('hidden');
}

function openSettingsModal() {
    const modal = document.getElementById('appModal');
    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <i class="fa-solid fa-gear text-orange-600"></i> Teacher Settings (Ananya Sharma)
            </h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <div class="space-y-4 text-sm">
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Campus Location</label>
                <input type="text" value="Bengaluru • Indiranagar Campus" class="w-full px-4 py-2 rounded-xl border border-orange-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Notification Preferences</label>
                <div class="space-y-2 mt-2">
                    <label class="flex items-center gap-2 text-xs font-semibold cursor-pointer"><input type="checkbox" checked class="accent-orange-600"> Daily Institutional Digest</label>
                    <label class="flex items-center gap-2 text-xs font-semibold cursor-pointer"><input type="checkbox" checked class="accent-orange-600"> Student Streak Alerts</label>
                </div>
            </div>
            <button onclick="closeModal()" class="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md">
                Save Preferences
            </button>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('appModal').classList.add('hidden');
}

function toggleNotifications() {
    const dd = document.getElementById('notificationDropdown');
    dd.classList.toggle('hidden');
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-orange-600', 'text-white', 'shadow-md', 'shadow-orange-600/20');
        el.classList.add('text-slate-600', 'dark:text-slate-400');
    });
    event.currentTarget.classList.remove('text-slate-600', 'dark:text-slate-400');
    event.currentTarget.classList.add('bg-orange-600', 'text-white', 'shadow-md', 'shadow-orange-600/20');
}

function sendNudge(name) {
    alertBox(`Gentle encouragement nudge successfully sent to ${name}! 🚀`);
}

function sendPraise(name) {
    alertBox(`Praise badge and bonus Urja Points awarded to ${name} for their stellar comeback! 🌟`);
}

function viewClassDetails(className) {
    alertBox(`Opening detailed analytics and roster for ${className}.`);
}

function triggerExportReport() {
    alertBox(`UrjaRise Academy Institutional Report (Week 42) downloaded successfully.`);
}

function triggerQuickNudgeAll() {
    alertBox(`Batch nudge broadcast dispatched to all students below threshold.`);
}

function refreshActivityFeed() {
    alertBox(`Activity feed updated with latest campus events.`);
}

function submitCreation() {
    closeModal();
    alertBox(`New institutional item successfully created and published!`);
}

function alertBox(msg) {
    const modal = document.getElementById('appModal');
    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div class="text-center py-4">
            <div class="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h4 class="font-bold text-base mb-1">UrjaRise Academy Notice</h4>
            <p class="text-slate-600 dark:text-slate-300 text-xs mb-5">${msg}</p>
            <button onclick="closeModal()" class="px-6 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md">OK</button>
        </div>
    `;
    modal.classList.remove('hidden');
}