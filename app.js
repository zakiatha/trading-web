document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initMobileMenu();
    initRiskCalculator();
    init3DBackground();
    initActiveLinkTracker();
    initNewsTabs();
    initTradingJournal();
    initTradingPlan();
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

    // Load existing plan
    const savedPlan = JSON.parse(localStorage.getItem('tradevision_plan')) || {
        rules: '',
        setup: '',
        exit: ''
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
   7. TRADING JOURNAL LOGIC
   ========================================================================== */
function initTradingJournal() {
    const journalForm = document.getElementById('journal-form');
    const lossDetailsGroup = document.getElementById('loss-details-group');
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

    // Show/hide loss fields based on status
    journalStatus.addEventListener('change', () => {
        if (journalStatus.value === 'LOSS') {
            lossDetailsGroup.classList.remove('hidden');
        } else {
            lossDetailsGroup.classList.add('hidden');
        }
    });

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
        const pair = document.getElementById('journal-pair').value.toUpperCase().trim();
        const type = document.getElementById('journal-type').value;
        const entry = parseFloat(document.getElementById('journal-entry').value) || 0;
        const sl = parseFloat(document.getElementById('journal-sl').value) || 0;
        const tp = parseFloat(document.getElementById('journal-tp').value) || 0;
        const emotion = document.getElementById('journal-emotion').value;
        const reason = document.getElementById('journal-reason').value.trim();
        const status = document.getElementById('journal-status').value;
        const pnl = parseFloat(document.getElementById('journal-pnl').value) || 0;
        const lossCause = status === 'LOSS' ? document.getElementById('journal-loss-cause').value : '';
        const selfCritique = status === 'LOSS' ? document.getElementById('journal-self-critique').value.trim() : '';

        if (id) {
            // Edit existing
            const index = trades.findIndex(t => t.id === id);
            if (index !== -1) {
                trades[index] = {
                    ...trades[index],
                    pair, type, entry, sl, tp, emotion, reason, status, pnl, lossCause, selfCritique
                };
            }
        } else {
            // Add new
            const newTrade = {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                pair, type, entry, sl, tp, emotion, reason, status, pnl, lossCause, selfCritique
            };
            trades.unshift(newTrade);
        }

        saveTrades();
        renderTrades();
        updateStats();
        updateWallOfShame();
        resetForm();
    });

    // Initial render & stats
    renderTrades();
    updateStats();
    updateWallOfShame();

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
                        <div class="trade-reason">
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

    // Expose functions globally for onclick handlers in dynamically generated HTML
    window.deleteTrade = function(id) {
        if (confirm('Apakah Anda yakin ingin menghapus trade ini?')) {
            trades = trades.filter(t => t.id !== id);
            saveTrades();
            renderTrades();
            updateStats();
            updateWallOfShame();
            resetForm();
        }
    };

    window.editTrade = function(id) {
        const trade = trades.find(t => t.id === id);
        if (!trade) return;

        document.getElementById('journal-id').value = trade.id;
        document.getElementById('journal-pair').value = trade.pair;
        document.getElementById('journal-type').value = trade.type;
        document.getElementById('journal-entry').value = trade.entry || '';
        document.getElementById('journal-sl').value = trade.sl || '';
        document.getElementById('journal-tp').value = trade.tp || '';
        document.getElementById('journal-emotion').value = trade.emotion;
        document.getElementById('journal-reason').value = trade.reason;
        document.getElementById('journal-status').value = trade.status;
        document.getElementById('journal-pnl').value = trade.pnl || '';

        if (trade.status === 'LOSS') {
            lossDetailsGroup.classList.remove('hidden');
            document.getElementById('journal-loss-cause').value = trade.lossCause || 'Market Normal';
            document.getElementById('journal-self-critique').value = trade.selfCritique || '';
        } else {
            lossDetailsGroup.classList.add('hidden');
        }

        document.getElementById('form-title').innerText = 'Edit Catatan Jurnal';
        document.getElementById('btn-save-journal').innerText = 'Simpan Perubahan';
        btnCancelEdit.classList.remove('hidden');

        // Scroll to form
        document.getElementById('jurnal').scrollIntoView({ behavior: 'smooth' });
    };
}

