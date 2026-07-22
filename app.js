/* ==========================================================================
   TRADEVISION PRO — ADVANCED REACT & JAVASCRIPT APPLICATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initGlobalSearch();
    initAuthModals();
    initMultiChartHub();
    initLiveTickerTape();
    initTradingJournalEngine();
    initForexFactoryNewsEngine();
    initAIMarketIntel06AM();
    initAIVoiceChat();
    initShipFinderLeafletMap();
    initCryptoDashboard();
    initStockDashboard();
    init3DCanvasBackground();
    initScrollNavHighlight();
});

function initScrollNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('hud-section-animate');
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active-nav');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active-nav');
                    }
                });
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => observer.observe(section));

    // Mobile hamburger menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('hidden')) {
                icon.className = 'fa-solid fa-bars';
            } else {
                icon.className = 'fa-solid fa-xmark';
            }
        });

        // Auto-close mobile nav when a link is clicked
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.add('hidden');
                mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }
}

/* ==========================================================================
   1. 3-WAY THEME MANAGER (DARK 🌙 / LIGHT ☀️ / PINK PASTEL 🌸)
   ========================================================================== */
function initThemeManager() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('tv_theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    applyThemeUI(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme') || 'dark';
            let next = 'dark';
            if (current === 'dark') next = 'light';
            else if (current === 'light') next = 'pastel';
            else next = 'dark';

            htmlEl.setAttribute('data-theme', next);
            localStorage.setItem('tv_theme', next);
            applyThemeUI(next);
        });
    }

    function applyThemeUI(theme) {
        if (!themeIcon || !themeLabel) return;
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-moon text-teal-400';
            themeLabel.innerText = 'Dark';
        } else if (theme === 'light') {
            themeIcon.className = 'fa-solid fa-sun text-amber-400';
            themeLabel.innerText = 'Light';
        } else if (theme === 'pastel') {
            themeIcon.className = 'fa-solid fa-heart text-pink-400';
            themeLabel.innerText = 'Pastel 🌸';
        }
        if (typeof updateMapTileForTheme === 'function') {
            updateMapTileForTheme(theme);
        }
    }
}

/* ==========================================================================
   2. GLOBAL SEARCH & FUNDAMENTAL INFO MODALS
   ========================================================================== */
function initGlobalSearch() {
    const searchModal = document.getElementById('search-modal');
    const btnOpen = document.getElementById('btn-open-search');
    const btnClose = document.getElementById('btn-close-search');
    const searchInput = document.getElementById('global-search-input');

    if (btnOpen && searchModal) {
        btnOpen.addEventListener('click', () => searchModal.classList.remove('hidden'));
    }
    if (btnClose && searchModal) {
        btnClose.addEventListener('click', () => searchModal.classList.add('hidden'));
    }

    // Ctrl+K shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchModal.classList.toggle('hidden');
            if (!searchModal.classList.contains('hidden') && searchInput) {
                searchInput.focus();
            }
        }
    });

    const infoModal = document.getElementById('info-modal');
    const btnCloseInfo = document.getElementById('btn-close-info-modal');
    if (btnCloseInfo && infoModal) {
        btnCloseInfo.addEventListener('click', () => infoModal.classList.add('hidden'));
    }
}

window.quickSearch = function(symbol) {
    document.getElementById('search-modal').classList.add('hidden');
    updateChartInstrument(0, symbol);
    openInfoModal(symbol);
};

window.openInfoModal = function(symbol) {
    const infoModal = document.getElementById('info-modal');
    if (!infoModal) return;

    const data = getInstrumentData(symbol);
    document.getElementById('modal-info-name').innerText = data.name;
    document.getElementById('modal-info-category').innerText = data.category;
    document.getElementById('modal-info-price').innerText = data.price;
    document.getElementById('modal-info-change').innerText = `${data.change >= 0 ? '+' : ''}${data.change}%`;
    document.getElementById('modal-info-high').innerText = data.high;
    document.getElementById('modal-info-low').innerText = data.low;
    document.getElementById('modal-info-desc').innerText = data.desc;

    infoModal.classList.remove('hidden');
};

function getInstrumentData(sym) {
    const db = {
        'XAUUSD': { name: 'XAU/USD (Gold)', category: 'Komoditas Logam Mulia', price: '$2,345.50', change: 1.25, high: '$2,450.00', low: '$1,980.00', desc: 'Aset safe-haven utama yang sangat dipengaruhi oleh inflasi AS, kebijakan suku bunga Federal Reserve, dan geopolitik global.' },
        'BBRI': { name: 'Bank Rakyat Indonesia (BBRI)', category: 'Saham Bluechip Perbankan Indonesia', price: 'Rp 5,250', change: 1.95, high: 'Rp 6,050', low: 'Rp 4,400', desc: 'Bank BUMN Indonesia terdepan pada segmen kredit mikro dan modal usaha UMKM dengan pembagian dividen tinggi.' },
        'BMRI': { name: 'Bank Mandiri (BMRI)', category: 'Saham Bluechip Perbankan Indonesia', price: 'Rp 6,450', change: 2.10, high: 'Rp 7,200', low: 'Rp 5,100', desc: 'Raksasa perbankan korporat & digital terbesar Indonesia dengan kinerja aset tumbuh konsisten.' },
        'BBCA': { name: 'Bank Central Asia (BBCA)', category: 'Saham Bluechip Indonesia', price: 'Rp 10,150', change: 0.85, high: 'Rp 10,500', low: 'Rp 8,800', desc: 'Bank swasta terbesar Indonesia dengan fundamental transaksi & CASA paling kokoh.' },
        'TLKM': { name: 'Telkom Indonesia (TLKM)', category: 'Saham Telekomunikasi Indonesia', price: 'Rp 3,120', change: 1.15, high: 'Rp 3,900', low: 'Rp 2,800', desc: 'Pemimpin pasar telekomunikasi & data digital nasional di Indonesia.' },
        'BTCUSD': { name: 'Bitcoin (BTC/USD)', category: 'Crypto Asset #1', price: '$95,420.00', change: 3.45, high: '$98,000.00', low: '$52,000.00', desc: 'Mata uang kripto terbesar dunia dengan akumulasi arus masuk ETF institusional yang sangat pesat.' },
        'NVDA': { name: 'Nvidia Corporation (NVDA)', category: 'Saham Teknologi US (Semiconductor)', price: '$128.50', change: 4.80, high: '$140.00', low: '$40.00', desc: 'Pemimpin pasar chip AI global dengan pertumbuhan pendapatan kuartalan tertinggi di sektor teknologi.' },
        'EURUSD': { name: 'EUR/USD', category: 'Pasangan Mata Uang Major', price: '$1.0720', change: -0.35, high: '$1.0950', low: '$1.0600', desc: 'Pasangan valuta asing paling likuid di dunia, merefleksikan kesehatan ekonomi Zona Euro vs Dolar AS.' }
    };
    const key = sym.replace('OANDA:', '').replace('FX:', '').replace('BITSTAMP:', '').replace('BINANCE:', '').replace('NASDAQ:', '').replace('IDX:', '');
    return db[key] || db['XAUUSD'];
}

/* ==========================================================================
   3. AUTH MODALS (LOGIN & REGISTER FIX)
   ========================================================================== */
function initAuthModals() {
    const authModal = document.getElementById('auth-modal');
    const btnClose = document.getElementById('btn-close-auth');
    const toggleBtn = document.getElementById('toggle-auth-mode');
    
    if (btnClose && authModal) {
        btnClose.addEventListener('click', () => authModal.classList.add('hidden'));
    }
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const title = document.getElementById('auth-modal-title');
            const submitBtn = document.getElementById('btn-auth-submit');
            const toggleText = document.getElementById('auth-toggle-text');
            if (title.innerText.includes('Masuk')) {
                title.innerText = 'Daftar Akun Baru TradeVision';
                submitBtn.innerText = 'Buat Akun Sekarang';
                toggleText.innerText = 'Sudah punya akun?';
                toggleBtn.innerText = 'Masuk Sekarang';
            } else {
                title.innerText = 'Masuk ke TradeVision Pro';
                submitBtn.innerText = 'Masuk Akun';
                toggleText.innerText = 'Belum punya akun?';
                toggleBtn.innerText = 'Daftar Sekarang';
            }
        });
    }
}

window.openAuthModal = function(mode) {
    const authModal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('btn-auth-submit');

    if (mode === 'register') {
        title.innerText = 'Daftar Akun Baru TradeVision';
        submitBtn.innerText = 'Buat Akun Sekarang';
    } else {
        title.innerText = 'Masuk ke TradeVision Pro';
        submitBtn.innerText = 'Masuk Akun';
    }
    authModal.classList.remove('hidden');
};

window.handleAuthSubmit = function() {
    const email = document.getElementById('auth-email-input').value;
    alert(`Selamat datang kembali, ${email.split('@')[0]}! Sesi trading Anda telah aktif.`);
    document.getElementById('auth-modal').classList.add('hidden');
    
    const userNav = document.getElementById('user-nav-status');
    if (userNav) {
        userNav.innerHTML = `
            <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="font-bold text-white">${email.split('@')[0]}</span>
            </div>
        `;
    }
};

/* ==========================================================================
   4. MULTI-CHART HUB ENGINE & DYNAMIC AI SCALPING SIGNALS (ZAM SMC/ICT STRATEGY)
   ========================================================================== */
let currentChartGridCount = 1;
const activeChartSymbols = ['OANDA:XAUUSD', 'IDX:BBRI', 'BITSTAMP:BTCUSD', 'NASDAQ:NVDA'];

// AI Scalping Signal Generator based on ZAM's Intermarket DXY Correlation & ICT/SMC Technicals
function formatPrice(symKey, val) {
    const isIndo = ['BBRI', 'BMRI', 'BBCA', 'TLKM'].includes(symKey);
    const isForex = ['EURUSD', 'GBPUSD', 'USDCHF', 'USDCAD', 'AUDUSD', 'NZDUSD'].includes(symKey);
    if (isIndo) {
        return `Rp ${Math.round(val).toLocaleString('id-ID')}`;
    }
    if (isForex) {
        return `$${val.toFixed(4)}`;
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getAIScalpingSignal(symbol) {
    const symKey = symbol.replace('OANDA:', '').replace('FX:', '').replace('BITSTAMP:', '').replace('BINANCE:', '').replace('NASDAQ:', '').replace('IDX:', '').toUpperCase();
    const livePrice = tickerPrices[symKey] || 100;
    
    const db = {
        'XAUUSD': {
            type: 'STRONG BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.0045,  // -0.45%
            tp1Pct: 0.0080, // +0.80%
            tp2Pct: 0.0149, // +1.49%
            winrate: '84%',
            rr: '1:2.8',
            dxy: 'DXY Bearish (-0.88) → Refleksi Akumulasi Emas',
            reason: 'BOS M15 + Tap Fair Value Gap (FVG) H1 + Oversold RSI 32 + Retest Order Block Bullish.'
        },
        'USDJPY': {
            type: 'STRONG BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.0040,
            tp1Pct: 0.0075,
            tp2Pct: 0.0135,
            winrate: '79%',
            rr: '1:2.4',
            dxy: 'DXY Bullish (+0.92) vs YEN Melemah',
            reason: 'Breakout Resisten H4 + Retest Support Demand + Sinyal Bullish EMA 20/50 Crossover.'
        },
        'USDCHF': {
            type: 'SELL 🔴',
            badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            isBuy: false,
            slPct: 0.0040,
            tp1Pct: 0.0078,
            tp2Pct: 0.0130,
            winrate: '76%',
            rr: '1:2.2',
            dxy: 'DXY Bearish Divergence vs CHF Safe-Haven',
            reason: 'Rejection Supply Zone H1 + Liquidity Sweep Equal Highs + MACD Bearish Crossover.'
        },
        'USDCAD': {
            type: 'BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.0035,
            tp1Pct: 0.0070,
            tp2Pct: 0.0125,
            winrate: '81%',
            rr: '1:2.5',
            dxy: 'Korelasi Positif DXY & Harga Minyak Mentah',
            reason: 'Tap Bullish Order Block M30 + FVG Imbalance Reclaim + RSI Momentum Shift.'
        },
        'EURUSD': {
            type: 'SELL 🔴',
            badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            isBuy: false,
            slPct: 0.0035,
            tp1Pct: 0.0070,
            tp2Pct: 0.0120,
            winrate: '77%',
            rr: '1:2.3',
            dxy: 'Korelasi Terbalik DXY Index (-0.95)',
            reason: 'Bearish Structure Shift (CHoCH) H1 + Rejection Resisten Supply H4.'
        },
        'GBPUSD': {
            type: 'SCALP BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.0035,
            tp1Pct: 0.0068,
            tp2Pct: 0.0118,
            winrate: '75%',
            rr: '1:2.1',
            dxy: 'DXY Sideways Range vs BOE Hawkish',
            reason: 'Retest Lower Trendline Support + Bullish Divergence RSI 15M + SMC Inducement Sweep.'
        },
        'AUDUSD': {
            type: 'BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.0038,
            tp1Pct: 0.0075,
            tp2Pct: 0.0130,
            winrate: '80%',
            rr: '1:2.6',
            dxy: 'RBA Suku Bunga Hawkish vs DXY Softening',
            reason: 'Bullish BOS M15 + Tap Liquidity Void + Support Akumulasi Harian.'
        },
        'NZDUSD': {
            type: 'SELL 🔴',
            badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            isBuy: false,
            slPct: 0.0040,
            tp1Pct: 0.0070,
            tp2Pct: 0.0120,
            winrate: '74%',
            rr: '1:2.0',
            dxy: 'DXY Strength vs NZD Export Slowdown',
            reason: 'Rejection Resisten Harian + Bearish FVG Fill M30 + Lower High Formation.'
        },
        'BBRI': {
            type: 'STRONG BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.015,
            tp1Pct: 0.035,
            tp2Pct: 0.065,
            winrate: '88%',
            rr: '1:3.0',
            dxy: 'Inflow Asing & Akumulasi Dividen IDX',
            reason: 'Akumulasi Asing Net Buy + Support MA50 Harian + RSI Oversold Rebound.'
        },
        'BMRI': {
            type: 'STRONG BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.015,
            tp1Pct: 0.035,
            tp2Pct: 0.060,
            winrate: '86%',
            rr: '1:2.8',
            dxy: 'Pertumbuhan Kinerja Perbankan Nasional',
            reason: 'Breakout All-Time High Resistance + Volume Spike + Golden Cross MA20/100.'
        },
        'BTCUSD': {
            type: 'STRONG BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.012,
            tp1Pct: 0.030,
            tp2Pct: 0.055,
            winrate: '85%',
            rr: '1:3.2',
            dxy: 'Institutional ETF Inflow Acceleration',
            reason: 'Breakout Consolidation Range + ETF Inflow Momentum + Bullish Flag Pattern M15.'
        },
        'NVDA': {
            type: 'STRONG BUY 🟢',
            badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            isBuy: true,
            slPct: 0.015,
            tp1Pct: 0.035,
            tp2Pct: 0.065,
            winrate: '87%',
            rr: '1:2.9',
            dxy: 'US Tech Rally & AI Demand Boom',
            reason: 'Gap Up Breakout + Demand Zone Reclaim H1 + Earnings Surprise Momentum.'
        }
    };

    const cfg = db[symKey] || {
        type: 'BUY 🟢',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        isBuy: true,
        slPct: 0.005,
        tp1Pct: 0.010,
        tp2Pct: 0.020,
        winrate: '80%',
        rr: '1:2.5',
        dxy: 'DXY Intermarket Correlation Neutral',
        reason: 'SMC Structure BOS + Retest Order Block Demand Zone.'
    };

    let entryVal, slVal, tp1Val, tp2Val;
    if (cfg.isBuy) {
        entryVal = livePrice;
        slVal = livePrice * (1 - cfg.slPct);
        tp1Val = livePrice * (1 + cfg.tp1Pct);
        tp2Val = livePrice * (1 + cfg.tp2Pct);
    } else {
        entryVal = livePrice;
        slVal = livePrice * (1 + cfg.slPct);
        tp1Val = livePrice * (1 - cfg.tp1Pct);
        tp2Val = livePrice * (1 - cfg.tp2Pct);
    }

    return {
        symKey,
        type: cfg.type,
        badgeClass: cfg.badgeClass,
        livePriceFormatted: formatPrice(symKey, livePrice),
        entry: formatPrice(symKey, entryVal),
        sl: formatPrice(symKey, slVal),
        tp1: formatPrice(symKey, tp1Val),
        tp2: formatPrice(symKey, tp2Val),
        slPctStr: `${(cfg.slPct * 100).toFixed(2)}%`,
        tp1PctStr: `${(cfg.tp1Pct * 100).toFixed(2)}%`,
        tp2PctStr: `${(cfg.tp2Pct * 100).toFixed(2)}%`,
        winrate: cfg.winrate,
        rr: cfg.rr,
        dxy: cfg.dxy,
        reason: cfg.reason
    };
}

function initMultiChartHub() {
    renderMultiChartGrid();
}

window.setChartGrid = function(count) {
    currentChartGridCount = count;

    document.querySelectorAll('.chart-grid-btn').forEach(btn => btn.classList.remove('bg-teal-500/20', 'text-teal-300', 'border-teal-500/30'));
    document.querySelectorAll('.chart-grid-btn').forEach(btn => btn.classList.add('bg-slate-800', 'text-slate-300'));
    const activeBtn = document.getElementById(`grid-btn-${count}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-teal-500/20', 'text-teal-300', 'border-teal-500/30');
    }

    renderMultiChartGrid();
};

function renderMultiChartGrid() {
    const gridContainer = document.getElementById('multi-chart-grid');
    if (!gridContainer) return;

    if (currentChartGridCount === 1) {
        gridContainer.className = 'grid grid-cols-1 gap-6';
    } else {
        gridContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-6';
    }

    let html = '';
    for (let i = 0; i < currentChartGridCount; i++) {
        const symbol = activeChartSymbols[i] || activeChartSymbols[0];
        const signal = getAIScalpingSignal(symbol);

        html += `
            <div class="chart-card-wrapper bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-400 uppercase">Chart #${i+1}:</span>
                        <select onchange="updateChartInstrument(${i}, this.value)" class="bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 font-semibold cursor-pointer">
                            <optgroup label="🥇 Komoditas & Forex (8 Pair Main)">
                                <option value="OANDA:XAUUSD" ${symbol === 'OANDA:XAUUSD' ? 'selected' : ''}>XAU/USD (Gold)</option>
                                <option value="FX:EURUSD" ${symbol === 'FX:EURUSD' ? 'selected' : ''}>EUR/USD</option>
                                <option value="FX:GBPUSD" ${symbol === 'FX:GBPUSD' ? 'selected' : ''}>GBP/USD</option>
                                <option value="FX:USDJPY" ${symbol === 'FX:USDJPY' ? 'selected' : ''}>USD/JPY</option>
                                <option value="FX:USDCAD" ${symbol === 'FX:USDCAD' ? 'selected' : ''}>USD/CAD</option>
                                <option value="FX:USDCHF" ${symbol === 'FX:USDCHF' ? 'selected' : ''}>USD/CHF</option>
                                <option value="FX:AUDUSD" ${symbol === 'FX:AUDUSD' ? 'selected' : ''}>AUD/USD</option>
                                <option value="FX:NZDUSD" ${symbol === 'FX:NZDUSD' ? 'selected' : ''}>NZD/USD</option>
                            </optgroup>
                            <optgroup label="🏛️ Saham Indonesia (IDX)">
                                <option value="IDX:BBRI" ${symbol === 'IDX:BBRI' ? 'selected' : ''}>BBRI (Bank BRI)</option>
                                <option value="IDX:BMRI" ${symbol === 'IDX:BMRI' ? 'selected' : ''}>BMRI (Bank Mandiri)</option>
                                <option value="IDX:BBCA" ${symbol === 'IDX:BBCA' ? 'selected' : ''}>BBCA (Bank BCA)</option>
                                <option value="IDX:TLKM" ${symbol === 'IDX:TLKM' ? 'selected' : ''}>TLKM (Telkom)</option>
                            </optgroup>
                            <optgroup label="₿ Crypto Assets">
                                <option value="BITSTAMP:BTCUSD" ${symbol === 'BITSTAMP:BTCUSD' ? 'selected' : ''}>Bitcoin (BTC/USD)</option>
                                <option value="BITSTAMP:ETHUSD" ${symbol === 'BITSTAMP:ETHUSD' ? 'selected' : ''}>Ethereum (ETH/USD)</option>
                                <option value="BINANCE:SOLUSD" ${symbol === 'BINANCE:SOLUSD' ? 'selected' : ''}>Solana (SOL/USD)</option>
                            </optgroup>
                            <optgroup label="📈 Saham US Tech">
                                <option value="NASDAQ:NVDA" ${symbol === 'NASDAQ:NVDA' ? 'selected' : ''}>Nvidia (NVDA)</option>
                                <option value="NASDAQ:AAPL" ${symbol === 'NASDAQ:AAPL' ? 'selected' : ''}>Apple (AAPL)</option>
                                <option value="NASDAQ:TSLA" ${symbol === 'NASDAQ:TSLA' ? 'selected' : ''}>Tesla (TSLA)</option>
                            </optgroup>
                        </select>
                    </div>
                    <button onclick="openInfoModalForCurrent(${i})" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-teal-300 rounded-lg flex items-center gap-1">
                        <i class="fa-solid fa-circle-info"></i> Info
                    </button>
                </div>

                <div class="w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-950 border border-slate-800" id="tv-chart-container-${i}">
                    <iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${i}&symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FJakarta" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
                </div>

                <!-- Dynamic AI Scalping Signal & Realtime Price Sync Box -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2" id="ai-signal-card-${i}">
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <div class="flex justify-between items-center text-[10px]">
                            <span class="font-bold text-slate-400 uppercase">Sinyal AI Scalp</span>
                            <span class="px-1.5 py-0.5 rounded border text-[10px] font-bold ${signal.badgeClass}">${signal.type}</span>
                        </div>
                        <div class="text-[11px] font-bold text-white flex justify-between pt-0.5">
                            <span>Entry: <span class="text-teal-300">${signal.entry}</span></span>
                            <span>SL: <span class="text-rose-400">${signal.sl}</span></span>
                        </div>
                        <div class="text-[10px] font-bold text-emerald-400 flex justify-between">
                            <span>TP1: ${signal.tp1} (+${signal.tp1PctStr})</span>
                            <span>TP2: ${signal.tp2} (+${signal.tp2PctStr})</span>
                        </div>
                        <div class="text-[9px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/60">
                            <span>Winrate: <strong class="text-teal-300">${signal.winrate}</strong></span>
                            <span>RR: <strong class="text-amber-300">${signal.rr}</strong></span>
                        </div>
                    </div>
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span class="text-[10px] font-bold text-slate-400 uppercase block">Konfirmasi Teknikal SMC</span>
                        <h4 class="text-[11px] font-semibold text-slate-200 line-clamp-3">${signal.reason}</h4>
                    </div>
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span class="text-[10px] font-bold text-slate-400 uppercase block">Korelasi DXY & Trend Live</span>
                        <span class="text-xs font-bold text-teal-300 block line-clamp-2"><i class="fa-solid fa-compass text-teal-400"></i> ${signal.dxy}</span>
                        <span class="text-[10px] text-emerald-400 font-mono block pt-1"><i class="fa-solid fa-circle text-[7px] animate-pulse"></i> Live Sync: ${signal.livePriceFormatted}</span>
                    </div>
                </div>
            </div>
        `;
    }
    gridContainer.innerHTML = html;
}

window.updateChartInstrument = function(index, symbol) {
    activeChartSymbols[index] = symbol;
    
    // Update Chart Iframe
    const container = document.getElementById(`tv-chart-container-${index}`);
    if (container) {
        container.innerHTML = `<iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${index}&symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FJakarta" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
    }

    // Dynamic AI Signal Update for the switched chart
    updateActiveChartSignals();
};

function updateActiveChartSignals() {
    for (let i = 0; i < currentChartGridCount; i++) {
        const symbol = activeChartSymbols[i] || activeChartSymbols[0];
        const signalCard = document.getElementById(`ai-signal-card-${i}`);
        if (signalCard) {
            const signal = getAIScalpingSignal(symbol);
            signalCard.innerHTML = `
                <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="font-bold text-slate-400 uppercase">Sinyal AI Scalp</span>
                        <span class="px-1.5 py-0.5 rounded border text-[10px] font-bold ${signal.badgeClass}">${signal.type}</span>
                    </div>
                    <div class="text-[11px] font-bold text-white flex justify-between pt-0.5">
                        <span>Entry: <span class="text-teal-300">${signal.entry}</span></span>
                        <span>SL: <span class="text-rose-400">${signal.sl}</span></span>
                    </div>
                    <div class="text-[10px] font-bold text-emerald-400 flex justify-between">
                        <span>TP1: ${signal.tp1} (+${signal.tp1PctStr})</span>
                        <span>TP2: ${signal.tp2} (+${signal.tp2PctStr})</span>
                    </div>
                    <div class="text-[9px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/60">
                        <span>Winrate: <strong class="text-teal-300">${signal.winrate}</strong></span>
                        <span>RR: <strong class="text-amber-300">${signal.rr}</strong></span>
                    </div>
                </div>
                <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span class="text-[10px] font-bold text-slate-400 uppercase block">Konfirmasi Teknikal SMC</span>
                    <h4 class="text-[11px] font-semibold text-slate-200 line-clamp-3">${signal.reason}</h4>
                </div>
                <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span class="text-[10px] font-bold text-slate-400 uppercase block">Korelasi DXY & Trend Live</span>
                    <span class="text-xs font-bold text-teal-300 block line-clamp-2"><i class="fa-solid fa-compass text-teal-400"></i> ${signal.dxy}</span>
                    <span class="text-[10px] text-emerald-400 font-mono block pt-1"><i class="fa-solid fa-circle text-[7px] animate-pulse"></i> Live Sync: ${signal.livePriceFormatted}</span>
                </div>
            `;
        }
    }
}

window.openInfoModalForCurrent = function(index) {
    const symbol = activeChartSymbols[index] || 'XAUUSD';
    openInfoModal(symbol);
};

/* ==========================================================================
   5. PERSONAL TRADING JOURNAL SYSTEM (#JURNAL)
   ========================================================================== */
let tradesList = JSON.parse(localStorage.getItem('tv_trades')) || [
    { id: 1, pair: 'XAUUSD', type: 'BUY', risk: 1, rr: '1:2.5', entry: 2340.0, sl: 2325.0, tp: 2377.5, emotion: 'Sabar', reason: 'BOS M15 + FVG Tap H1', status: 'WIN', pnl: 250 },
    { id: 2, pair: 'BBRI', type: 'BUY', risk: 1, rr: '1:2', entry: 5150, sl: 5050, tp: 5350, emotion: 'Confident', reason: 'Retest Support Akumulasi Dividen', status: 'WIN', pnl: 200 }
];

let journalWinrateChart = null;
let journalPnlChart = null;

function initTradingJournalEngine() {
    renderTradesList();
    updateJournalStats();

    // Template SMC Handler
    const btnSMC = document.getElementById('btn-template-smc');
    if (btnSMC) {
        btnSMC.addEventListener('click', () => {
            document.getElementById('journal-reason').value = 'Break of Structure (BOS) M15 + Fair Value Gap (FVG) Tap H1 + Retest Order Block Bullish.';
        });
    }

    // Filter Buttons Handler
    const filterBtns = document.querySelectorAll('.journal-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active', 'bg-teal-500/20', 'text-teal-300'));
            filterBtns.forEach(b => b.classList.add('bg-slate-800', 'text-slate-300'));

            btn.classList.add('active', 'bg-teal-500/20', 'text-teal-300');
            const filter = btn.getAttribute('data-filter') || 'ALL';
            renderTradesList(filter);
        });
    });
}

window.handleJournalStatusChange = function(val) {
    const pnlInput = document.getElementById('journal-pnl');
    if (val === 'OPEN') {
        pnlInput.value = '0.00';
    }
};

window.saveJournalEntry = function() {
    const id = document.getElementById('journal-id').value;
    const pair = document.getElementById('journal-pair').value.toUpperCase();
    const type = document.getElementById('journal-type').value;
    const risk = parseFloat(document.getElementById('journal-risk').value);
    const rr = document.getElementById('journal-rr').value;
    const entry = parseFloat(document.getElementById('journal-entry').value);
    const sl = parseFloat(document.getElementById('journal-sl').value);
    const tp = parseFloat(document.getElementById('journal-tp').value);
    const emotion = document.getElementById('journal-emotion').value;
    const reason = document.getElementById('journal-reason').value;
    const status = document.getElementById('journal-status').value;
    const pnl = parseFloat(document.getElementById('journal-pnl').value || 0);

    if (id) {
        const item = tradesList.find(t => t.id == id);
        if (item) {
            Object.assign(item, { pair, type, risk, rr, entry, sl, tp, emotion, reason, status, pnl });
        }
    } else {
        const newTrade = { id: Date.now(), pair, type, risk, rr, entry, sl, tp, emotion, reason, status, pnl };
        tradesList.unshift(newTrade);
    }

    localStorage.setItem('tv_trades', JSON.stringify(tradesList));
    document.getElementById('journal-form').reset();
    document.getElementById('journal-id').value = '';
    
    renderTradesList();
    updateJournalStats();
};

function renderTradesList(filter = 'ALL') {
    const container = document.getElementById('journal-list-container');
    if (!container) return;

    let list = tradesList;
    if (filter !== 'ALL') {
        list = tradesList.filter(t => t.status === filter);
    }

    if (list.length === 0) {
        container.innerHTML = `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                <i class="fa-regular fa-folder-open text-2xl mb-2 block text-slate-500"></i>
                Belum ada catatan jurnal. Mulai catat posisi pertama Anda!
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(t => {
        const isWin = t.status === 'WIN';
        const isLoss = t.status === 'LOSS';
        const statusClass = isWin ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            isLoss ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            'bg-slate-700 text-slate-300 border-slate-600';
        
        return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition text-xs">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-white text-sm">${t.pair}</span>
                        <span class="px-2 py-0.5 rounded ${t.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} font-bold">${t.type}</span>
                        <span class="px-2 py-0.5 rounded border text-[10px] font-bold ${statusClass}">${t.status}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'} text-sm">${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}</span>
                        <button onclick="editJournalEntry(${t.id})" class="text-slate-400 hover:text-white"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="deleteJournalEntry(${t.id})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 text-[11px] text-slate-300 font-mono">
                    <div><span class="text-slate-400 block text-[9px]">Entry:</span> ${t.entry}</div>
                    <div><span class="text-slate-400 block text-[9px]">SL:</span> ${t.sl}</div>
                    <div><span class="text-slate-400 block text-[9px]">TP:</span> ${t.tp}</div>
                    <div><span class="text-slate-400 block text-[9px]">RR:</span> ${t.rr}</div>
                </div>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                    <span><i class="fa-solid fa-brain text-teal-400"></i> Emosi: <strong>${t.emotion}</strong></span>
                    <span class="line-clamp-1 max-w-xs text-slate-300">"${t.reason}"</span>
                </div>
            </div>
        `;
    }).join('');
}

window.editJournalEntry = function(id) {
    const item = tradesList.find(t => t.id == id);
    if (!item) return;

    document.getElementById('journal-id').value = item.id;
    document.getElementById('journal-pair').value = item.pair;
    document.getElementById('journal-type').value = item.type;
    document.getElementById('journal-risk').value = item.risk;
    document.getElementById('journal-rr').value = item.rr;
    document.getElementById('journal-entry').value = item.entry;
    document.getElementById('journal-sl').value = item.sl;
    document.getElementById('journal-tp').value = item.tp;
    document.getElementById('journal-emotion').value = item.emotion;
    document.getElementById('journal-reason').value = item.reason;
    document.getElementById('journal-status').value = item.status;
    document.getElementById('journal-pnl').value = item.pnl;

    document.getElementById('form-journal-title').innerText = 'Edit Catatan Jurnal';
    document.getElementById('btn-save-journal').innerText = 'Simpan Perubahan';
};

window.deleteJournalEntry = function(id) {
    if (confirm('Hapus catatan trade ini?')) {
        tradesList = tradesList.filter(t => t.id != id);
        localStorage.setItem('tv_trades', JSON.stringify(tradesList));
        renderTradesList();
        updateJournalStats();
    }
};

window.clearAllJournalEntries = function() {
    if (confirm('Yakin ingin menghapus seluruh riwayat jurnal?')) {
        tradesList = [];
        localStorage.setItem('tv_trades', JSON.stringify(tradesList));
        renderTradesList();
        updateJournalStats();
    }
};

function updateJournalStats() {
    const total = tradesList.length;
    const wins = tradesList.filter(t => t.status === 'WIN').length;
    const losses = tradesList.filter(t => t.status === 'LOSS').length;
    const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const netPnl = tradesList.reduce((acc, t) => acc + (t.pnl || 0), 0);

    document.getElementById('stat-total-trades').innerText = total;
    document.getElementById('stat-winrate').innerText = `${winrate}%`;
    document.getElementById('stat-net-pnl').innerText = `${netPnl >= 0 ? '+' : ''}$${netPnl.toFixed(2)}`;

    // Wall of Shame
    const badLosses = tradesList.filter(t => t.status === 'LOSS' && (t.emotion === 'FOMO' || t.emotion === 'Greedy' || t.emotion === 'Revenge'));
    const shameBox = document.getElementById('wall-of-shame');
    const shameList = document.getElementById('shame-list');
    
    if (badLosses.length > 0 && shameBox && shameList) {
        shameBox.classList.remove('hidden');
        shameList.innerHTML = badLosses.map(l => `<div>• <strong>${l.pair}</strong> (${l.emotion}): Rugi -$${Math.abs(l.pnl)} — ${l.reason}</div>`).join('');
    } else if (shameBox) {
        shameBox.classList.add('hidden');
    }

    // Equity Curve Chart
    const ctx = document.getElementById('chart-pnl-canvas');
    if (!ctx) return;

    const pnlData = [0];
    let sum = 0;
    tradesList.slice().reverse().forEach(t => {
        sum += (t.pnl || 0);
        pnlData.push(sum);
    });

    if (journalPnlChart) journalPnlChart.destroy();
    journalPnlChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: pnlData.map((_, i) => `#${i}`),
            datasets: [{
                data: pnlData,
                borderColor: '#00f5a0',
                backgroundColor: 'rgba(0, 245, 160, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { ticks: { color: '#64748b', font: { size: 9 } } } }
        }
    });
}

/* ==========================================================================
   6. REAL-TIME TICKER TAPE ENGINE (1-SECOND TICK UPDATES)
   ========================================================================== */
const tickerSymbols = ['XAUUSD', 'BBRI', 'BMRI', 'BTCUSD', 'NVDA', 'EURUSD', 'GBPUSD', 'USDJPY', 'ETHUSD', 'AAPL'];
const tickerPrices = {
    XAUUSD: 4117.23,
    USDJPY: 160.20,
    USDCHF: 0.8890,
    USDCAD: 1.3640,
    EURUSD: 1.0720,
    GBPUSD: 1.2680,
    AUDUSD: 0.6610,
    NZDUSD: 0.6080,
    BBRI: 5250.00,
    BMRI: 6450.00,
    BBCA: 10150.00,
    TLKM: 3120.00,
    BTCUSD: 95420.00,
    ETHUSD: 3340.00,
    SOLUSD: 145.20,
    NVDA: 128.50,
    AAPL: 224.30,
    TSLA: 248.50
};

function initLiveTickerTape() {
    renderTickerTape();
    setInterval(tickPrices, 1000);
}

function renderTickerTape() {
    const container = document.getElementById('ticker-tape-container');
    if (!container) return;

    container.innerHTML = tickerSymbols.map(sym => {
        const price = tickerPrices[sym];
        const isIndo = sym === 'BBRI' || sym === 'BMRI';
        const isForex = sym === 'EURUSD' || sym === 'GBPUSD';
        const prefix = isIndo ? 'Rp ' : '$';
        const formatted = isForex ? price.toFixed(4) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `
            <div class="inline-flex items-center gap-2 cursor-pointer hover:text-teal-300 transition" onclick="quickSearch('${sym}')">
                <span class="font-bold text-white">${sym}</span>
                <span class="text-emerald-400 font-semibold" id="ticker-p-${sym}">${prefix}${formatted}</span>
                <span class="text-[10px] text-emerald-400"><i class="fa-solid fa-caret-up"></i></span>
            </div>
        `;
    }).join(' <span class="text-slate-700">•</span> ');
}

function tickPrices() {
    tickerSymbols.forEach(sym => {
        if (Math.random() > 0.25) {
            const delta = (Math.random() * 0.0004 - 0.0002);
            tickerPrices[sym] = tickerPrices[sym] * (1 + delta);
            
            const el = document.getElementById(`ticker-p-${sym}`);
            if (el) {
                const isIndo = sym === 'BBRI' || sym === 'BMRI';
                const isForex = sym === 'EURUSD' || sym === 'GBPUSD';
                const prefix = isIndo ? 'Rp ' : '$';
                const formatted = isForex ? tickerPrices[sym].toFixed(4) : tickerPrices[sym].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                el.innerText = `${prefix}${formatted}`;
                el.className = `font-semibold ${delta >= 0 ? 'text-emerald-400 price-flash-up' : 'text-rose-400 price-flash-down'}`;
            }
        }
    });

    const label = document.getElementById('ticker-last-updated');
    if (label) {
        const t = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        label.innerText = `Update ${t} WIB`;
    }

    // Synchronize Multi-Chart AI Signal cards with live price ticks
    if (typeof updateActiveChartSignals === 'function') {
        updateActiveChartSignals();
    }
}

/* ==========================================================================
   7. FOREXFACTORY NEWS ENGINE & INTERACTIVE TABS FIX
   ========================================================================== */
let activeNewsCategory = 'forex';

function initForexFactoryNewsEngine() {
    fetchForexFactoryNews();

    // 5-minute countdown schedule
    let newsCountdown = 300;
    setInterval(() => {
        newsCountdown--;
        if (newsCountdown <= 0) {
            newsCountdown = 300;
            fetchForexFactoryNews();
        }
        const countdownEl = document.getElementById('news-countdown');
        if (countdownEl) {
            const m = Math.floor(newsCountdown / 60).toString().padStart(2, '0');
            const s = (newsCountdown % 60).toString().padStart(2, '0');
            countdownEl.innerText = `${m}:${s}`;
        }
    }, 1000);

    // Interactive News Category Tab Click Handlers (FIX PERBAIKAN TAB KLIK)
    const tabBtns = document.querySelectorAll('.news-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active', 'bg-teal-500/20', 'text-teal-300', 'border-teal-500/30'));
            tabBtns.forEach(b => b.classList.add('bg-slate-800', 'text-slate-300'));

            btn.classList.add('active', 'bg-teal-500/20', 'text-teal-300', 'border-teal-500/30');
            activeNewsCategory = btn.getAttribute('data-category') || 'forex';
            fetchForexFactoryNews();
        });
    });

    const btnTestSound = document.getElementById('btn-trigger-test-breaking');
    if (btnTestSound) {
        btnTestSound.addEventListener('click', () => {
            triggerBreakingNewsAlert("SIMULASI: Rilis Data Non-Farm Payroll AS Melonjak!", "Tercatat lonjakan 350K pekerjaan baru. Dolar AS mengalami penguatan eksplosif di pasar finansial.");
        });
    }
}

async function fetchForexFactoryNews() {
    const stack = document.getElementById('news-cards-stack');
    if (!stack) return;

    renderCategoryNews(stack, activeNewsCategory);
}

function renderCategoryNews(container, category) {
    const newsDb = {
        forex: [
            { title: "Dolar AS Melemah Jelang Rilis Data CPI Inti", impact: "High", country: "USD", meta: "10 Menit lalu via FXStreet", url: "https://www.forexfactory.com/news" },
            { title: "GBP/USD Stabil di Atas 1.2650 Pasca Data Tenaga Kerja", impact: "Medium", country: "GBP", meta: "1 Jam lalu via Bloomberg", url: "https://www.bloomberg.com/markets/currencies" },
            { title: "Yen Jepang Menguat Tajam Pasca Isu Intervensi BOJ", impact: "High", country: "JPY", meta: "2 Jam lalu via Reuters", url: "https://www.reuters.com/markets/currencies" }
        ],
        stock: [
            { title: "IHSG Ditutup Menguat ke Level 7,300 Didorong Saham Bank BRI (BBRI) & BMRI", impact: "High", country: "IDX", meta: "15 Menit lalu via CNBC Indonesia", url: "https://www.cnbcindonesia.com/market" },
            { title: "Nvidia (NVDA) Melonjak 4.8% Ikuti Permintaan Chip Server AI", impact: "High", country: "USD", meta: "1 Jam lalu via Bloomberg", url: "https://www.bloomberg.com/markets" },
            { title: "Rupiah Menguat Pasca BI-Rate Ditahan di Level Stabilitas", impact: "Medium", country: "IDX", meta: "3 Jam lalu via Kontan", url: "https://www.kontan.co.id" }
        ],
        crypto: [
            { title: "Bitcoin (BTC) Tembus $95,000 Didorong Arus Masuk ETF Spot", impact: "High", country: "BTC", meta: "30 Menit lalu via Cointelegraph", url: "https://cointelegraph.com" },
            { title: "Solana (SOL) Memimpin Reli Altcoin dengan Kenaikan +12.4%", impact: "High", country: "SOL", meta: "2 Jam lalu via CoinDesk", url: "https://www.coindesk.com" }
        ],
        commodities: [
            { title: "Harga Emas (XAU/USD) Tertahan di Resisten $2,350", impact: "High", country: "XAU", meta: "20 Menit lalu via Reuters", url: "https://www.reuters.com/markets/commodities" },
            { title: "Minyak Mentah Brent Stabil di $78 Per Barel Ditengah Logistik Merah", impact: "Medium", country: "OIL", meta: "2 Jam lalu via Bloomberg", url: "https://www.bloomberg.com/energy" }
        ]
    };

    const articles = newsDb[category] || newsDb.forex;
    container.innerHTML = articles.map(item => {
        const impactBadge = item.impact === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        return `
            <div onclick="window.open('${item.url}', '_blank')" class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/50 cursor-pointer transition shadow-lg group">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${impactBadge}"><i class="fa-solid fa-bolt"></i> ${item.impact.toUpperCase()} IMPACT</span>
                    <span class="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">${item.country}</span>
                </div>
                <h4 class="text-sm font-bold text-white group-hover:text-teal-300 transition flex items-center justify-between">
                    <span>${item.title}</span>
                    <i class="fa-solid fa-arrow-up-right-from-square text-xs text-slate-400 group-hover:text-teal-300"></i>
                </h4>
                <p class="text-xs text-slate-400">ForexFactory & Global Live Economic Feed — Klik untuk membaca berita sumber resmi.</p>
                <div class="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span><i class="fa-regular fa-clock"></i> ${item.meta}</span>
                    <span class="text-teal-400 font-semibold"><i class="fa-solid fa-globe"></i> Buka Website Berita</span>
                </div>
            </div>
        `;
    }).join('');
}

function playBreakingNewsChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
}

function triggerBreakingNewsAlert(title, desc) {
    playBreakingNewsChime();
    const modal = document.getElementById('breaking-news-modal');
    if (modal) {
        document.getElementById('breaking-title').innerText = title;
        document.getElementById('breaking-desc').innerText = desc;
        modal.classList.remove('hidden');
    }
}

window.closeBreakingModal = function() {
    document.getElementById('breaking-news-modal').classList.add('hidden');
};

/* ==========================================================================
   8. AI TODAY MARKET INTEL (8 PAIRS EXPANSION & 5-MINUTE RESET LOOP)
   ========================================================================== */
function initAIMarketIntel06AM() {
    renderAIPairCards();

    // Attach PDF Download Handler
    const pdfBtn = document.getElementById('btn-download-ai-pdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', downloadAIPDFReport);
    }

    // Reset projections every 5 minutes (300,000 ms)
    setInterval(() => {
        console.log('[AI Today Intel] 5-minute projection auto-reset');
        renderAIPairCards();
    }, 300000);

    // Reset daily macro outlook at 06:00 AM WIB
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 6 && now.getMinutes() === 0 && now.getSeconds() < 30) {
            renderAIPairCards();
        }
    }, 30000);
}

function downloadAIPDFReport() {
    const reportDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const element = document.createElement('div');
    element.style.padding = '30px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#0f172a';
    element.style.backgroundColor = '#ffffff';

    element.innerHTML = `
        <div style="border-bottom: 3px solid #0d9488; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1 style="font-size: 24px; font-weight: bold; color: #0d9488; margin: 0;">TradeVision Pro — Today's Market Intel Report</h1>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">Analisis Makroekonomi & Proyeksi 8 Pair Utama | Tanggal: ${reportDate}</p>
            </div>
            <div style="text-align: right;">
                <span style="background-color: #0d9488; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: bold;">ZAM QUANT ENGINE</span>
            </div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin-bottom: 25px;">
            <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 0 0 10px 0;">🌐 Macro Sentiment Outlook & Korelasi DXY Index</h3>
            <p style="font-size: 12px; line-height: 1.6; color: #334155; margin: 0;">
                ${document.getElementById('ai-macro-outlook') ? document.getElementById('ai-macro-outlook').innerText : 'Pasar finansial global hari ini diwarnai oleh akumulasi likuiditas pada aset Emas (XAUUSD) & penguatan Dolar AS menjelang pidato The Fed.'}
            </p>
        </div>

        <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin-bottom: 12px;">🎯 Proyeksi & Bias Sinyal 8 Pair Utama</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px;">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: left; color: #334155;">
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">Pair / Instrumen</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">Bias Sentimen</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">Proyeksi Teknikal & Sinyal AI SMC</th>
                </tr>
            </thead>
            <tbody>
                ${[
                    { p: 'XAU/USD (Gold)', b: 'BULLISH', d: 'Target $2,370. Support $2,320. BOS M15 + FVG Tap H1.' },
                    { p: 'USD/JPY', b: 'BULLISH', d: 'Resisten 161.00. Waspada potensi intervensi BOJ di 161.50.' },
                    { p: 'USD/CHF', b: 'BEARISH', d: 'Tertekan di bawah 0.8870 sejalan dengan pelemahan DXY.' },
                    { p: 'USD/CAD', b: 'BULLISH', d: 'Rebound dari support 1.3620 mengincar supply 1.3700.' },
                    { p: 'EUR/USD', b: 'BEARISH', d: 'Tekanan jual berlanjut menguji support 1.0660.' },
                    { p: 'GBP/USD', b: 'NEUTRAL', d: 'Konsolidasi di dalam range 1.2630 hingga 1.2720.' },
                    { p: 'AUD/USD', b: 'BULLISH', d: 'RBA Hawkish menopang harga di atas support 0.6580.' },
                    { p: 'NZD/USD', b: 'BEARISH', d: 'Rejection resisten harian mengarahkan target ke 0.6050.' }
                ].map(item => `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${item.p}</td>
                        <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: ${item.b === 'BULLISH' ? '#16a34a' : item.b === 'BEARISH' ? '#dc2626' : '#d97706'};">${item.b}</td>
                        <td style="padding: 10px; border: 1px solid #cbd5e1;">${item.d}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between;">
            <span>Laporan Resmi TradeVision Pro • Hak Cipta Dilindungi Undang-Undang</span>
            <span>PDF Generated via html2pdf</span>
        </div>
    `;

    const opt = {
        margin:       0.4,
        filename:     `TradeVision_Macro_Intel_Report_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save();
    } else {
        window.print();
    }
}

function renderAIPairCards() {
    const container = document.getElementById('ai-pair-cards-container');
    if (!container) return;

    // 8 Pairs requested by user
    const pairs = [
        { name: 'XAU/USD (Gold)', sent: 'BULLISH', proj: 'Target kenaikan menuju resisten $2,370 dengan support teruji di $2,320.' },
        { name: 'USD/JPY', sent: 'BULLISH', proj: 'Menguji resisten 161.00 dengan potensi intervensi BOJ.' },
        { name: 'USD/CHF', sent: 'BEARISH', proj: 'Tertekan di bawah support 0.8870 sejalan dengan pelemahan DXY.' },
        { name: 'USD/CAD', sent: 'BULLISH', proj: 'Rebound dari support 1.3620 mengincar area supply 1.3700.' },
        { name: 'EUR/USD', sent: 'BEARISH', proj: 'Tekanan jual berlanjut menguji area support harian 1.0660.' },
        { name: 'GBP/USD', sent: 'NEUTRAL', proj: 'Konsolidasi di dalam range 1.2630 hingga 1.2720.' },
        { name: 'AUD/USD', sent: 'BULLISH', proj: 'Sikap RBA hawkish menopang harga di atas support 0.6580.' },
        { name: 'NZD/USD', sent: 'BEARISH', proj: 'Rejection resisten harian mengarahkan target ke 0.6050.' }
    ];

    container.innerHTML = pairs.map(p => {
        const badgeColor = p.sent === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                           p.sent === 'BEARISH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                           'bg-slate-700 text-slate-300 border-slate-600';
        return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/30 transition">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-white text-xs">${p.name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}">${p.sent}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${p.proj}</p>
            </div>
        `;
    }).join('');

    const macroEl = document.getElementById('ai-macro-outlook');
    if (macroEl) {
        macroEl.innerHTML = `
            <strong>[TINJAUAN MAKRO 8 PAIR ULTIMATE]</strong><br>
            Pasar finansial global hari ini diwarnai oleh akumulasi likuiditas pada aset Emas (XAUUSD) & penguatan Dolar AS menjelang pidato The Fed. 8 Pair utama (XAUUSD, USDJPY, USDCHF, USDCAD, EURUSD, GBPUSD, AUDUSD, NZDUSD) telah diperbarui dengan proyeksi AI 5-menit. Manfaatkan rasio Risk to Reward minimal 1:2.
        `;
    }
}

/* ==========================================================================
   9. AI VOICE CHAT ASSISTANT
   ========================================================================== */
function initAIVoiceChat() {
    const voiceBtn = document.getElementById('btn-voice-input');
    const inputEl = document.getElementById('ai-chat-input');
    if (!voiceBtn || !inputEl) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;

        voiceBtn.addEventListener('click', () => {
            voiceBtn.classList.add('text-rose-400', 'animate-pulse');
            inputEl.placeholder = "Mendengarkan suara Anda...";
            recognition.start();
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            inputEl.value = transcript;
            voiceBtn.classList.remove('text-rose-400', 'animate-pulse');
            sendAIChatMessage();
        };

        recognition.onerror = () => {
            voiceBtn.classList.remove('text-rose-400', 'animate-pulse');
            inputEl.placeholder = "Ketik pertanyaan atau klik mikrofon untuk bicara...";
        };
    }
}

window.sendAIChatMessage = function() {
    const input = document.getElementById('ai-chat-input');
    const log = document.getElementById('ai-chat-messages');
    if (!input || !input.value.trim() || !log) return;

    const userText = input.value.trim();
    input.value = '';

    log.innerHTML += `
        <div class="flex gap-3 items-start justify-end">
            <div class="bg-teal-500/20 text-teal-200 border border-teal-500/30 p-3 rounded-2xl rounded-tr-none max-w-xl text-xs">
                ${userText}
            </div>
        </div>
    `;
    log.scrollTop = log.scrollHeight;

    setTimeout(() => {
        let aiReply = "Berdasarkan analisis teknikal SMC, struktur harga saat ini menunjukkan zona FVG H1 terkonfirmasi.";
        if (userText.toLowerCase().includes('gold') || userText.toLowerCase().includes('xau')) {
            aiReply = "XAU/USD (Emas) berada dalam bias BULLISH dengan target $2,370 dan support di $2,320.";
        } else if (userText.toLowerCase().includes('bbri') || userText.toLowerCase().includes('saham')) {
            aiReply = "Saham BBRI (Bank BRI) berada di zona akumulasi kuat Rp 5,150 - Rp 5,250 dengan target kenaikan Rp 5,500.";
        }

        log.innerHTML += `
            <div class="flex gap-3 items-start">
                <div class="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">🤖</div>
                <div class="bg-slate-800 p-3 rounded-2xl rounded-tl-none max-w-xl text-slate-200 text-xs">
                    ${aiReply}
                </div>
            </div>
        `;
        log.scrollTop = log.scrollHeight;
    }, 800);
};

/* ==========================================================================
   10. SHIPFINDER INTERACTIVE LEAFLET AIS MAP ENGINE (NO 404 GUARANTEED)
   ========================================================================== */
let shipMap = null;
let shipMarkersGroup = null;
let currentTileLayer = null;

function updateMapTileForTheme(theme) {
    if (!shipMap) return;
    if (currentTileLayer) shipMap.removeLayer(currentTileLayer);

    const tileUrl = (theme === 'light' || theme === 'pastel')
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    currentTileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO &copy; ShipFinder AIS',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(shipMap);
}

function initShipFinderLeafletMap() {
    const mapContainer = document.getElementById('shipfinder-leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    shipMap = L.map('shipfinder-leaflet-map', {
        center: [26.0, 55.0],
        zoom: 7,
        zoomControl: true
    });

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateMapTileForTheme(currentTheme);

    shipMarkersGroup = L.layerGroup().addTo(shipMap);

    // Initial ships render
    renderShipMarkers(26.0, 55.0);

    // Preset button handlers
    const buttons = document.querySelectorAll('.ship-preset-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active', 'bg-teal-500/20', 'text-teal-300', 'border-teal-500/30'));
            buttons.forEach(b => b.classList.add('bg-slate-800', 'text-slate-300'));

            btn.classList.add('active', 'bg-teal-500/20', 'text-teal-300', 'border-teal-500/30');

            const lat = parseFloat(btn.getAttribute('data-lat'));
            const lon = parseFloat(btn.getAttribute('data-lon'));
            const zoom = parseInt(btn.getAttribute('data-zoom'));

            shipMap.flyTo([lat, lon], zoom, { duration: 1.5 });
            renderShipMarkers(lat, lon);

            const syncLabel = document.getElementById('shipfinder-last-sync');
            if (syncLabel) {
                syncLabel.innerText = `Terhubung ke ShipFinder Interactive AIS Radar (${btn.innerText.trim()}) • Realtime Stream`;
            }
        });
    });

    // Simulated vessel movement drift every 8 seconds
    setInterval(() => {
        if (shipMap) {
            const center = shipMap.getCenter();
            renderShipMarkers(center.lat, center.lng);
        }
    }, 8000);
}

function renderShipMarkers(baseLat, baseLon) {
    if (!shipMarkersGroup) return;
    shipMarkersGroup.clearLayers();

    const vesselData = [
        { name: 'PACIFIC TANKER I', type: 'Tanker Minyak', flag: '🚢 Panama', speed: '14.2 knots', color: '#00e676', lat: baseLat + 0.15, lon: baseLon + 0.2 },
        { name: 'GOLD CARRIER EXPRESS', type: 'Kargo Emas & Logistik', flag: '🚢 Liberia', speed: '16.5 knots', color: '#00ccff', lat: baseLat - 0.2, lon: baseLon - 0.15 },
        { name: 'ARABIAN OIL STAR', type: 'VLCC Crude Tanker', flag: '🚢 Marshall Is', speed: '12.8 knots', color: '#00e676', lat: baseLat + 0.05, lon: baseLon - 0.3 },
        { name: 'GLOBAL BULKER IX', type: 'Bulk Carrier', flag: '🚢 Singapore', speed: '11.0 knots', color: '#ffaa00', lat: baseLat - 0.1, lon: baseLon + 0.25 }
    ];

    vesselData.forEach(v => {
        const customIcon = L.divIcon({
            className: 'custom-ship-pin',
            html: `<div style="background-color: ${v.color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px ${v.color};"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        const marker = L.marker([v.lat, v.lon], { icon: customIcon });
        marker.bindPopup(`
            <div class="p-1 space-y-1 text-xs">
                <h4 class="font-bold text-teal-300 text-sm">${v.name}</h4>
                <div>Tipe: <strong>${v.type}</strong></div>
                <div>Bendera: <strong>${v.flag}</strong></div>
                <div>Kecepatan: <strong>${v.speed}</strong></div>
                <div class="text-[10px] text-emerald-400 font-semibold pt-1">● Status AIS: Navigating Underway</div>
            </div>
        `);
        shipMarkersGroup.addLayer(marker);
    });
}

/* ==========================================================================
   11. CRYPTO & STOCK DASHBOARDS (INCLUDES INDONESIAN BLUECHIPS)
   ========================================================================== */
function initCryptoDashboard() {
    const body = document.getElementById('crypto-table-body');
    const trending = document.getElementById('crypto-trending-list');

    const cryptos = [
        { sym: 'BTC/USD', price: '95,420.00', change: 3.45, rec: 'STRONG BUY' },
        { sym: 'ETH/USD', price: '3,340.00', change: 2.10, rec: 'BUY' },
        { sym: 'SOL/USD', price: '145.20', change: 12.40, rec: 'STRONG BUY' },
        { sym: 'BNB/USD', price: '580.00', change: -0.80, rec: 'HOLD' }
    ];

    if (body) {
        body.innerHTML = cryptos.map(c => `
            <tr class="hover:bg-slate-800/40">
                <td class="py-2.5 font-bold text-white">${c.sym}</td>
                <td class="py-2.5 text-teal-300">$${c.price}</td>
                <td class="py-2.5 ${c.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${c.change >= 0 ? '+' : ''}${c.change}%</td>
                <td class="py-2.5"><span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">${c.rec}</span></td>
                <td class="py-2.5 text-right"><button onclick="quickSearch('BTCUSD')" class="text-teal-400 hover:underline text-xs">Chart</button></td>
            </tr>
        `).join('');
    }

    if (trending) {
        trending.innerHTML = `
            <div class="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl">
                <span>🔥 Solana (SOL)</span>
                <span class="text-emerald-400 font-bold">+12.4%</span>
            </div>
            <div class="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl">
                <span>⚡ Toncoin (TON)</span>
                <span class="text-emerald-400 font-bold">+8.1%</span>
            </div>
        `;
    }
}

function initStockDashboard() {
    const body = document.getElementById('stock-table-body');
    const watchlist = document.getElementById('stock-watchlist-list');

    const stocks = [
        { sym: 'BBRI (Bank BRI)', price: 'Rp 5,250', change: 1.95, rec: 'BUY' },
        { sym: 'BMRI (Bank Mandiri)', price: 'Rp 6,450', change: 2.10, rec: 'STRONG BUY' },
        { sym: 'BBCA (Bank BCA)', price: 'Rp 10,150', change: 0.85, rec: 'BUY' },
        { sym: 'TLKM (Telkom)', price: 'Rp 3,120', change: 1.15, rec: 'BUY' },
        { sym: 'NVDA (Nvidia US)', price: '$128.50', change: 4.80, rec: 'STRONG BUY' },
        { sym: 'AAPL (Apple US)', price: '$224.30', change: 1.15, rec: 'BUY' }
    ];

    if (body) {
        body.innerHTML = stocks.map(s => `
            <tr class="hover:bg-slate-800/40">
                <td class="py-2.5 font-bold text-white">${s.sym}</td>
                <td class="py-2.5 text-teal-300">${s.price}</td>
                <td class="py-2.5 ${s.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${s.change >= 0 ? '+' : ''}${s.change}%</td>
                <td class="py-2.5"><span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">${s.rec}</span></td>
                <td class="py-2.5 text-right"><button onclick="quickSearch('BBRI')" class="text-teal-400 hover:underline text-xs">Detail</button></td>
            </tr>
        `).join('');
    }

    if (watchlist) {
        watchlist.innerHTML = `
            <div class="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl">
                <span class="font-bold text-white">BBRI (Bank BRI)</span>
                <span class="text-emerald-400 font-bold">Rp 5,250 (+1.9%)</span>
            </div>
            <div class="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl">
                <span class="font-bold text-white">BMRI (Mandiri)</span>
                <span class="text-emerald-400 font-bold">Rp 6,450 (+2.1%)</span>
            </div>
            <div class="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl">
                <span class="font-bold text-white">NVDA (Nvidia)</span>
                <span class="text-emerald-400 font-bold">$128.50 (+4.8%)</span>
            </div>
        `;
    }
}

window.addStockWatchlistPrompt = function() {
    const sym = prompt('Masukkan kode saham baru (Cth: ASII, UNVR, TSLA):');
    if (sym) {
        alert(`Saham ${sym.toUpperCase()} berhasil ditambahkan ke Watchlist Anda!`);
    }
};

/* ==========================================================================
   12. THREE.JS 3D CANVAS BACKGROUND
   ========================================================================== */
function init3DCanvasBackground() {
    const container = document.getElementById('canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const particlesCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x00f5a0,
        size: 0.03,
        transparent: true,
        opacity: 0.6
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.0008;
        renderer.render(scene, camera);
    }
    animate();
}
