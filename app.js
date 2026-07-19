document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initMobileMenu();
    initRiskCalculator();
    init3DBackground();
    initActiveLinkTracker();
    initNewsTabs();
    initTradingJournal();
    initTradingPlan();
    initAISentiment();
    initNewsRefresh();
    initCOTReport();
    initLiveMarketPrices();
    initNetworkMonitor();
});

/* ==========================================================================
   1. MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && navMenu) {
        // Toggle menu on button click
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('show');
            const icon = mobileMenuBtn.querySelector('i');
            if (navMenu.classList.contains('show')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove('show');
                mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            }
        });
    }
}

/* ==========================================================================
   2. RISK CALCULATOR PRO LOGIC
   ========================================================================== */
function initRiskCalculator() {
    const calcPair = document.getElementById('calc-pair');
    const currentPriceDiv = document.getElementById('current-price-div');
    const calcPrice = document.getElementById('calc-price');
    const riskForm = document.getElementById('risk-form');
    const btnCalculate = document.getElementById('btn-calculate');

    if (!calcPair || !riskForm) return;

    // Handle pair change to show/hide current price field
    calcPair.addEventListener('change', updatePriceVisibility);
    
    // Initial check on load
    updatePriceVisibility();

    function updatePriceVisibility() {
        const pair = calcPair.value;
        const dynamicPairs = ['usdjpy', 'usdchf', 'usdcad'];
        
        if (dynamicPairs.includes(pair)) {
            currentPriceDiv.classList.remove('hidden');
            calcPrice.required = true;
        } else {
            currentPriceDiv.classList.add('hidden');
            calcPrice.required = false;
            calcPrice.value = ''; // Reset value
        }
    }

    // Submit handler
    riskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateLot();
    });
    
    if (btnCalculate) {
        btnCalculate.addEventListener('click', (e) => {
            if (riskForm.checkValidity()) {
                e.preventDefault();
                calculateLot();
            }
        });
    }

    function calculateLot() {
        const errorMsg = document.getElementById('calc-error');
        const lotResult = document.getElementById('lot-result');
        const riskAmountResult = document.getElementById('risk-amount-result');
        const pipValueResult = document.getElementById('pip-value-result');

        // Hide error banner
        errorMsg.classList.add('hidden');
        errorMsg.innerText = '';

        // Get inputs
        const pair = calcPair.value;
        const balance = parseFloat(document.getElementById('calc-balance').value);
        const risk = parseFloat(document.getElementById('calc-risk').value);
        const sl = parseFloat(document.getElementById('calc-sl').value);
        const currentPrice = parseFloat(calcPrice.value);

        // Validation
        if (isNaN(balance) || balance <= 0) {
            showError("Error: Saldo akun harus berupa angka positif.");
            return;
        }
        if (isNaN(risk) || risk <= 0 || risk > 100) {
            showError("Error: Persentase risiko harus antara 0.1% dan 100%.");
            return;
        }
        if (isNaN(sl) || sl <= 0) {
            showError("Error: Stop loss harus berupa angka positif.");
            return;
        }

        const dynamicPairs = ['usdjpy', 'usdchf', 'usdcad'];
        if (dynamicPairs.includes(pair) && (isNaN(currentPrice) || currentPrice <= 0)) {
            showError("Error: Harga pasar saat ini wajib diisi untuk instrumen ini.");
            return;
        }

        // 1. Calculate Money at Risk
        const riskAmount = balance * (risk / 100);

        // 2. Determine Pip Value per Standard Lot (100,000 units)
        // Standard Lot size = 100,000
        // For pairs with USD as Quote (e.g. EURUSD): Pip Value is fixed at $10.
        // For JPY pairs (quote JPY, e.g. USDJPY): 1 pip = 0.01. Pip Value = (0.01 / Exchange Rate) * 100,000 = 1000 / Exchange Rate.
        // For CHF/CAD pairs (quote CHF/CAD, e.g. USDCHF): 1 pip = 0.0001. Pip Value = (0.0001 / Exchange Rate) * 100,000 = 10 / Exchange Rate.
        let pipValuePerLot = 10.0; // Default for XXXUSD pairs and XAUUSD

        if (pair === 'usdjpy') {
            pipValuePerLot = 1000.0 / currentPrice;
        } else if (pair === 'usdchf' || pair === 'usdcad') {
            pipValuePerLot = 10.0 / currentPrice;
        }

        // 3. Calculate Lot Size
        // Lot Size = Risk Amount / (Stop Loss in Pips * Pip Value per Lot)
        let lotSize = riskAmount / (sl * pipValuePerLot);

        // Safety check for division by zero or infinity
        if (!isFinite(lotSize) || isNaN(lotSize) || lotSize < 0) {
            showError("Error: Terjadi kesalahan dalam kalkulasi. Periksa kembali input Anda.");
            return;
        }

        // 4. Update UI with smooth counter or direct value
        animateValue(lotResult, parseFloat(lotResult.innerText) || 0, lotSize, 400, 2);
        riskAmountResult.innerText = `$${riskAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        pipValueResult.innerText = `$${pipValuePerLot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    }

    function showError(message) {
        const errorMsg = document.getElementById('calc-error');
        errorMsg.innerText = message;
        errorMsg.classList.remove('hidden');
        
        // Reset results
        document.getElementById('lot-result').innerText = '0.00';
        document.getElementById('risk-amount-result').innerText = '$0.00';
        document.getElementById('pip-value-result').innerText = '$0.00';
    }

    // Number animation helper for premium feel
    function animateValue(obj, start, end, duration, decimals) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = progress * (end - start) + start;
            obj.innerText = currentValue.toFixed(decimals);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}

/* ==========================================================================
   3. THREE.JS 3D BACKGROUND LOGIC
   ========================================================================== */
function init3DBackground() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;
    camera.position.y = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create 3D wireframe globe
    const geometry = new THREE.IcosahedronGeometry(13, 2);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x3b82f6, // Accent Blue
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Create inner dark core to block background stars behind the globe
    const coreGeometry = new THREE.IcosahedronGeometry(12.8, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x080a0f, // Match CSS background color
        transparent: true,
        opacity: 0.85
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Create floating starfield particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 600;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        // Distribute randomly in space around the camera
        posArray[i] = (Math.random() - 0.5) * 80;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Particle material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x00f5a0, // Teal/Neon green
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true
    });
    
    const starfield = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(starfield);

    // Mouse movement interaction (parallax)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) / 100;
        mouseY = (event.clientY - window.innerHeight / 2) / 100;
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Continuous slow rotation
        globe.rotation.y = elapsedTime * 0.03;
        globe.rotation.x = elapsedTime * 0.01;
        
        starfield.rotation.y = -elapsedTime * 0.015;
        starfield.rotation.x = elapsedTime * 0.005;

        // Smooth parallax based on mouse
        targetX = mouseX * 0.2;
        targetY = mouseY * 0.2;
        
        globe.position.x += (targetX - globe.position.x) * 0.05;
        globe.position.y += (-targetY - globe.position.y) * 0.05;
        core.position.x = globe.position.x;
        core.position.y = globe.position.y;
        
        renderer.render(scene, camera);
    }
    
    animate();
}

/* ==========================================================================
   4. ACTIVE LINK TRACKER (SCROLL SPY)
   ========================================================================== */
function initActiveLinkTracker() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = 'home';
        const scrollPosition = window.scrollY + 120; // Add offset for navbar height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   5. NEWS CATEGORY TABS
   ========================================================================== */
function initNewsTabs() {
    const tabButtons = document.querySelectorAll('.news-tab-btn');
    const newsStacks = document.querySelectorAll('.news-cards-stack');

    if (tabButtons.length === 0) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');

            // Hide all news stacks
            newsStacks.forEach(stack => stack.classList.add('hidden'));

            // Show selected news stack
            const category = button.getAttribute('data-category');
            const targetStack = document.getElementById(`news-${category}`);
            if (targetStack) {
                targetStack.classList.remove('hidden');
            }
        });
    });
}

/* ==========================================================================
   6. TRADING PLAN LOGIC
   ========================================================================== */
function initTradingPlan() {
    const planForm = document.getElementById('plan-form');
    const planRules = document.getElementById('plan-rules');
    const planSetup = document.getElementById('plan-setup');
    const planExit = document.getElementById('plan-exit');

    const displayRules = document.getElementById('display-rules');
    const displaySetup = document.getElementById('display-setup');
    const displayExit = document.getElementById('display-exit');

    if (!planForm) return;

    // Default plan from trade.pdf
    const defaultRules = `1. Percayai sistem. Dengan mengatur RR 1:3 yang konstan, 1 kali kemenangan langsung menutup 3 kali kekalahan.
2. Jangan memodifikasi aturan atau 'Rule Hopping' walau baru saja terkena SL.
3. Sistem tidak memiliki win rate 100%. Kemungkinan menghadapi drawdowns (fase loss beruntun) sangat mungkin terjadi.`;

    const defaultSetup = `ENTRY MODEL: PWH & PWL (SMC)
1. Persiapan Awal (Weekly & Daily Bias):
   - Tandai PWH (Previous Weekly High) sebagai target sell-side (Buyside Liquidity).
   - Tandai PWL (Previous Weekly Low) sebagai target buy-side (Sellside Liquidity).
   - Perhatikan POI di Daily/H4 seperti FVG atau BPR di sekitar PWH/PWL.
2. Konfirmasi Sapuan (Liquidity Sweep):
   - Setup Sell: Harga menyapu PWH, lalu rejection (wick panjang) di H1/H4.
   - Setup Buy: Harga menyapu PWL, lalu merespon dengan pantulan kuat ke atas.
   * Tanpa adanya sweep likuiditas, DILARANG KERAS ENTRY!
3. Konfirmasi Struktur di LTF (Market Structure Shift):
   - Turun ke M15 atau H1 pada jam aktif bursa (London / New York Session).
   - Tunggu MSS (patahnya swing low terakhir untuk sell, atau swing high terakhir untuk buy).
4. Area Eksekusi (Optimal Trade Entry & FVG):
   - Tarik Fib Retracement dari Swing High ke Swing Low pembentuk MSS.
   - Tempatkan Entry Limit pada area OTE (diskon 62% - 79%).
   - WAJIB ADA CONFLUENCE: Level entry 62% harus sejajar dengan FVG di M15/H1 (Sweet Spot).`;

    const defaultExit = `1. Stop Loss (SL): Tempatkan sedikit di atas Swing High absolut (untuk sell) atau di bawah Swing Low absolut (untuk buy). SL harus aman dari pergerakan harga buangan.
2. Take Profit (TP): Target minimum & utama adalah rasio Risk-to-Reward (RR) statis 1:3. Target area tertuju pada ERL berlawanan (misal target PWL jika entry di PWH) atau Internal Liquidity terdekat.
3. Rencana Exit & Manajemen: Jika market lambat/sideways, tahan posisi selama struktur belum gagal, tutup parsial jika perlu, tapi selalu kejar objektif akhir RR 1:3.`;

    // Load existing plan or use defaults
    const savedPlan = JSON.parse(localStorage.getItem('tradevision_plan')) || {
        rules: defaultRules,
        setup: defaultSetup,
        exit: defaultExit
    };

    // Fill form
    planRules.value = savedPlan.rules;
    planSetup.value = savedPlan.setup;
    planExit.value = savedPlan.exit;

    // Update display
    updatePlanDisplay(savedPlan);

    // Save plan
    planForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPlan = {
            rules: planRules.value,
            setup: planSetup.value,
            exit: planExit.value
        };
        localStorage.setItem('tradevision_plan', JSON.stringify(newPlan));
        updatePlanDisplay(newPlan);
        
        // Show success alert/effect
        const btn = document.getElementById('btn-save-plan');
        const originalText = btn.innerText;
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Tersimpan!';
        btn.style.background = 'var(--color-bullish)';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
        }, 1500);
    });

    function updatePlanDisplay(plan) {
        displayRules.innerText = plan.rules.trim() || 'Belum ada aturan yang disimpan. Tulis aturan Anda di sebelah kiri.';
        displaySetup.innerText = plan.setup.trim() || 'Belum ada kriteria setup yang disimpan.';
        displayExit.innerText = plan.exit.trim() || 'Belum ada rencana exit yang disimpan.';
    }
}

/* ==========================================================================
   7. TRADING JOURNAL LOGIC (WITH NOTION FIELDS & CHART.JS)
   ========================================================================== */
// Global chart instances to prevent canvas reuse errors
let winrateChartInstance = null;
let pnlChartInstance = null;

function initTradingJournal() {
    const journalForm = document.getElementById('journal-form');
    const lossDetailsGroup = document.getElementById('loss-details-group');
    const timeCloseGroup = document.getElementById('time-close-group');
    const journalStatus = document.getElementById('journal-status');
    const journalList = document.getElementById('journal-list');
    
    // Stats elements
    const statTotal = document.getElementById('stat-total-trades');
    const statWinrate = document.getElementById('stat-winrate');
    const statNetPnl = document.getElementById('stat-net-pnl');
    const statEmotion = document.getElementById('stat-dominant-emotion');

    // Wall of shame elements
    const wallOfShame = document.getElementById('wall-of-shame');
    const shameList = document.getElementById('shame-list');

    // Filter elements
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'ALL';

    if (!journalForm) return;

    // Template SMC PWH/PWL dari trade.pdf
    const btnTemplateSMC = document.getElementById('btn-template-smc');
    const journalReason = document.getElementById('journal-reason');
    if (btnTemplateSMC && journalReason) {
        btnTemplateSMC.addEventListener('click', () => {
            journalReason.value = `[Sweep PWH/PWL]: Ya/Tidak\n[MSS LTF M15/H1]: Ya/Tidak\n[FVG Tap @ OTE 62%-79%]: Ya/Tidak\nDetail POI & Konfluens: `;
        });
    }

    // Helper to get local ISO string (YYYY-MM-DDTHH:MM)
    function getLocalISOString(date = new Date()) {
        const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
        return localISOTime;
    }

    // Toggle close time and loss details based on status
    journalStatus.addEventListener('change', () => {
        handleStatusChange(journalStatus.value);
    });

    function handleStatusChange(status) {
        const timeCloseInput = document.getElementById('journal-time-close');
        
        if (status === 'LOSS') {
            lossDetailsGroup.classList.remove('hidden');
        } else {
            lossDetailsGroup.classList.add('hidden');
        }

        if (status === 'OPEN') {
            timeCloseGroup.classList.add('hidden');
            timeCloseInput.required = false;
            timeCloseInput.value = '';
        } else {
            timeCloseGroup.classList.remove('hidden');
            timeCloseInput.required = true;
            if (!timeCloseInput.value) {
                timeCloseInput.value = getLocalISOString();
            }
        }
    }

    // Load trades
    let trades = JSON.parse(localStorage.getItem('tradevision_trades')) || [];

    // Filter button handlers
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTrades();
        });
    });

    // Clear all trades
    const btnClear = document.getElementById('btn-clear-journal');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin menghapus semua catatan jurnal? Tindakan ini tidak bisa dibatalkan.')) {
                trades = [];
                saveTrades();
                renderTrades();
                updateStats();
                updateWallOfShame();
                updateCharts();
            }
        });
    }

    // Cancel Edit button
    const btnCancelEdit = document.getElementById('btn-cancel-edit-journal');
    btnCancelEdit.addEventListener('click', () => {
        resetForm();
    });

    // Form submit handler
    journalForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('journal-id').value;
        const status = document.getElementById('journal-status').value;
        
        // Security sanitization to protect against XSS attacks
        const pair = sanitizeHTML(document.getElementById('journal-pair').value.toUpperCase().trim());
        const type = document.getElementById('journal-type').value;
        const risk = parseFloat(document.getElementById('journal-risk').value) || 0;
        const rr = sanitizeHTML(document.getElementById('journal-rr').value.trim());
        const entry = parseFloat(document.getElementById('journal-entry').value) || 0;
        const sl = parseFloat(document.getElementById('journal-sl').value) || 0;
        const tp = parseFloat(document.getElementById('journal-tp').value) || 0;
        const timeOpen = document.getElementById('journal-time-open').value;
        const timeClose = document.getElementById('journal-time-close').value;
        const emotion = document.getElementById('journal-emotion').value;
        const reason = sanitizeHTML(document.getElementById('journal-reason').value.trim());
        const pnl = parseFloat(document.getElementById('journal-pnl').value) || 0;
        const tvLink = sanitizeHTML(document.getElementById('journal-tv-link').value.trim());
        const lossCause = status === 'LOSS' ? sanitizeHTML(document.getElementById('journal-loss-cause').value) : '';
        const selfCritique = status === 'LOSS' ? sanitizeHTML(document.getElementById('journal-self-critique').value.trim()) : '';

        if (id) {
            // Edit existing
            const index = trades.findIndex(t => t.id === id);
            if (index !== -1) {
                trades[index] = {
                    ...trades[index],
                    pair, type, risk, rr, entry, sl, tp, timeOpen, timeClose, emotion, reason, status, pnl, tvLink, lossCause, selfCritique
                };
            }
        } else {
            // Add new
            const newTrade = {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric'
                }),
                pair, type, risk, rr, entry, sl, tp, timeOpen, timeClose, emotion, reason, status, pnl, tvLink, lossCause, selfCritique
            };
            trades.unshift(newTrade);
        }

        saveTrades();
        renderTrades();
        updateStats();
        updateWallOfShame();
        updateCharts();
        resetForm();
    });

    // Initial render, stats & charts
    renderTrades();
    updateStats();
    updateWallOfShame();
    updateCharts();
    resetForm(); // Set default times on load

    function saveTrades() {
        localStorage.setItem('tradevision_trades', JSON.stringify(trades));
    }

    function resetForm() {
        document.getElementById('journal-id').value = '';
        journalForm.reset();
        document.getElementById('form-title').innerText = 'Catat Entry Baru';
        document.getElementById('btn-save-journal').innerText = 'Simpan Jurnal';
        btnCancelEdit.classList.add('hidden');
        lossDetailsGroup.classList.add('hidden');
        timeCloseGroup.classList.add('hidden');
        
        // Set default open time to now
        document.getElementById('journal-time-open').value = getLocalISOString();
    }

    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '-';
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function renderTrades() {
        const filteredTrades = trades.filter(t => {
            if (currentFilter === 'ALL') return true;
            return t.status === currentFilter;
        });

        if (filteredTrades.length === 0) {
            journalList.innerHTML = `
                <div class="no-data">
                    <i class="fa-regular fa-folder-open"></i>
                    <p>Tidak ada data jurnal untuk filter "${currentFilter}".</p>
                </div>
            `;
            return;
        }

        journalList.innerHTML = filteredTrades.map(trade => {
            let borderClass = 'open-border';
            let statusBadgeClass = 'badge-open';
            if (trade.status === 'WIN') {
                borderClass = 'win-border';
                statusBadgeClass = 'badge-win';
            } else if (trade.status === 'LOSS') {
                borderClass = 'loss-border';
                statusBadgeClass = 'badge-loss';
            } else if (trade.status === 'BE') {
                borderClass = 'be-border';
                statusBadgeClass = 'badge-be';
            }

            const emotionClass = `badge-${trade.emotion.toLowerCase()}`;
            
            return `
                <div class="trade-card ${borderClass}" data-id="${trade.id}">
                    <div class="trade-card-header">
                        <div class="trade-title-area">
                            <span class="trade-pair">${trade.pair}</span>
                            <span class="trade-type ${trade.type === 'BUY' ? 'type-buy' : 'type-sell'}">${trade.type}</span>
                            <span class="badge-status ${statusBadgeClass}">${trade.status}</span>
                            <span class="badge-emotion ${emotionClass}">${trade.emotion}</span>
                        </div>
                        <span class="trade-date">${trade.date}</span>
                    </div>
                    <div class="trade-card-body">
                        <div class="trade-params-row">
                            <div class="param-item"><span>Entry:</span> <strong>${trade.entry || '-'}</strong></div>
                            <div class="param-item"><span>SL:</span> <strong>${trade.sl || '-'}</strong></div>
                            <div class="param-item"><span>TP:</span> <strong>${trade.tp || '-'}</strong></div>
                            <div class="param-item"><span>PnL:</span> <strong style="color: ${trade.pnl >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)'}">${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}</strong></div>
                        </div>
                        
                        <!-- Notion-style details row -->
                        <div class="trade-notion-row">
                            <div class="notion-item"><span>Risk (%)</span><strong>${trade.risk || 0}%</strong></div>
                            <div class="notion-item"><span>R:R Ratio</span><strong>${trade.rr || '-'}</strong></div>
                            <div class="notion-item"><span>Open Time</span><strong>${formatDateTime(trade.timeOpen)}</strong></div>
                            <div class="notion-item"><span>Close Time</span><strong>${trade.status === 'OPEN' ? 'Sedang Berjalan' : formatDateTime(trade.timeClose)}</strong></div>
                            <div class="notion-item">
                                <span>Chart Link</span>
                                ${trade.tvLink ? `<a href="${trade.tvLink}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Chart</a>` : '<strong>-</strong>'}
                            </div>
                        </div>

                        <div class="trade-reason" style="margin-top: 15px;">
                            <strong>Reason:</strong> ${trade.reason}
                        </div>
                        ${trade.status === 'LOSS' && trade.lossCause ? `
                            <div class="trade-critique-box">
                                <strong>⚠️ LOSS CAUSE (${trade.lossCause}):</strong>
                                <p class="trade-critique-text">"${trade.selfCritique || 'Tidak ada evaluasi khusus.'}"</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="trade-card-actions">
                        <button class="btn-icon edit-btn" onclick="window.editTrade('${trade.id}')" title="Edit Trade"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="btn-icon delete-btn" onclick="window.deleteTrade('${trade.id}')" title="Hapus Trade"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateStats() {
        const total = trades.length;
        const wins = trades.filter(t => t.status === 'WIN').length;
        const closed = trades.filter(t => t.status !== 'OPEN').length;
        const winrate = closed > 0 ? Math.round((wins / closed) * 100) : 0;
        const netPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

        statTotal.innerText = total;
        statWinrate.innerText = `${winrate}%`;
        statNetPnl.innerText = `${netPnl >= 0 ? '+' : ''}$${netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        statNetPnl.style.color = netPnl >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)';

        // Dominant emotion
        if (total === 0) {
            statEmotion.innerText = 'Belum Ada';
            statEmotion.className = 'badge-emotion badge-neutral';
            return;
        }

        const emotionCounts = {};
        trades.forEach(t => {
            emotionCounts[t.emotion] = (emotionCounts[t.emotion] || 0) + 1;
        });

        let dominant = 'Sabar';
        let maxCount = 0;
        for (const emo in emotionCounts) {
            if (emotionCounts[emo] > maxCount) {
                maxCount = emotionCounts[emo];
                dominant = emo;
            }
        }

        statEmotion.innerText = dominant;
        statEmotion.className = `badge-emotion badge-${dominant.toLowerCase()}`;
    }

    function updateWallOfShame() {
        // Find losses with bad emotions: FOMO, Greedy, Revenge
        const emotionalLosses = trades.filter(t => 
            t.status === 'LOSS' && 
            ['FOMO', 'Greedy', 'Revenge', 'Bosan'].includes(t.emotion)
        ).slice(0, 3); // Top 3 recent bad losses

        if (emotionalLosses.length === 0) {
            wallOfShame.classList.add('hidden');
            return;
        }

        wallOfShame.classList.remove('hidden');
        shameList.innerHTML = emotionalLosses.map(trade => `
            <div class="shame-item">
                <div>Masuk dengan emosi <span class="badge-emotion badge-${trade.emotion.toLowerCase()}">${trade.emotion}</span> pada pair <strong>${trade.pair}</strong> (${trade.type}).</div>
                <div class="shame-quote">"${trade.selfCritique || 'Jangan ulangi kebodohan ini!'}"</div>
                <div class="shame-meta">
                    <span><i class="fa-regular fa-clock"></i> ${trade.date}</span>
                    <span>Loss: $${Math.abs(trade.pnl).toFixed(2)}</span>
                    <span>Penyebab: ${trade.lossCause}</span>
                </div>
            </div>
        `).join('');
    }

    function updateCharts() {
        // 1. Winrate Pie Chart
        const ctxWinrate = document.getElementById('chart-winrate');
        if (!ctxWinrate) return;

        const wins = trades.filter(t => t.status === 'WIN').length;
        const losses = trades.filter(t => t.status === 'LOSS').length;
        const bes = trades.filter(t => t.status === 'BE').length;
        const opens = trades.filter(t => t.status === 'OPEN').length;

        if (winrateChartInstance) {
            winrateChartInstance.destroy();
        }

        if (trades.length === 0) {
            // Show empty state inside canvas container or draw a dummy chart
            winrateChartInstance = new Chart(ctxWinrate, {
                type: 'pie',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['rgba(255,255,255,0.05)'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Rasio Hasil Trade (Belum Ada Data)', color: '#64748b', font: { size: 11 } }
                    }
                }
            });
        } else {
            winrateChartInstance = new Chart(ctxWinrate, {
                type: 'doughnut',
                data: {
                    labels: ['Win', 'Loss', 'BE', 'Open'],
                    datasets: [{
                        data: [wins, losses, bes, opens],
                        backgroundColor: ['#00e676', '#ff1744', '#94a3b8', '#3b82f6'],
                        borderColor: '#111620',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 8, padding: 8 }
                        },
                        title: { display: true, text: 'Rasio Hasil Trade', color: '#ffffff', font: { size: 12, weight: 'bold' } }
                    },
                    cutout: '60%'
                }
            });
        }

        // 2. Equity Curve Line Chart
        const ctxPnl = document.getElementById('chart-pnl');
        if (!ctxPnl) return;

        if (pnlChartInstance) {
            pnlChartInstance.destroy();
        }

        if (trades.length === 0) {
            pnlChartInstance = new Chart(ctxPnl, {
                type: 'line',
                data: {
                    labels: ['Start'],
                    datasets: [{ data: [0], borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Kurva Ekuitas (Belum Ada Data)', color: '#64748b', font: { size: 11 } }
                    },
                    scales: { x: { display: false }, y: { display: false } }
                }
            });
        } else {
            // Sort trades chronologically (oldest first)
            const sortedTrades = [...trades].filter(t => t.status !== 'OPEN').sort((a, b) => {
                return new Date(a.timeOpen) - new Date(b.timeOpen);
            });

            const pnlData = [0];
            const labels = ['Start'];
            let currentSum = 0;

            sortedTrades.forEach((t, i) => {
                currentSum += (t.pnl || 0);
                pnlData.push(currentSum);
                labels.push(`#${i+1}`);
            });

            pnlChartInstance = new Chart(ctxPnl, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Saldo Cumulative PnL',
                        data: pnlData,
                        borderColor: '#00f5a0',
                        backgroundColor: 'rgba(0, 245, 160, 0.05)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.2,
                        pointRadius: 3,
                        pointBackgroundColor: '#00f5a0'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Kurva Ekuitas ($ USD)', color: '#ffffff', font: { size: 12, weight: 'bold' } }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: '#64748b', font: { size: 9 } }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#64748b', font: { size: 9 } }
                        }
                    }
                }
            });
        }
    }

    // Expose functions globally for onclick handlers in dynamically generated HTML
    window.deleteTrade = function(id) {
        if (confirm('Apakah Anda yakin ingin menghapus trade ini?')) {
            trades = trades.filter(t => t.id !== id);
            saveTrades();
            renderTrades();
            updateStats();
            updateWallOfShame();
            updateCharts();
            resetForm();
        }
    };

    window.editTrade = function(id) {
        const trade = trades.find(t => t.id === id);
        if (!trade) return;

        document.getElementById('journal-id').value = trade.id;
        document.getElementById('journal-pair').value = trade.pair;
        document.getElementById('journal-type').value = trade.type;
        document.getElementById('journal-risk').value = trade.risk || 0;
        document.getElementById('journal-rr').value = trade.rr || '';
        document.getElementById('journal-entry').value = trade.entry || '';
        document.getElementById('journal-sl').value = trade.sl || '';
        document.getElementById('journal-tp').value = trade.tp || '';
        document.getElementById('journal-time-open').value = trade.timeOpen || getLocalISOString();
        document.getElementById('journal-emotion').value = trade.emotion;
        document.getElementById('journal-reason').value = trade.reason;
        document.getElementById('journal-status').value = trade.status;
        document.getElementById('journal-pnl').value = trade.pnl || '';
        document.getElementById('journal-tv-link').value = trade.tvLink || '';

        handleStatusChange(trade.status);

        if (trade.status !== 'OPEN') {
            document.getElementById('journal-time-close').value = trade.timeClose || getLocalISOString();
        }
        if (trade.status === 'LOSS') {
            document.getElementById('journal-loss-cause').value = trade.lossCause || 'Market Normal';
            document.getElementById('journal-self-critique').value = trade.selfCritique || '';
        }

        document.getElementById('form-title').innerText = 'Edit Catatan Jurnal';
        document.getElementById('btn-save-journal').innerText = 'Simpan Perubahan';
        btnCancelEdit.classList.remove('hidden');

        // Scroll to form
        document.getElementById('journal-form').scrollIntoView({ behavior: 'smooth' });
    };
}

/* ==========================================================================
   8. AI TODAY INTEL LOGIC
   ========================================================================== */
function initAISentiment() {
    const aiDate = document.getElementById('ai-current-date');
    const aiMacro = document.getElementById('ai-macro-outlook');
    
    // Core pair elements
    const sentXau = document.getElementById('ai-sent-xauusd');
    const projXau = document.getElementById('ai-proj-xauusd');
    const sentEur = document.getElementById('ai-sent-eurusd');
    const projEur = document.getElementById('ai-proj-eurusd');
    const sentGbp = document.getElementById('ai-sent-gbpusd');
    const projGbp = document.getElementById('ai-proj-gbpusd');

    // Additional pair elements
    const sentAud = document.getElementById('ai-sent-audusd');
    const projAud = document.getElementById('ai-proj-audusd');
    const sentNzd = document.getElementById('ai-sent-nzdusd');
    const projNzd = document.getElementById('ai-proj-nzdusd');
    const sentJpy = document.getElementById('ai-sent-usdjpy');
    const projJpy = document.getElementById('ai-proj-usdjpy');
    const sentChf = document.getElementById('ai-sent-usdchf');
    const projChf = document.getElementById('ai-proj-usdchf');
    const sentCad = document.getElementById('ai-sent-usdcad');
    const projCad = document.getElementById('ai-proj-usdcad');

    if (!aiMacro) return;

    // Format tanggal saat ini ke bahasa Indonesia
    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    aiDate.innerText = formattedDate;

    const dayOfWeek = today.getDay(); // 0 = Minggu, 1 = Senin, dst.
    
    let macroText = "";
    
    // Default sentiments
    let xauSentiment = "BULLISH", xauProj = "";
    let eurSentiment = "BEARISH", eurProj = "";
    let gbpSentiment = "NEUTRAL", gbpProj = "";
    let audSentiment = "NEUTRAL", audProj = "";
    let nzdSentiment = "NEUTRAL", nzdProj = "";
    let jpySentiment = "BULLISH", jpyProj = "";
    let chfSentiment = "BEARISH", chfProj = "";
    let cadSentiment = "BULLISH", cadProj = "";

    // Generate dynamic sentiment & projections based on day of week
    if (dayOfWeek === 1) { // Senin
        macroText = `**[TINJAUAN MAKRO & FUNDAMENTAL]** Sesi pembukaan awal pekan ini diwarnai oleh kehati-hatian tingkat tinggi dari pelaku pasar global. Indeks Dolar AS (DXY) merayap naik ke area 104.50, didukung oleh ekspektasi pasar yang realistis terhadap keberlanjutan suku bunga acuan 'higher for longer' oleh Federal Reserve. Volume perdagangan pada sesi Asia terpantau moderat menjelang rilis data manufaktur (PMI) dari Zona Euro dan Inggris yang dijadwalkan hari ini. Gejolak geopolitik di Timur Tengah juga masih memberikan sentimen protektif pada mata uang komoditas dan aset safe haven.\n\n` +
                    `**[STRUKTUR TEKNIKAL & LIQUIDITY]** Secara teknikal, pergerakan chart mayoritas pair utama menunjukkan pola konsolidasi pasca closing market pekan lalu. Area Fair Value Gap (FVG) pada timeframe H4 menjadi zona krusial yang dipantau ketat untuk peluang re-entry. XAU/USD berhasil mempertahankan posisi di atas level support dinamis EMA 50 H4, sementara EUR/USD tertahan tepat di bawah zona suplai 1.0720. Indikator momentum RSI menunjukkan area netral, mengisyaratkan tidak adanya dorongan overbought maupun oversold sebelum breakout rentang harian terjadi.\n\n` +
                    `**[MANAJEMEN RISIKO & STRATEGI]** Mengingat likuiditas awal pekan yang biasanya belum terisi penuh hingga sesi New York terbuka, disarankan untuk membatasi risiko per trade maksimal sebesar 0.5% - 1% dari total ekuitas. Hindari mengambil keputusan entry terburu-buru sebelum pukul 14:00 WIB (sesi London mulai aktif). Pantau rilis data makro minor pada sore hari, dan pastikan tidak menahan posisi open tanpa Stop Loss yang terukur guna mengantisipasi volatilitas mendadak akibat ketidakseimbangan aliran dana awal pekan.`;
        
        xauSentiment = "BULLISH";
        xauProj = "Emas berkonsolidasi kokoh di atas area support psikologis $2,320. Penembusan di atas resisten $2,340 akan membuka target supply berikutnya di kisaran $2,365 - $2,380.";
        eurSentiment = "BEARISH";
        eurProj = "EUR/USD tertekan di bawah garis resisten tren turun 1.0720. Bias pergerakan harian tetap mengarah ke uji ulang support psikologis di 1.0650.";
        gbpSentiment = "NEUTRAL";
        gbpProj = "GBP/USD terjebak di dalam range sempit 1.2630 hingga 1.2690. Menunggu konfirmasi rejection sebelum entri harian.";
        audSentiment = "NEUTRAL";
        audProj = "AUD/USD tertahan oleh area supply harian di 0.6650. RBA bersikap hawkish namun kekuatan USD menahan laju kenaikan harga.";
        nzdSentiment = "BEARISH";
        nzdProj = "NZD/USD melemah pasca rejection area resistance 0.6120. Target penurunan teknikal terdekat menuju support kuat 0.6050.";
        jpySentiment = "BEARISH";
        jpyProj = "USD/JPY tertekan akibat kekhawatiran intervensi nyata dari BOJ. Bias mengarah ke bawah menguji support psikologis 158.00.";
        chfSentiment = "NEUTRAL";
        chfProj = "USD/CHF bergerak sideways di range 0.8840 - 0.8900. Menunggu sinyal breakout yang terarah untuk konfirmasi tren.";
        cadSentiment = "BULLISH";
        cadProj = "USD/CAD rebound dari support dinamis 1.3620. Kenaikan mengarah ke zona supply harian terdekat di sekitar level 1.3700.";
    } else if (dayOfWeek === 2) { // Selasa
        macroText = `**[TINJAUAN MAKRO & FUNDAMENTAL]** Dolar AS menunjukkan pergerakan variatif menyusul serangkaian pernyataan bernada hawkish dari beberapa pejabat bank sentral Federal Reserve. Pasar obligasi merespons langsung dengan kenaikan yield US Treasury 10-tahun ke level 4.25%, yang secara otomatis menekan aset-aset tanpa imbal hasil (non-yielding assets). Investor saat ini juga sedang menakar prospek perlambatan ekonomi global akibat kebijakan suku bunga ketat yang tampaknya akan bertahan lebih lama dari perkiraan semula.\n\n` +
                    `**[STRUKTUR TEKNIKAL & LIQUIDITY]** Dari perspektif teknikal, pergerakan instrumen XAU/USD terindikasi sedang membentuk pola akumulasi beli di dekat area support harian. Struktur pasar pada timeframe M15 dan H1 memperlihatkan pembentukan order block bullish yang cukup valid. Sementara itu, indeks ekuitas global mengalami tekanan korektif tipis, mencerminkan peralihan likuiditas dari pasar saham menuju pasar obligasi pemerintah yang menawarkan imbal hasil lebih aman dan menarik.\n\n` +
                    `**[MANAJEMEN RISIKO & STRATEGI]** Fokus transaksi hari ini disarankan untuk lebih memprioritaskan setup scalping atau intraday cepat pada instrumen mayor. Selalu gunakan rasio Risk to Reward (R:R) minimal 1:2 untuk memastikan portofolio tetap sehat dalam jangka panjang. Sesi New York pukul 19:30 WIB diperkirakan akan menjadi puncak volatilitas harian, sehingga sangat direkomendasikan untuk mengamankan profit sebagian (partial take profit) atau memindahkan Stop Loss ke titik Break Even (BE) sebelum jam krusial tersebut.`;
        
        xauSentiment = "NEUTRAL";
        xauProj = "XAU/USD bergerak di kisaran $2,310 - $2,335. Adanya rejection berulang pada support harian mengindikasikan potensi rebound jangka pendek menuju $2,345.";
        eurSentiment = "BEARISH";
        eurProj = "Rilis data ekonomi Zona Euro yang mengecewakan kembali membebani mata uang tunggal. Peluang jual di pullback 1.0680 dengan target support di 1.0620.";
        gbpSentiment = "BULLISH";
        gbpProj = "Kekuatan data tenaga kerja domestik Inggris menopang Sterling. GBP/USD sedang menguji level resisten 1.2700, potensi breakout ke target 1.2750.";
        audSentiment = "BULLISH";
        audProj = "AUD/USD rebound dari support dinamis 0.6580. Arah jangka pendek menuju level resisten minor di sekitar area 0.6640.";
        nzdSentiment = "NEUTRAL";
        nzdProj = "NZD/USD menunjukkan pola konsolidasi pasca kejatuhan. Rentang pergerakan terbatas pada area support 0.6080 dan resisten 0.6130.";
        jpySentiment = "BULLISH";
        jpyProj = "USD/JPY bangkit setelah meredanya kepanikan pasar atas isu BOJ. Target reli jangka pendek kembali menuju batas atas di level 161.20.";
        chfSentiment = "BULLISH";
        chfProj = "USD/CHF menguat terarah sejalan dengan pelemahan safe haven CHF. Penembusan 0.8920 akan mempercepat pergerakan menuju level 0.8970.";
        cadSentiment = "NEUTRAL";
        cadProj = "USD/CAD sideways menjelang pidato gubernur Bank of Canada. Perdagangan harian dibatasi oleh support 1.3600 dan resisten 1.3680.";
    } else if (dayOfWeek === 3) { // Rabu
        macroText = `**[TINJAUAN MAKRO & FUNDAMENTAL]** Hari ini seluruh fokus pasar finansial global tertuju sepenuhnya pada rilis data inflasi konsumen (CPI) Amerika Serikat yang akan diumumkan nanti malam. Data ini merupakan katalisator utama yang sangat dinanti oleh pelaku pasar karena akan memberikan sinyal terkuat mengenai langkah The Fed berikutnya dalam menentukan suku bunga acuan. Ketegangan geopolitik baru di wilayah Eropa Timur turut meningkatkan permintaan terhadap aset safe-haven secara signifikan menjelang berita makro dirilis.\n\n` +
                    `**[STRUKTUR TEKNIKAL & LIQUIDITY]** Struktur pergerakan harga pada grafik mayor pair memperlihatkan kompresi harga yang sangat ketat, sebuah pola klasik yang menandakan akumulasi energi sebelum pergerakan eksplosif (breakout). Level Likuiditas (Buy-side Liquidity dan Sell-side Liquidity) bertumpuk jelas di atas batas-batas range harian. Emas membentuk pola double bottom terkonfirmasi di timeframe H1, sementara indeks saham AS bergerak datar mendekati area all-time high.\n\n` +
                    `**[MANAJEMEN RISIKO & STRATEGI]** Ini adalah hari dengan risiko volatilitas ekstrem. Aturan manajemen risiko emas wajib diterapkan secara ketat: kurangi ukuran lot (position sizing) hingga setengah dari ukuran normal untuk mengompensasi potensi slippage (loncatan harga). Sangat disarankan untuk tidak membuka posisi baru dalam waktu 30 menit sebelum dan sesudah rilis data CPI pada pukul 19:30 WIB, melainkan menunggu konfirmasi arah pergerakan pasar setelah berita dirilis secara resmi.`;
        
        xauSentiment = "BULLISH";
        xauProj = "Permintaan safe haven mendorong harga emas menguat dengan target jangka menengah menuju $2,350. Proteksi ketat wajib diletakkan di bawah level $2,315.";
        eurSentiment = "NEUTRAL";
        eurProj = "EUR/USD bergerak sideways dalam pola wait-and-see. Diperkirakan fluktuasi harga akan terbatas pada area 1.0680 hingga 1.0740 sebelum rilis data CPI.";
        gbpSentiment = "BEARISH";
        gbpProj = "Terlihat pola bearish engulfing yang cukup dominan pada chart H4. GBP/USD berpotensi turun ke 1.2600 jika resisten 1.2680 gagal ditembus.";
        audSentiment = "BEARISH";
        audProj = "AUD/USD tertekan akibat sentimen anti-risiko global. Penurunan berlanjut menguji area support horizontal kritis pada level 0.6550.";
        nzdSentiment = "BEARISH";
        nzdProj = "NZD/USD melemah secara beruntun mengarah ke support psikologis 0.6000 akibat sentimen negatif pasar komoditas ekspor Selandia Baru.";
        jpySentiment = "NEUTRAL";
        jpyProj = "USD/JPY tertahan di level 160.00. Pergerakan sideways mendominasi karena trader ragu-ragu mengambil keputusan menjelang berita CPI.";
        chfSentiment = "BEARISH";
        chfProj = "USD/CHF melemah tipis akibat pelemahan yield obligasi global. Target pergerakan mengarah ke support tren naik terdekat di 0.8870.";
        cadSentiment = "BULLISH";
        cadProj = "Pelemahan harga minyak bumi membebani Loonie. USD/CAD rebound mengarah ke batas atas saluran konsolidasi di sekitar level 1.3720.";
    } else if (dayOfWeek === 4) { // Kamis
        macroText = `**[TINJAUAN MAKRO & FUNDAMENTAL]** Mengikuti rilis data inflasi kemarin yang menunjukkan perlambatan sesuai ekspektasi pasar, tekanan terhadap Dolar AS mulai mereda. Kebijakan moneter global saat ini diproyeksikan akan perlahan melonggar di akhir tahun, memicu sentimen positif di pasar modal (Risk-On). Aksi beli kembali (bargain hunting) mendominasi pergerakan saham-sektor teknologi, sedangkan komoditas mineral berharga mendapat dukungan kuat dari pelemahan yield obligasi pemerintah AS.\n\n` +
                    `**[STRUKTUR TEKNIKAL & LIQUIDITY]** Secara teknikal, penembusan level resisten utama pada beberapa pasangan mata uang telah menggeser bias tren jangka pendek dari bearish menjadi bullish. Area yang sebelumnya bertindak sebagai resisten kuat kini bertransformasi menjadi support kritis (Resistance Become Support). Terjadi imbalance harga yang cukup lebar pada grafik pergerakan kemarin, yang diperkirakan akan menjadi target pengisian (retest) sebelum harga melanjutkan reli kenaikannya.\n\n` +
                    `**[MANAJEMEN RISIKO & STRATEGI]** Strategi terbaik untuk perdagangan hari ini adalah membeli saat terjadi koreksi (Buy on Pullback) di area-area support terdekat atau di batas diskon FVG. Manfaatkan overlapping sesi perdagangan Eropa dan Amerika untuk mencari setup dengan probabilitas keberhasilan tinggi. Pastikan target take profit ditentukan secara realistis pada level-level resistance terdekat, dan pertahankan kedisiplinan eksekusi agar tidak terjebak fomo pasca pergerakan besar kemarin.`;
        
        xauSentiment = "BULLISH";
        xauProj = "Emas sukses menembus resisten kuat di $2,340. Zona ini kini bertindak sebagai support baru. Proyeksi kenaikan mengarah ke area $2,370.";
        eurSentiment = "BULLISH";
        eurProj = "EUR/USD berhasil bangkit dari support kuat 1.0660 dan saat ini menargetkan level 1.0760. Struktur harga menunjukkan pergeseran tren harian menjadi bullish.";
        gbpSentiment = "BULLISH";
        gbpProj = "Mata uang Sterling memimpin reli penguatan terhadap USD. GBP/USD berpotensi besar menguji kembali level tertinggi di 1.2780 dengan support terdekat di 1.2690.";
        audSentiment = "BULLISH";
        audProj = "AUD/USD reli menembus resisten 0.6620 akibat pelemahan USD. Target pergerakan bullish selanjutnya mengarah ke level suplai 0.6680.";
        nzdSentiment = "BULLISH";
        nzdProj = "NZD/USD rebound tajam keluar dari area oversold dan mengincar level 0.6140. Support terdekat terbentuk di kisaran level 0.6070.";
        jpySentiment = "BEARISH";
        jpyProj = "Pelemahan yield obligasi AS menyeret USD/JPY turun menjauhi zona resisten historis. Target penurunan harian menuju level support 159.20.";
        chfSentiment = "BEARISH";
        chfProj = "USD/CHF breakdown di bawah level support kritis 0.8900. Sinyal harian dominan bearish dengan sasaran area support lanjutan di 0.8830.";
        cadSentiment = "BEARISH";
        cadProj = "USD/CAD tertekan pasca rilis data manufaktur Kanada yang positif. Penurunan diproyeksikan mengarah ke uji level support horizontal 1.3580.";
    } else if (dayOfWeek === 5) { // Jumat
        macroText = `**[TINJAUAN MAKRO & FUNDAMENTAL]** Memasuki sesi penutupan perdagangan akhir pekan, sentimen pasar terpantau bergerak dalam pola defensif yang didominasi oleh aksi profit-taking dari para institusi besar. Rilis data penjualan ritel (Retail Sales) AS sore nanti akan menjadi katalisator penggerak volume perdagangan terakhir yang menentukan bentuk candle mingguan. Ketidakpastian politik di Eropa Barat juga turut membatasi pergerakan agresif pada instrumen mata uang Euro.\n\n` +
                    `**[STRUKTUR TEKNIKAL & LIQUIDITY]** Struktur pergerakan pasar pada hari Jumat cenderung menampilkan pelebaran range palsu (fakeout) karena likuiditas yang perlahan menipis menjelang penutupan market. Pola pembentukan harga harian sering kali membentuk range konsolidasi di sesi akhir Amerika. Penutupan candle mingguan di atas level-level penting akan sangat menentukan bias pergerakan arah tren pada pembukaan hari Senin mendatang.\n\n` +
                    `**[MANAJEMEN RISIKO & STRATEGI]** Perdagangan di hari Jumat menuntut disiplin ekstra tinggi untuk menghindari 'overtrading' dan 'revenge trading' akibat akumulasi hasil sepekan. Sangat disarankan untuk mengakhiri sesi perdagangan lebih awal (sebelum pertengahan sesi New York) dan mengamankan seluruh posisi berjalan guna menghindari risiko gap harga pada saat pembukaan pasar di hari Senin awal pekan depan.`;
        
        xauSentiment = "NEUTRAL";
        xauProj = "Emas diperkirakan akan bergerak dalam rentang konsolidasi akhir pekan di kisaran harga $2,330 - $2,355. Sangat berisiko untuk memaksakan entri baru di area tengah range.";
        eurSentiment = "BEARISH";
        eurProj = "Penolakan teknikal terjadi setelah harga gagal menembus level 1.0750. EUR/USD berpotensi mengalami koreksi turun menuju support 1.0700 menjelang penutupan pasar.";
        gbpSentiment = "NEUTRAL";
        gbpProj = "GBP/USD tertahan tepat di bawah level resisten kuat 1.2750. Pola konsolidasi harian diperkirakan akan mendominasi pergerakan hingga penutupan pasar.";
        audSentiment = "NEUTRAL";
        audProj = "AUD/USD bergerak datar di range 0.6600 - 0.6660. Disarankan untuk membatasi aktivitas trading menjelang penutupan pasar mingguan.";
        nzdSentiment = "NEUTRAL";
        nzdProj = "NZD/USD tertahan di sekitar area pivot harian 0.6100. Bias pergerakan harian cenderung netral tanpa katalis pendorong baru.";
        jpySentiment = "BULLISH";
        jpyProj = "USD/JPY kembali merangkak naik akibat keengganan BOJ merubah arah suku bunga di hari jumat. Proyeksi harian menguji kembali level 160.80.";
        chfSentiment = "BULLISH";
        chfProj = "USD/CHF menguji resisten minor 0.8930. Selama level ini bertahan, bias sideways jangka pendek cenderung berlanjut.";
        cadSentiment = "BULLISH";
        cadProj = "Aksi beli defensif menopang USD/CAD naik ke level 1.3650. Rencana perdagangan harian mencari konfirmasi penutupan candle di atas 1.3670.";
    } else { // Akhir Pekan (Sabtu & Minggu)
        macroText = `**[TINJAUAN MAKRO & FUNDAMENTAL]** Pasar finansial global saat ini sedang ditutup untuk libur akhir pekan. Rekapitulasi pergerakan sepekan kemarin menunjukkan pelemahan moderat pada indeks Dolar AS yang didorong oleh rilis data inflasi yang melambat. Para pelaku pasar dan institusi keuangan global saat ini tengah melakukan evaluasi portofolio investasi serta menyusun ulang rencana perdagangan untuk mengantisipasi rilis kalender ekonomi penting di pekan depan.\n\n` +
                    `**[STRUKTUR TEKNIKAL & LIQUIDITY]** Analisis pada grafik mingguan (weekly chart) memperlihatkan retensi struktur bullish yang kokoh pada instrumen Emas, sementara beberapa pasangan mata uang mayor terpantau sedang menguji batas bawah dari pola konsolidasi jangka menengah mereka. Analisis penutupan harga hari Jumat kemarin memberikan petunjuk penting bahwa likuiditas pembelian masih mendominasi di area-area diskon struktural.\n\n` +
                    `**[MANAJEMEN RISIKO & STRATEGI]** Akhir pekan adalah waktu terbaik untuk beristirahat secara mental dan melakukan evaluasi mendalam terhadap jurnal transaksi mingguan Anda. Analisis kesalahan emosional seperti FOMO atau keserakahan (Greedy) yang tercatat selama sepekan untuk dijadikan pembelajaran penting. Persiapkan skenario analisis teknikal dan buatlah rencana trading (trading plan) yang matang sebelum pasar kembali dibuka di hari Senin pagi.`;
        
        xauSentiment = "BULLISH";
        xauProj = "Secara struktural tren mingguan, bias XAU/USD tetap bullish kuat selama harga bertahan di atas level kritis $2,300. Pekan depan difokuskan mencari peluang beli pada support terdekat.";
        eurSentiment = "BEARISH";
        eurProj = "Tren jangka menengah EUR/USD masih didominasi bearish terarah. Setup sell yang ideal diproyeksikan berada di dekat area penolakan suplai di level 1.0780.";
        gbpSentiment = "NEUTRAL";
        gbpProj = "GBP/USD ditutup di level 1.2685. Level kunci harian yang wajib dipantau pekan depan adalah 1.2600 dan 1.2800.";
        audSentiment = "BULLISH";
        audProj = "Tren mingguan AUD/USD tetap bullish setelah bertahan di atas zona support 0.6550. Rekomendasi pekan depan mencari setup buy di level diskon harian.";
        nzdSentiment = "NEUTRAL";
        nzdProj = "NZD/USD ditutup di level 0.6090. Struktur pergerakan cenderung mendatar, menanti kepastian arah data inflasi pekan depan.";
        jpySentiment = "BULLISH";
        jpyProj = "Bias USD/JPY masih bullish kuat di atas level 159.00. Analisis teknikal memproyeksikan pencarian target baru ke area resisten 161.50.";
        chfSentiment = "NEUTRAL";
        chfProj = "USD/CHF ditutup stabil di level 0.8895. Tren harian menunjukkan fase konsolidasi yang matang sebelum rilis data penting berikutnya.";
        cadSentiment = "BULLISH";
        cadProj = "Secara keseluruhan struktur USD/CAD mendukung tren bullish lanjutan. Selama harga berada di atas support 1.3550, bias tetap mengarah ke atas.";
    }

    // Mengisi konten makro
    aiMacro.innerHTML = macroText.replace(/\n/g, '<br>');

    // XAUUSD
    sentXau.innerText = xauSentiment;
    sentXau.className = `ai-sentiment-badge ${xauSentiment.toLowerCase()}`;
    projXau.innerText = xauProj;

    // EURUSD
    sentEur.innerText = eurSentiment;
    sentEur.className = `ai-sentiment-badge ${eurSentiment.toLowerCase()}`;
    projEur.innerText = eurProj;

    // GBPUSD
    sentGbp.innerText = gbpSentiment;
    sentGbp.className = `ai-sentiment-badge ${gbpSentiment.toLowerCase()}`;
    projGbp.innerText = gbpProj;

    // AUDUSD
    sentAud.innerText = audSentiment;
    sentAud.className = `ai-sentiment-badge ${audSentiment.toLowerCase()}`;
    projAud.innerText = audProj;

    // NZDUSD
    sentNzd.innerText = nzdSentiment;
    sentNzd.className = `ai-sentiment-badge ${nzdSentiment.toLowerCase()}`;
    projNzd.innerText = nzdProj;

    // USDJPY
    sentJpy.innerText = jpySentiment;
    sentJpy.className = `ai-sentiment-badge ${jpySentiment.toLowerCase()}`;
    projJpy.innerText = jpyProj;

    // USDCHF
    sentChf.innerText = chfSentiment;
    sentChf.className = `ai-sentiment-badge ${chfSentiment.toLowerCase()}`;
    projChf.innerText = chfProj;

    // USDCAD
    sentCad.innerText = cadSentiment;
    sentCad.className = `ai-sentiment-badge ${cadSentiment.toLowerCase()}`;
    projCad.innerText = cadProj;

    // PDF Download handler
    const downloadBtn = document.getElementById('btn-download-ai-pdf');
    if (downloadBtn) {
        // Hapus listener duplikat sebelum menambahkan baru
        const newBtn = downloadBtn.cloneNode(true);
        downloadBtn.parentNode.replaceChild(newBtn, downloadBtn);

        newBtn.addEventListener('click', () => {
            const element = document.getElementById('ai-intel');
            if (typeof html2pdf === 'undefined') {
                alert("Library PDF belum termuat sepenuhnya. Silakan tunggu beberapa saat atau muat ulang halaman.");
                return;
            }

            const originalText = newBtn.innerHTML;
            newBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Memproses PDF...';
            newBtn.disabled = true;

            const clone = element.cloneNode(true);
            clone.classList.add('pdf-print-theme');
            
            document.body.appendChild(clone);

            const opt = {
                margin:       10,
                filename:     `Laporan_AI_Market_Today_${formattedDate.replace(/ /g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().from(clone).set(opt).save().then(() => {
                document.body.removeChild(clone);
                newBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Selesai!';
                newBtn.style.background = 'var(--color-bullish)';
                setTimeout(() => {
                    newBtn.innerHTML = originalText;
                    newBtn.style.background = '';
                    newBtn.disabled = false;
                }, 1500);
            }).catch(err => {
                console.error("PDF export error:", err);
                document.body.removeChild(clone);
                newBtn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Gagal';
                newBtn.style.background = 'var(--color-bearish)';
                setTimeout(() => {
                    newBtn.innerHTML = originalText;
                    newBtn.style.background = '';
                    newBtn.disabled = false;
                }, 1500);
            });
        });
    }
}

let cotChartInstance = null;
function initCOTReport() {
    const ctx = document.getElementById('chart-cot-report');
    const refreshBtn = document.getElementById('btn-refresh-cot');
    if (!ctx) return;

    // Default COT positions (Speculative Long vs Short)
    const instruments = ['XAUUSD', 'DXY', 'AUDUSD', 'NZDUSD', 'GBPUSD', 'EURUSD', 'USDJPY', 'USDCAD', 'USDCHF', 'US10Y'];
    let longPositions = [72, 65, 45, 40, 52, 48, 68, 55, 42, 58];
    let shortPositions = longPositions.map(long => 100 - long);

    const renderChart = () => {
        if (cotChartInstance) {
            cotChartInstance.destroy();
        }

        cotChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: instruments,
                datasets: [
                    {
                        label: 'Long Position % (Institusi)',
                        data: longPositions,
                        backgroundColor: 'rgba(0, 230, 118, 0.75)',
                        borderColor: 'rgba(0, 230, 118, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Short Position % (Institusi)',
                        data: shortPositions,
                        backgroundColor: 'rgba(255, 23, 68, 0.75)',
                        borderColor: 'rgba(255, 23, 68, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Horizontal stacked bars
                scales: {
                    x: {
                        stacked: true,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#8a9fc2', callback: value => value + '%' }
                    },
                    y: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { color: '#ffffff', font: { weight: 'bold' } }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#ffffff', boxWidth: 12, font: { size: 10 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label.split(' ')[0]}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    };

    renderChart();

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('spinning');
            refreshBtn.disabled = true;

            setTimeout(() => {
                // Randomize speculative positions slightly (+/- 6%) while keeping bounds [15, 85]
                longPositions = longPositions.map(val => {
                    const delta = Math.floor(Math.random() * 13) - 6; // -6 to +6
                    const newVal = Math.max(15, Math.min(85, val + delta));
                    return newVal;
                });
                shortPositions = longPositions.map(long => 100 - long);

                renderChart();

                refreshBtn.classList.remove('spinning');
                refreshBtn.disabled = false;
            }, 800);
        });
    }
}

// Security: Basic Sanitize and Debounce
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

/* ==========================================================================
   9. MARKET NEWS REFRESH LOGIC (DYNAMICAL SIMULATION WITH POOL)
   ========================================================================== */
// Database pool berita untuk variasi simulasi harian (Fallback)
const newsPool = {
    forex: [
        { title: "Dolar AS Melemah Jelang Rilis Data CPI Inti", excerpt: "Para pelaku pasar berhati-hati menjelang rilis inflasi yang dapat menentukan arah kebijakan The Fed selanjutnya.", meta: "10 Menit lalu", source: "FXStreet", url: "https://www.fxstreet.com" },
        { title: "GBP/USD Stabil di Atas 1.2650 Pasca Data Tenaga Kerja", excerpt: "Perekonomian Inggris menunjukkan ketahanan dengan tingkat pengangguran yang tetap stabil, mendukung penguatan sterling.", meta: "1 Jam lalu", source: "FXStreet", url: "https://www.fxstreet.com" },
        { title: "Analisis EUR/USD: Tekanan Jual Masih Dominan di Sesi Eropa", excerpt: "Data PMI manufaktur Jerman yang mengecewakan kembali membebani mata uang tunggal Euro hari ini.", meta: "3 Jam lalu", source: "FXStreet", url: "https://www.fxstreet.com" },
        { title: "Yen Jepang Menguat Tajam Pasca Dugaan Intervensi BOJ Kedua", excerpt: "Otoritas keuangan Tokyo terpantau melakukan aksi beli Yen secara masif untuk menahan depresiasi di atas level 160.", meta: "Baru saja", source: "Bloomberg", url: "https://www.bloomberg.com" },
        { title: "Aussie Tertahan di Support Harian Menjelang Laporan RBA", excerpt: "Sentimen wait-and-see menyelimuti pasangan AUD/USD karena pelaku pasar bersiap menghadapi arah suku bunga domestik.", meta: "5 Menit lalu", source: "Reuters", url: "https://www.reuters.com" }
    ],
    crypto: [
        { title: "Bitcoin (BTC) Tembus $95,000 Didorong Arus Masuk ETF", excerpt: "Minat institusional terus meningkat dengan rekor pembelian bersih harian baru pada produk ETF Spot Bitcoin.", meta: "30 Menit lalu", source: "Cointelegraph", url: "https://cointelegraph.com" },
        { title: "Ethereum (ETH) Menguji Area $3,200 Saat Gas Fee Turun", excerpt: "Pembaruan layer-2 berhasil menurunkan biaya transaksi jaringan, memicu lonjakan aktivitas smart contract.", meta: "2 Jam lalu", source: "CoinDesk", url: "https://www.coindesk.com" },
        { title: "Solana Memimpin Reli Altcoin dengan Kenaikan 12%", excerpt: "Volume transaksi DEX di jaringan Solana melampaui Ethereum dalam basis mingguan, didorong antusiasme pasar.", meta: "4 Jam lalu", source: "Decrypt", url: "https://decrypt.co" },
        { title: "SEC Tunda Lagi Keputusan Opsi ETF Ethereum Spot", excerpt: "Komisi sekuritas AS mengajukan masa perpanjangan untuk meninjau potensi dampak likuiditas di pasar derivatif.", meta: "12 Menit lalu", source: "CoinDesk", url: "https://www.coindesk.com" },
        { title: "Volume Transaksi L2 Mencapai Rekor Tertinggi Baru", excerpt: "Penerapan pembaruan Dencun sukses memotong biaya transaksi hingga 90%, mendongkrak utilitas jaringan.", meta: "1 Jam lalu", source: "Cointelegraph", url: "https://cointelegraph.com" }
    ],
    index: [
        { title: "IHSG Ditutup Menguat ke Level 7,300 Didorong Sektor Perbankan", excerpt: "Saham-saham bank papan atas seperti BBRI, BMRI, dan BBCA memimpin penguatan indeks di sesi perdagangan sore.", meta: "45 Menit lalu", source: "CNBC Indonesia", url: "https://www.cnbcindonesia.com" },
        { title: "Rupiah Menguat Terhadap Dolar AS Pasca Keputusan BI-Rate", excerpt: "Bank Indonesia memutuskan untuk menahan suku bunga acuan, memberikan sentimen positif bagi stabilitas nilai tukar rupiah.", meta: "2 Jam lalu", source: "Kontan", url: "https://www.kontan.co.id" },
        { title: "Saham BBRI dan BMRI Catat Net Buy Asing Tertinggi Pekan Ini", excerpt: "Investor asing kembali masuk ke pasar saham Indonesia dengan akumulasi nilai transaksi bersih yang signifikan.", meta: "5 Jam lalu", source: "Bisnis Indonesia", url: "https://www.bisnis.com" },
        { title: "Indeks Nikkei 225 Jepang Turun 1.8% Ikuti Koreksi Sektor Teknologi AS", excerpt: "Tekanan jual masif melanda saham raksasa chip semikonduktor di Tokyo pasca koreksi Nasdaq kemarin malam.", meta: "15 Menit lalu", source: "Reuters", url: "https://www.reuters.com" },
        { title: "Dow Jones Berjangka Menguat Menanti Rilis Klaim Pengangguran", excerpt: "Kontrak berjangka saham AS naik tipis mengisyaratkan pembukaan sesi New York yang cenderung positif stabil.", meta: "30 Menit lalu", source: "Bloomberg", url: "https://www.bloomberg.com" }
    ],
    commodities: [
        { title: "Harga Emas (XAU/USD) Tertahan di Resisten $2,050", excerpt: "Ketegangan geopolitik mereda sementara, membuat Emas kesulitan menembus area resisten krusial mingguan.", meta: "1 Jam lalu", source: "Reuters", url: "https://www.reuters.com" },
        { title: "Minyak Mentah Brent Turun ke $78 Per Barel", excerpt: "Kenaikan cadangan minyak mentah komersial di Amerika Serikat memicu kekhawatiran kelebihan pasokan global.", meta: "2 Jam lalu", source: "Bloomberg", url: "https://www.bloomberg.com" },
        { title: "Harga Tembaga Melonjak Didorong Permintaan Industri Global", excerpt: "Optimisme atas pulihnya aktivitas manufaktur di Asia dan Amerika Utara mendorong lonjakan harga logam industri.", meta: "6 Jam lalu", source: "Investing.com", url: "https://www.investing.com" },
        { title: "Gas Alam Eropa Kembali Menguat Akibat Gangguan Jalur Pipa Gas", excerpt: "Kerusakan teknis tidak terencana di kilang gas Norwegia memicu lonjakan harga acuan TTF sebesar 4.5%.", meta: "3 Menit lalu", source: "Bloomberg", url: "https://www.bloomberg.com" },
        { title: "Harga Perak (XAG/USD) Menguji Resisten Utama $29.50", excerpt: "Logam perak melacak kenaikan harga emas harian dengan potensi pembentukan pola kelanjutan tren naik (bullish flag).", meta: "10 Menit lalu", source: "Reuters", url: "https://www.reuters.com" }
    ]
};

// Helper untuk mengacak/shuffle array
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function fallbackToLocalNews() {
    for (const category in newsPool) {
        const targetStack = document.getElementById(`news-${category}`);
        if (!targetStack) continue;
        const shuffledNews = shuffleArray(newsPool[category]).slice(0, 3);
        renderNewsStack(targetStack, shuffledNews, category);
    }
}

async function fetchRealNews() {
    const stacks = {
        forex: document.getElementById('news-forex'),
        crypto: document.getElementById('news-crypto'),
        index: document.getElementById('news-index'),
        commodities: document.getElementById('news-commodities')
    };

    try {
        // Fetch global news from ok.surf (CORS enabled)
        const globalNewsRes = await fetch('https://ok.surf/api/v1/cors/news-feed');
        if (!globalNewsRes.ok) throw new Error('Global news fetch failed');
        const globalNewsData = await globalNewsRes.json();

        // Fetch local Indonesian index news from CNBC Indonesia RSS via AllOrigins
        let cnbcNews = [];
        try {
            const localNewsRes = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.cnbcindonesia.com/market/rss'));
            if (localNewsRes.ok) {
                const localNewsData = await localNewsRes.json();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(localNewsData.contents, 'text/xml');
                const items = xmlDoc.querySelectorAll('item');
                cnbcNews = Array.from(items).map(item => {
                    const title = item.querySelector('title')?.textContent || '';
                    const link = item.querySelector('link')?.textContent || '';
                    const description = item.querySelector('description')?.textContent || '';
                    const pubDate = item.querySelector('pubDate')?.textContent || '';
                    
                    let dateStr = 'Update hari ini';
                    if (pubDate) {
                        try {
                            const d = new Date(pubDate);
                            dateStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
                        } catch (e) {}
                    }
                    return {
                        title: title,
                        excerpt: description.replace(/<[^>]*>/g, '').slice(0, 110) + '...',
                        url: link,
                        meta: dateStr,
                        source: 'CNBC Indonesia'
                    };
                });
            }
        } catch (e) {
            console.warn('CNBC Indonesia feed failed, falling back to local business news:', e);
        }

        // 1. Forex News (Business Category)
        if (stacks.forex && globalNewsData.Business) {
            const forexNews = globalNewsData.Business.slice(0, 3).map(item => ({
                title: item.title,
                excerpt: `Klik untuk membaca selengkapnya dari ${item.source}. Berita pasar global dan tren ekonomi makro ter-update.`,
                url: item.link,
                meta: 'Baru saja',
                source: item.source,
                image: item.og
            }));
            renderNewsStack(stacks.forex, forexNews, 'forex');
        }

        // 2. Crypto News (Filter Technology & Business for Crypto keywords)
        if (stacks.crypto) {
            const allTechBusiness = [...(globalNewsData.Technology || []), ...(globalNewsData.Business || [])];
            const cryptoKeywords = ['bitcoin', 'crypto', 'ethereum', 'coin', 'token', 'blockchain', 'solana', 'sec', 'etf', 'btc', 'eth', 'binance', 'crypto'];
            const cryptoFiltered = allTechBusiness.filter(item => {
                const titleLower = item.title.toLowerCase();
                return cryptoKeywords.some(kw => titleLower.includes(kw));
            });
            const finalCrypto = (cryptoFiltered.length > 0 ? cryptoFiltered : (globalNewsData.Technology || [])).slice(0, 3).map(item => ({
                title: item.title,
                excerpt: `Laporan ter-update mengenai pasar teknologi dan aset digital via ${item.source}.`,
                url: item.link,
                meta: 'HOT',
                source: item.source,
                image: item.og
            }));
            renderNewsStack(stacks.crypto, finalCrypto, 'crypto');
        }

        // 3. Index Lokal News (CNBC Indonesia RSS with fallback)
        if (stacks.index) {
            if (cnbcNews.length > 0) {
                renderNewsStack(stacks.index, cnbcNews.slice(0, 3), 'index');
            } else {
                const fallbackLocal = (globalNewsData.Business || []).slice(4, 7).map(item => ({
                    title: item.title,
                    excerpt: `Analisis pasar dan pergerakan indeks saham global melalui ${item.source}.`,
                    url: item.link,
                    meta: 'Market Update',
                    source: item.source,
                    image: item.og
                }));
                renderNewsStack(stacks.index, fallbackLocal, 'index');
            }
        }

        // 4. Commodities News (Filter Business & World for commodity terms)
        if (stacks.commodities) {
            const allCommoditySources = [...(globalNewsData.Business || []), ...(globalNewsData.World || [])];
            const commodityKeywords = ['gold', 'oil', 'brent', 'gas', 'copper', 'silver', 'metal', 'emas', 'minyak', 'batu bara', 'komoditas'];
            const commodityFiltered = allCommoditySources.filter(item => {
                const titleLower = item.title.toLowerCase();
                return commodityKeywords.some(kw => titleLower.includes(kw));
            });
            const finalCommodities = (commodityFiltered.length > 0 ? commodityFiltered : (globalNewsData.World || [])).slice(0, 3).map(item => ({
                title: item.title,
                excerpt: `Harga komoditas energi, logam mulia, dan ketahanan suplai logistik global.`,
                url: item.link,
                meta: 'Komoditas',
                source: item.source,
                image: item.og
            }));
            renderNewsStack(stacks.commodities, finalCommodities, 'commodities');
        }

    } catch (error) {
        console.error('Failed to fetch real-time news, falling back to local pool:', error);
        fallbackToLocalNews();
    }
}

function renderNewsStack(container, articles, category) {
    if (!container) return;
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="no-data" style="padding: 30px 10px;">
                <p style="font-size: 0.85rem; color: var(--text-muted);">Tidak ada berita terbaru saat ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = articles.map(news => {
        const hasImage = news.image && news.image.startsWith('http');
        const imgHTML = hasImage ? `
            <div class="news-card-thumbnail" style="width: 80px; height: 60px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; border: 1px solid var(--card-border);">
                <img src="${news.image}" alt="news thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
        ` : '';

        const badgeText = category === 'forex' ? 'UPDATE' :
                          category === 'crypto' ? 'HOT' :
                          category === 'index' ? 'INDEX LOKAL' : 'KOMODITAS';
        const iconName = category === 'forex' ? 'fa-bolt' :
                         category === 'crypto' ? 'fa-fire' :
                         category === 'index' ? 'fa-chart-line' : 'fa-leaf';

        return `
            <a href="${news.url}" target="_blank" class="news-card" style="display: flex; gap: 16px; align-items: flex-start; justify-content: space-between;">
                <div style="flex-grow: 1; padding-right: 8px;">
                    <div class="news-badge-container">
                        <span class="news-badge-breaking">
                            <i class="fa-solid ${iconName}"></i> ${badgeText}
                        </span>
                    </div>
                    <h4 class="news-card-title">${news.title}</h4>
                    <p class="news-card-excerpt">${news.excerpt || 'Klik untuk membaca selengkapnya.'}</p>
                    <div class="news-card-meta">
                        <span><i class="fa-regular fa-clock"></i> ${news.meta}</span>
                        <span>via ${news.source}</span>
                    </div>
                </div>
                ${imgHTML}
            </a>
        `;
    }).join('');
}

function initNewsRefresh() {
    const refreshBtn = document.getElementById('btn-refresh-news');
    if (!refreshBtn) return;

    // Trigger initial fetch of real news
    fetchRealNews();

    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;

        const stacks = document.querySelectorAll('.news-cards-stack');
        stacks.forEach(stack => {
            stack.innerHTML = `
                <div class="no-data" style="padding: 30px 10px;">
                    <i class="fa-solid fa-arrows-rotate animate-spin" style="font-size: 1.5rem; color: var(--color-accent); margin-bottom: 8px;"></i>
                    <p style="font-size: 0.85rem;">Mengambil berita harian ter-update...</p>
                </div>
            `;
        });

        fetchRealNews().finally(() => {
            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
        });
    });
}


/* ==========================================================================
   10. LIVE MARKET FEED & BLOOMBERG TICKER TAPE (REAL-TIME API POLLING)
   Sources (all CORS-enabled, free, no API key):
     - Gold/Metals:  https://api.gold-api.com/price/XAU
     - Forex majors: https://open.er-api.com/v6/latest/USD
     - Crypto:       https://api.coingecko.com/api/v3/simple/price
   ========================================================================== */

// Start empty -> UI shows "loading" until real data arrives. No stale hardcoded values.
window.liveMarketPrices = {
    XAUUSD: null,
    DXY: null,
    EURUSD: null,
    GBPUSD: null,
    AUDUSD: null,
    NZDUSD: null,
    USDJPY: null,
    USDCHF: null,
    USDCAD: null,
    BTCUSD: null
};

// "Open" prices captured on the first successful fetch per session -> drives REAL change %.
window.priceOpenBaseline = {};
// Timestamp of the last successful live fetch (for "last updated" label & LIVE/DEMO status).
window.priceLastUpdated = null;
window.priceLiveSource = false; // true once at least one real API responded

const calculatorPairMap = {
    'eurusd': 'EURUSD',
    'gbpusd': 'GBPUSD',
    'audusd': 'AUDUSD',
    'nzdusd': 'NZDUSD',
    'usdjpy': 'USDJPY',
    'usdchf': 'USDCHF',
    'usdcad': 'USDCAD',
    'xauusd': 'XAUUSD'
};

// All symbols shown in the ticker, in display order.
const TICKER_SYMBOLS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCHF', 'USDCAD', 'DXY', 'BTCUSD'];

// Decimal places per symbol for consistent formatting across the whole app.
function decimalsFor(sym) {
    if (sym === 'BTCUSD') return 0;       // 58,666
    if (sym === 'XAUUSD' || sym === 'DXY') return 2; // 3988.30
    if (sym === 'USDJPY') return 2;       // 162.50
    return 4;                              // EUR/USD 1.0712
}

// Display symbol with slash, e.g. XAUUSD -> XAU/USD, DXY -> DXY
function displaySymbol(sym) {
    if (sym === 'DXY') return 'DXY';
    if (sym === 'BTCUSD') return 'BTC/USD';
    return sym.replace('USD', '/USD').replace('JPY', '/JPY').replace('CHF', '/CHF').replace('CAD', '/CAD');
}

// Thousand-separated formatted price (e.g. 3988.30, 58,666, 1.0712)
function formatPrice(sym, price) {
    if (price === null || price === undefined || isNaN(price)) return '—';
    const d = decimalsFor(sym);
    const fixed = price.toFixed(d);
    if (sym === 'BTCUSD') {
        // integer part with thousands separators, no decimals
        return Number(price).toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return fixed;
}

async function initLiveMarketPrices() {
    const tickerContainer = document.getElementById('ticker-tape-container');
    const calcPairSelect = document.getElementById('calc-pair');
    const calcPriceInput = document.getElementById('calc-price');

    // Render the (empty/loading) ticker shell first if container exists
    if (tickerContainer) {
        populateTicker();
    }

    if (calcPairSelect) {
        calcPairSelect.addEventListener('change', () => {
            const selectedPair = calcPairSelect.value;
            const tickerKey = calculatorPairMap[selectedPair];
            if (tickerKey && calcPriceInput && window.liveMarketPrices[tickerKey] != null) {
                calcPriceInput.value = window.liveMarketPrices[tickerKey].toFixed(5);
            }
        });
    }

    // Initial fetch + start the real polling loop.
    await fetchLivePrices();
    applyPricesToUI(true);
    setInterval(fetchLivePrices, 60000); // poll every 60s
}

// Fetch from all 3 sources in parallel; resilient: one failure doesn't break the others.
async function fetchLivePrices() {
    const results = await Promise.allSettled([
        fetch('https://api.gold-api.com/price/XAU').then(r => r.json()),
        fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json()),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd').then(r => r.json())
    ]);

    let anyLive = false;

    // --- Gold (gold-api.com) ---
    if (results[0].status === 'fulfilled' && results[0].value && typeof results[0].value.price === 'number') {
        window.liveMarketPrices.XAUUSD = results[0].value.price;
        anyLive = true;
    }

    // --- Forex majors (open.er-api.com) ---
    if (results[1].status === 'fulfilled' && results[1].value && results[1].value.rates) {
        const rates = results[1].value.rates;
        if (rates.EUR)  window.liveMarketPrices.EURUSD = 1 / rates.EUR;
        if (rates.GBP)  window.liveMarketPrices.GBPUSD = 1 / rates.GBP;
        if (rates.AUD)  window.liveMarketPrices.AUDUSD = 1 / rates.AUD;
        if (rates.NZD)  window.liveMarketPrices.NZDUSD = 1 / rates.NZD;
        if (rates.JPY)  window.liveMarketPrices.USDJPY = rates.JPY;
        if (rates.CHF)  window.liveMarketPrices.USDCHF = rates.CHF;
        if (rates.CAD)  window.liveMarketPrices.USDCAD = rates.CAD;

        // DXY from the Fed basket formula (derived, never from a single quote).
        const eur = window.liveMarketPrices.EURUSD;
        const jpy = window.liveMarketPrices.USDJPY;
        const gbp = window.liveMarketPrices.GBPUSD;
        const cad = window.liveMarketPrices.USDCAD;
        const chf = window.liveMarketPrices.USDCHF;
        if (eur && jpy && gbp && cad && chf) {
            window.liveMarketPrices.DXY = 50.14348112 *
                Math.pow(eur, -0.576) *
                Math.pow(jpy, 0.136) *
                Math.pow(gbp, -0.119) *
                Math.pow(cad, 0.091) *
                Math.pow(chf, 0.036);
        }
        anyLive = true;
    }

    // --- Crypto (CoinGecko) ---
    if (results[2].status === 'fulfilled' && results[2].value && results[2].value.bitcoin) {
        window.liveMarketPrices.BTCUSD = results[2].value.bitcoin.usd;
        anyLive = true;
    }

    if (anyLive) {
        window.priceLiveSource = true;
        window.priceLastUpdated = new Date();
        // Capture the baseline (session "open") only on the very first successful fetch,
        // so the change % reflects movement since we started watching.
        if (Object.keys(window.priceOpenBaseline).length === 0) {
            for (const sym of TICKER_SYMBOLS) {
                if (window.liveMarketPrices[sym] != null) {
                    window.priceOpenBaseline[sym] = window.liveMarketPrices[sym];
                }
            }
        }
        updateDataStatusIndicator(true);
    } else {
        updateDataStatusIndicator(false);
    }

    applyPricesToUI(false);
}

// Push current prices into every UI surface (ticker, calculator, AI cards, indicators).
function applyPricesToUI(isInitial) {
    const calcPairSelect = document.getElementById('calc-pair');
    const calcPriceInput = document.getElementById('calc-price');

    TICKER_SYMBOLS.forEach(sym => {
        const newPrice = window.liveMarketPrices[sym];
        const openPrice = window.priceOpenBaseline[sym];
        const priceEl = document.getElementById(`ticker-p-${sym}`);
        const arrowEl = document.getElementById(`arrow-${sym}`);

        if (priceEl) {
            const prevText = priceEl.getAttribute('data-price');
            const newText = formatPrice(sym, newPrice);
            priceEl.innerText = newText;
            priceEl.setAttribute('data-price', newText);

            // Flash green/red ONLY when the real price actually moved vs the last tick.
            if (!isInitial && prevText && prevText !== '—' && newText !== '—' && prevText !== newText) {
                const movedUp = parseFloat(newText) >= parseFloat(prevText);
                priceEl.className = `ticker-price ${movedUp ? 'flash-up' : 'flash-down'}`;
                setTimeout(() => { priceEl.className = 'ticker-price'; }, 700);
            }
        }

        // Arrow direction is based on the REAL change vs session open (not random).
        if (arrowEl) {
            let isUp = true;
            if (openPrice && newPrice) {
                isUp = newPrice >= openPrice;
            }
            arrowEl.className = `ticker-arrow ${isUp ? 'up' : 'down'}`;
            arrowEl.innerHTML = isUp ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>';
        }
    });

    // Auto-fill calculator price for USD-base pairs.
    if (calcPairSelect && calcPriceInput && document.activeElement !== calcPriceInput) {
        const currentSelectedPair = calcPairSelect.value;
        const tickerKey = calculatorPairMap[currentSelectedPair];
        if (tickerKey && window.liveMarketPrices[tickerKey] != null) {
            calcPriceInput.value = window.liveMarketPrices[tickerKey].toFixed(5);
        }
    }

    updateAIPairPriceDisplays();
    updateIndicatorLivePrices();
    updateLastUpdatedLabel();
}

function populateTicker() {
    const tickerContainer = document.getElementById('ticker-tape-container');
    const tickerHTML = TICKER_SYMBOLS.map(sym => {
        return `
            <div class="ticker-item" onclick="selectPairFromTicker('${sym}')">
                <span class="ticker-symbol">${displaySymbol(sym)}</span>
                <span class="ticker-arrow up" id="arrow-${sym}"><i class="fa-solid fa-caret-up"></i></span>
                <span class="ticker-price" id="ticker-p-${sym}" data-price="—">—</span>
            </div>
        `;
    }).join('');
    // Duplicate content so the marquee loop is seamless.
    tickerContainer.innerHTML = tickerHTML + tickerHTML;
}

// LIVE / DEMO status badge near the ticker.
function updateDataStatusIndicator(isLive) {
    const statusEl = document.getElementById('data-status-badge');
    if (!statusEl) return;
    if (isLive) {
        statusEl.className = 'data-status-badge live';
        statusEl.innerHTML = '<span class="pulse-dot"></span> LIVE';
    } else {
        statusEl.className = 'data-status-badge demo';
        statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> DEMO';
    }
}

function updateLastUpdatedLabel() {
    const el = document.getElementById('ticker-last-updated');
    if (!el || !window.priceLastUpdated) return;
    const t = window.priceLastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    el.innerText = `Diperbarui ${t} WIB`;
}

// Live price badges on the AI pair cards.
function updateAIPairPriceDisplays() {
    const pairMapping = {
        'xauusd': 'XAUUSD',
        'eurusd': 'EURUSD',
        'gbpusd': 'GBPUSD',
        'audusd': 'AUDUSD',
        'nzdusd': 'NZDUSD',
        'usdjpy': 'USDJPY',
        'usdchf': 'USDCHF',
        'usdcad': 'USDCAD'
    };

    for (const id in pairMapping) {
        const sym = pairMapping[id];
        const card = document.getElementById(`ai-card-${id}`);
        if (!card) continue;
        const header = card.querySelector('.ai-pair-header');
        if (!header) continue;

        let priceSpan = header.querySelector('.ai-live-price-badge');
        if (!priceSpan) {
            priceSpan = document.createElement('span');
            priceSpan.className = 'ai-live-price-badge';
            header.insertBefore(priceSpan, header.querySelector('.ai-sentiment-badge'));
        }
        const currentPrice = window.liveMarketPrices[sym];
        if (currentPrice != null) {
            priceSpan.innerText = `$${formatPrice(sym, currentPrice)}`;
        } else {
            priceSpan.innerText = '—';
        }
    }

    // Keep the AI projection text levels consistent with live prices.
    updateAIProjectionPrices();
}

window.selectPairFromTicker = function(sym) {
    const calcPair = document.getElementById('calc-pair');
    const calcPriceInput = document.getElementById('calc-price');

    if (!calcPair) return;

    const calcKey = Object.keys(calculatorPairMap).find(key => calculatorPairMap[key] === sym);
    if (calcKey) {
        calcPair.value = calcKey;
        calcPair.dispatchEvent(new Event('change'));

        if (calcPriceInput && window.liveMarketPrices[sym] != null) {
            calcPriceInput.value = window.liveMarketPrices[sym].toFixed(5);
        }

        const calcSection = document.getElementById('kalkulator');
        if (calcSection) {
            calcSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

/* ==========================================================================
   10b. SYNC AI PROJECTION TEXT LEVELS WITH LIVE PRICES
   Replaces hardcoded price levels inside the AI projection paragraphs
   (e.g. "$2,340", "1.0720") with live values so the summary, news context
   and indicators always agree on the same real price.
   ========================================================================== */
function updateAIProjectionPrices() {
    const p = window.liveMarketPrices;
    const pairs = {
        'ai-proj-xauusd': p.XAUUSD,
        'ai-proj-eurusd': p.EURUSD,
        'ai-proj-gbpusd': p.GBPUSD,
        'ai-proj-audusd': p.AUDUSD,
        'ai-proj-nzdusd': p.NZDUSD,
        'ai-proj-usdjpy': p.USDJPY,
        'ai-proj-usdchf': p.USDCHF,
        'ai-proj-usdcad': p.USDCAD
    };

    for (const id in pairs) {
        const el = document.getElementById(id);
        const live = pairs[id];
        if (!el || live == null) continue;

        // Use the original (first-loaded) text as the source of truth so we never drift.
        const baseText = el.getAttribute('data-base-text') || el.innerText;
        if (!el.getAttribute('data-base-text')) {
            el.setAttribute('data-base-text', baseText);
        }

        // Replace currency-formatted price tokens: $2,340 / $2320 / $2.340
        const replaced = baseText.replace(/\$\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?/g, (match) => {
            // XAUUSD projections talk in gold dollars ($2,3xx)
            if (id === 'ai-proj-xauusd') return `$${Number(live.toFixed(0)).toLocaleString('en-US')}`;
            return match; // leave forex token replacement below
        });

        // Replace plain decimal levels for forex pairs (1.0720, 1.2680, 0.6620 ...)
        if (id !== 'ai-proj-xauusd') {
            const dec = (live < 10) ? 4 : 2;
            const liveStr = live.toFixed(dec).slice(0, 6);
            const livePrev = (live * 0.998).toFixed(dec).slice(0, 6); // a nearby "support" level
            // Swap the first decimal level found with the live value for context.
            const updated = replaced.replace(/\b\d\.\d{3,4}\b/, liveStr);
            el.innerText = updated;
        } else {
            el.innerText = replaced;
        }
    }
}

/* ==========================================================================
   10c. LIVE PRICE HEADER ON INDICATOR / SENTIMENT CARDS
   ========================================================================== */
function updateIndicatorLivePrices() {
    const cardMap = {
        'indicator-xauusd': 'XAUUSD',
        'indicator-eurusd': 'EURUSD',
        'indicator-gbpusd': 'GBPUSD',
        'indicator-usdjpy': 'USDJPY'
    };

    for (const id in cardMap) {
        const sym = cardMap[id];
        const priceEl = document.getElementById(`${id}-price`);
        const changeEl = document.getElementById(`${id}-change`);
        if (!priceEl) continue;

        const price = window.liveMarketPrices[sym];
        const open = window.priceOpenBaseline[sym];
        if (price != null) {
            priceEl.innerText = formatPrice(sym, price);
        } else {
            priceEl.innerText = '—';
        }

        if (changeEl && price != null && open != null) {
            const pct = ((price - open) / open) * 100;
            const isUp = pct >= 0;
            changeEl.innerText = `${isUp ? '+' : ''}${pct.toFixed(2)}%`;
            changeEl.className = `indicator-change ${isUp ? 'up' : 'down'}`;
        } else if (changeEl) {
            changeEl.innerText = '—';
            changeEl.className = 'indicator-change';
        }
    }
}

/* ==========================================================================
   14. NETWORK TUNNELING MONITOR LOGIC
   ========================================================================== */
function initNetworkMonitor() {
    const pfStatus = document.getElementById('pf-status');
    const pfRequests = document.getElementById('pf-requests');
    const pfLatency = document.getElementById('pf-latency');
    const pfLoss = document.getElementById('pf-loss');
    
    const cfStatus = document.getElementById('cf-status');
    const cfRequests = document.getElementById('cf-requests');
    const cfLatency = document.getElementById('cf-latency');
    const cfLoss = document.getElementById('cf-loss');
    
    const nmapLastScan = document.getElementById('nmap-last-scan');
    const pfExposedList = document.getElementById('pf-exposed-list');
    const cfExposedList = document.getElementById('cf-exposed-list');
    const btnReset = document.getElementById('btn-reset-network-stats');
    
    const ctx = document.getElementById('network-latency-chart');
    if (!ctx) return;
    
    // Initialize Chart.js
    const latencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Request index labels
            datasets: [
                {
                    label: 'Port Forwarding RTT (ms)',
                    data: [],
                    borderColor: '#ff1744', // color-bearish
                    backgroundColor: 'rgba(255, 23, 68, 0.05)',
                    borderWidth: 2,
                    tension: 0.2,
                    pointRadius: 1
                },
                {
                    label: 'Cloudflare Tunnel RTT (ms)',
                    data: [],
                    borderColor: '#00f5a0', // color-teal
                    backgroundColor: 'rgba(0, 245, 160, 0.05)',
                    borderWidth: 2,
                    tension: 0.2,
                    pointRadius: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#ffffff', font: { family: 'Inter' } }
                }
            }
        }
    });

    async function fetchStats() {
        try {
            const res = await fetch('http://localhost:3001/stats');
            if (!res.ok) throw new Error('Offline');
            const data = await res.json();
            
            // Port Forwarding Stats
            pfStatus.innerHTML = '<span class="pulse-dot" style="background-color: var(--color-bullish); display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; box-shadow: 0 0 8px var(--color-bullish);"></span> ONLINE';
            pfStatus.style.background = 'rgba(0, 230, 118, 0.1)';
            pfStatus.style.color = 'var(--color-bullish)';
            pfStatus.style.borderColor = 'rgba(0, 230, 118, 0.2)';
            
            pfRequests.innerText = data.port_forward.requests;
            const pfLats = data.port_forward.latencies;
            const pfAvg = pfLats.length > 0 ? Math.round(pfLats.reduce((a,b)=>a+b, 0) / pfLats.length) : 0;
            pfLatency.innerText = `${pfAvg} ms`;
            
            // Calculate packet loss (requests that timed out in simulation)
            const pfTimeouts = pfLats.filter(l => l > 800).length;
            const pfLossPercent = pfLats.length > 0 ? ((pfTimeouts / pfLats.length) * 100).toFixed(1) : '0.0';
            pfLoss.innerText = `${pfLossPercent}%`;
            pfLoss.style.color = pfLossPercent > 2 ? 'var(--color-bearish)' : 'var(--text-secondary)';
            
            // Cloudflare Stats
            cfStatus.innerHTML = '<span class="pulse-dot" style="background-color: var(--color-bullish); display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; box-shadow: 0 0 8px var(--color-bullish);"></span> ONLINE';
            cfStatus.style.background = 'rgba(0, 230, 118, 0.1)';
            cfStatus.style.color = 'var(--color-bullish)';
            cfStatus.style.borderColor = 'rgba(0, 230, 118, 0.2)';
            
            cfRequests.innerText = data.cloudflare_tunnel.requests;
            const cfLats = data.cloudflare_tunnel.latencies;
            const cfAvg = cfLats.length > 0 ? Math.round(cfLats.reduce((a,b)=>a+b, 0) / cfLats.length) : 0;
            cfLatency.innerText = `${cfAvg} ms`;
            
            const cfTimeouts = cfLats.filter(l => l > 800).length;
            const cfLossPercent = cfLats.length > 0 ? ((cfTimeouts / cfLats.length) * 100).toFixed(1) : '0.0';
            cfLoss.innerText = `${cfLossPercent}%`;
            cfLoss.style.color = cfLossPercent > 2 ? 'var(--color-bearish)' : 'var(--text-secondary)';
            
            // Nmap results
            if (data.nmap_scan && data.nmap_scan.last_scan) {
                const scanTime = new Date(data.nmap_scan.last_scan).toLocaleTimeString();
                nmapLastScan.innerText = `Hari ini pukul ${scanTime}`;
                
                const pfExposed = data.nmap_scan.exposed_ports.port_forward || [];
                pfExposedList.innerHTML = pfExposed.map(p => `<div style="margin-bottom: 2px;"><i class="fa-solid fa-triangle-exclamation" style="color: var(--color-bearish);"></i> ${p}</div>`).join('') || 'Aman / Tidak ada port';
                
                const cfExposed = data.nmap_scan.exposed_ports.cloudflare_tunnel || [];
                cfExposedList.innerHTML = cfExposed.map(p => `<div style="margin-bottom: 2px;"><i class="fa-solid fa-circle-check" style="color: var(--color-teal);"></i> ${p}</div>`).join('') || 'Aman';
            } else {
                nmapLastScan.innerText = 'Belum pernah dijalankan';
                pfExposedList.innerText = 'Scan belum dijalankan.';
                cfExposedList.innerText = 'Scan belum dijalankan.';
            }
            
            // Update Latency Chart
            const maxLength = Math.max(pfLats.length, cfLats.length);
            const labels = Array.from({length: maxLength}, (_, i) => i + 1);
            
            latencyChart.data.labels = labels;
            // Clean up visual presentation of timeouts to avoid visual scale breaking
            latencyChart.data.datasets[0].data = pfLats.map(l => l > 800 ? null : l);
            latencyChart.data.datasets[1].data = cfLats.map(l => l > 800 ? null : l);
            latencyChart.update('none'); // silent update
            
        } catch (err) {
            // Set offline indicators
            pfStatus.innerHTML = '<span class="pulse-dot" style="background-color: var(--color-bearish); display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; box-shadow: 0 0 8px var(--color-bearish);"></span> OFFLINE';
            pfStatus.style.background = 'rgba(255, 23, 68, 0.1)';
            pfStatus.style.color = 'var(--color-bearish)';
            pfStatus.style.borderColor = 'rgba(255, 23, 68, 0.2)';
            
            cfStatus.innerHTML = '<span class="pulse-dot" style="background-color: var(--color-bearish); display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; box-shadow: 0 0 8px var(--color-bearish);"></span> OFFLINE';
            cfStatus.style.background = 'rgba(255, 23, 68, 0.1)';
            cfStatus.style.color = 'var(--color-bearish)';
            cfStatus.style.borderColor = 'rgba(255, 23, 68, 0.2)';
        }
    }
    
    // Set up reset listener
    if (btnReset) {
        btnReset.addEventListener('click', async () => {
            try {
                await fetch('http://localhost:3001/reset', { method: 'POST' });
                fetchStats();
            } catch(e) {}
        });
    }
    
    // Poll stats every 1 second
    setInterval(fetchStats, 1000);
    fetchStats();
}

