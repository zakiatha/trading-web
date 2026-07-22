/* ==========================================================================
   TRADEVISION PRO — ADVANCED REACT & JAVASCRIPT APPLICATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initGlobalSearch();
    initAuthModals();
    initMultiChartHub();
    initLiveTickerTape();
    initForexFactoryNewsEngine();
    initAIMarketIntel06AM();
    initAIVoiceChat();
    initShipFinderEngine();
    initCryptoDashboard();
    initStockDashboard();
    init3DCanvasBackground();
});

/* ==========================================================================
   1. THEME MANAGER (DARK / LIGHT MODE TOGGLE)
   ========================================================================== */
function initThemeManager() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('tv_theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', next);
            localStorage.setItem('tv_theme', next);
            updateThemeIcon(next);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
}

/* ==========================================================================
   2. GLOBAL SEARCH & INSTRUMENT INFO MODALS
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

    // Info modal handlers
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
    document.getElementById('modal-info-price').innerText = `$${data.price}`;
    document.getElementById('modal-info-change').innerText = `${data.change >= 0 ? '+' : ''}${data.change}%`;
    document.getElementById('modal-info-high').innerText = `$${data.high}`;
    document.getElementById('modal-info-low').innerText = `$${data.low}`;
    document.getElementById('modal-info-desc').innerText = data.desc;

    infoModal.classList.remove('hidden');
};

function getInstrumentData(sym) {
    const db = {
        'XAUUSD': { name: 'XAU/USD (Gold)', category: 'Komoditas Logam Mulia', price: '2,345.50', change: 1.25, high: '2,450.00', low: '1,980.00', desc: 'Aset safe-haven utama yang sangat dipengaruhi oleh inflasi AS, kebijakan suku bunga Federal Reserve, dan geopolitik global.' },
        'BTCUSD': { name: 'Bitcoin (BTC/USD)', category: 'Crypto Asset #1', price: '95,420.00', change: 3.45, high: '98,000.00', low: '52,000.00', desc: 'Mata uang kripto terbesar dunia dengan akumulasi arus masuk ETF institusional yang sangat pesat.' },
        'NVDA': { name: 'Nvidia Corporation (NVDA)', category: 'Saham Teknologi US (Semiconductor)', price: '128.50', change: 4.80, high: '140.00', low: '40.00', desc: 'Pemimpin pasar chip AI global dengan pertumbuhan pendapatan kuartalan tertinggi di sektor teknologi.' },
        'EURUSD': { name: 'EUR/USD', category: 'Pasangan Mata Uang Major', price: '1.0720', change: -0.35, high: '1.0950', low: '1.0600', desc: 'Pasangan valuta asing paling likuid di dunia, merefleksikan kesehatan ekonomi Zona Euro vs Dolar AS.' },
        'BBRI': { name: 'Bank Rakyat Indonesia (BBRI)', category: 'Saham Perbankan Indonesia', price: '5,250.00', change: 1.95, high: '6,050.00', low: '4,400.00', desc: 'Bank BUMN Indonesia terdepan pada segmen kredit mikro dan modal usaha UMKM.' }
    };
    const key = sym.replace('OANDA:', '').replace('FX:', '').replace('BITSTAMP:', '').replace('BINANCE:', '').replace('NASDAQ:', '');
    return db[key] || db['XAUUSD'];
}

/* ==========================================================================
   3. AUTH MODALS (LOGIN & REGISTER)
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
            if (title.innerText.includes('Masuk')) {
                title.innerText = 'Daftar Akun Baru TradeVision';
                submitBtn.innerText = 'Buat Akun Sekarang';
                toggleBtn.innerText = 'Sudah Punya Akun? Masuk';
            } else {
                title.innerText = 'Masuk ke TradeVision Pro';
                submitBtn.innerText = 'Masuk Akun';
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
    alert('Autentikasi Berhasil! Selamat datang di TradeVision Pro.');
    document.getElementById('auth-modal').classList.add('hidden');
};

/* ==========================================================================
   4. MULTI-CHART HUB ENGINE (1, 2, 4 CHARTS GRID)
   ========================================================================== */
let currentChartGridCount = 1;
const activeChartSymbols = ['OANDA:XAUUSD', 'BITSTAMP:BTCUSD', 'NASDAQ:NVDA', 'FX:EURUSD'];

function initMultiChartHub() {
    renderMultiChartGrid();
}

window.setChartGrid = function(count) {
    currentChartGridCount = count;

    // Update active button state
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
    } else if (currentChartGridCount === 2) {
        gridContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-6';
    } else {
        gridContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-6';
    }

    let html = '';
    for (let i = 0; i < currentChartGridCount; i++) {
        const symbol = activeChartSymbols[i] || activeChartSymbols[0];
        html += `
            <div class="chart-card-wrapper bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-400 uppercase">Chart #${i+1}:</span>
                        <select onchange="updateChartInstrument(${i}, this.value)" class="bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 font-semibold cursor-pointer">
                            <optgroup label="🥇 Komoditas & Forex">
                                <option value="OANDA:XAUUSD" ${symbol === 'OANDA:XAUUSD' ? 'selected' : ''}>XAU/USD (Gold)</option>
                                <option value="FX:EURUSD" ${symbol === 'FX:EURUSD' ? 'selected' : ''}>EUR/USD</option>
                                <option value="FX:GBPUSD" ${symbol === 'FX:GBPUSD' ? 'selected' : ''}>GBP/USD</option>
                                <option value="FX:USDJPY" ${symbol === 'FX:USDJPY' ? 'selected' : ''}>USD/JPY</option>
                            </optgroup>
                            <optgroup label="₿ Crypto Assets">
                                <option value="BITSTAMP:BTCUSD" ${symbol === 'BITSTAMP:BTCUSD' ? 'selected' : ''}>Bitcoin (BTC/USD)</option>
                                <option value="BITSTAMP:ETHUSD" ${symbol === 'BITSTAMP:ETHUSD' ? 'selected' : ''}>Ethereum (ETH/USD)</option>
                                <option value="BINANCE:SOLUSD" ${symbol === 'BINANCE:SOLUSD' ? 'selected' : ''}>Solana (SOL/USD)</option>
                            </optgroup>
                            <optgroup label="📈 Saham US & Global">
                                <option value="NASDAQ:NVDA" ${symbol === 'NASDAQ:NVDA' ? 'selected' : ''}>Nvidia (NVDA)</option>
                                <option value="NASDAQ:AAPL" ${symbol === 'NASDAQ:AAPL' ? 'selected' : ''}>Apple (AAPL)</option>
                                <option value="NASDAQ:TSLA" ${symbol === 'NASDAQ:TSLA' ? 'selected' : ''}>Tesla (TSLA)</option>
                                <option value="NASDAQ:MSFT" ${symbol === 'NASDAQ:MSFT' ? 'selected' : ''}>Microsoft (MSFT)</option>
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

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <div class="flex justify-between items-center text-[10px]">
                            <span class="font-bold text-slate-400 uppercase">Sinyal AI</span>
                            <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">BUY</span>
                        </div>
                        <div class="text-xs font-bold text-white flex justify-between">
                            <span>TP: <span class="text-emerald-400">+2.5%</span></span>
                            <span>SL: <span class="text-rose-400">-1.0%</span></span>
                        </div>
                    </div>
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span class="text-[10px] font-bold text-slate-400 uppercase block">Berita Terkait</span>
                        <h4 class="text-[11px] font-semibold text-slate-200 line-clamp-1">Katalis Positif Sektor Industri Pasca Data Makro</h4>
                    </div>
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span class="text-[10px] font-bold text-slate-400 uppercase block">Hot Trending</span>
                        <span class="text-xs font-bold text-teal-300 block"><i class="fa-solid fa-fire text-amber-400"></i> Active Volume High</span>
                    </div>
                </div>
            </div>
        `;
    }
    gridContainer.innerHTML = html;
}

window.updateChartInstrument = function(index, symbol) {
    activeChartSymbols[index] = symbol;
    const container = document.getElementById(`tv-chart-container-${index}`);
    if (container) {
        container.innerHTML = `<iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${index}&symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FJakarta" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
    }
};

window.openInfoModalForCurrent = function(index) {
    const symbol = activeChartSymbols[index] || 'XAUUSD';
    openInfoModal(symbol);
};

/* ==========================================================================
   5. REAL-TIME TICKER TAPE ENGINE (1-SECOND TICK UPDATES)
   ========================================================================== */
const tickerSymbols = ['XAUUSD', 'BTCUSD', 'NVDA', 'EURUSD', 'GBPUSD', 'USDJPY', 'ETHUSD', 'SOLUSD', 'AAPL', 'TSLA'];
const tickerPrices = {
    XAUUSD: 2345.50,
    BTCUSD: 95420.00,
    NVDA: 128.50,
    EURUSD: 1.0720,
    GBPUSD: 1.2680,
    USDJPY: 160.20,
    ETHUSD: 3340.00,
    SOLUSD: 145.20,
    AAPL: 224.30,
    TSLA: 252.10
};

function initLiveTickerTape() {
    renderTickerTape();
    // 1-second real-time tick engine
    setInterval(tickPrices, 1000);
}

function renderTickerTape() {
    const container = document.getElementById('ticker-tape-container');
    if (!container) return;

    container.innerHTML = tickerSymbols.map(sym => {
        const price = tickerPrices[sym];
        const isForex = sym === 'EURUSD' || sym === 'GBPUSD';
        const formatted = isForex ? price.toFixed(4) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `
            <div class="inline-flex items-center gap-2 cursor-pointer hover:text-teal-300 transition" onclick="quickSearch('${sym}')">
                <span class="font-bold text-white">${sym}</span>
                <span class="text-emerald-400 font-semibold" id="ticker-p-${sym}">$${formatted}</span>
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
                const isForex = sym === 'EURUSD' || sym === 'GBPUSD';
                const formatted = isForex ? tickerPrices[sym].toFixed(4) : tickerPrices[sym].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                el.innerText = `$${formatted}`;
                el.className = `font-semibold ${delta >= 0 ? 'text-emerald-400 price-flash-up' : 'text-rose-400 price-flash-down'}`;
            }
        }
    });

    const label = document.getElementById('ticker-last-updated');
    if (label) {
        const t = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        label.innerText = `Update ${t} WIB`;
    }
}

/* ==========================================================================
   6. FOREXFACTORY NEWS ENGINE & BREAKING AUDIO ALERTS (5M SCHEDULE)
   ========================================================================== */
let newsCountdown = 300; // 5m

function initForexFactoryNewsEngine() {
    fetchForexFactoryNews();

    // 5-minute countdown schedule
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

    // Audio test button handler
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

    try {
        const res = await fetch('https://fair-economy.b-cdn.net/ff_calendar_thisweek.json');
        if (!res.ok) throw new Error('CORS Fallback');
        const data = await res.json();
        
        const topEvents = data.filter(e => e.title && e.impact).slice(0, 4);
        renderNewsCards(stack, topEvents);
    } catch (e) {
        // Fallback local pool
        renderFallbackNewsCards(stack);
    }
}

function renderNewsCards(container, events) {
    container.innerHTML = events.map(item => {
        const impactBadge = item.impact === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/30 transition">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${impactBadge}"><i class="fa-solid fa-bolt"></i> ${item.impact.toUpperCase()} IMPACT</span>
                    <span class="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">${item.country || 'USD'}</span>
                </div>
                <h4 class="text-sm font-bold text-white hover:text-teal-300 cursor-pointer">${item.title}</h4>
                <p class="text-xs text-slate-400">ForexFactory Live Economic Feed — Monitoring data fundamental berpengaruh tinggi.</p>
                <div class="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span><i class="fa-regular fa-clock"></i> Rilis Hari Ini</span>
                    <span>via ForexFactory</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderFallbackNewsCards(container) {
    const pool = [
        { title: "Dolar AS Melonjak Jelang Pidato Ketua Federal Reserve", impact: "High", country: "USD" },
        { title: "Keputusan BOJ Menahan Suku Bunga Memicu Volatilitas Yen", impact: "High", country: "JPY" },
        { title: "Pertumbuhan Manufaktur Jerman Melampaui Ekspektasi Pasar", impact: "Medium", country: "EUR" }
    ];
    renderNewsCards(container, pool);
}

// Web Audio API Synthesizer Chime Alarm
function playBreakingNewsChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.warn('Web Audio Playback prevented:', e);
    }
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
   7. AI MARKET TODAY INTEL (06:00 AM WIB RESET SCHEDULE)
   ========================================================================== */
function initAIMarketIntel06AM() {
    renderAIPairCards();

    // Check clock every 30s for 06:00 AM reset threshold
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 6 && now.getMinutes() === 0 && now.getSeconds() < 30) {
            console.log('[AI Today Intel] 06:00 AM WIB Reset Triggered');
            renderAIPairCards();
        }
    }, 30000);

    // PDF Download Handler
    const pdfBtn = document.getElementById('btn-download-ai-pdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            alert('Mengekspor laporan AI Market Intel Hari ini ke PDF...');
        });
    }
}

function renderAIPairCards() {
    const container = document.getElementById('ai-pair-cards-container');
    if (!container) return;

    const pairs = [
        { name: 'XAU/USD (Gold)', sent: 'BULLISH', proj: 'Target kenaikan menuju resisten $2,370 dengan support teruji di $2,320.' },
        { name: 'EUR/USD', sent: 'BEARISH', proj: 'Tekanan jual berlanjut menguji area support harian 1.0660.' },
        { name: 'GBP/USD', sent: 'NEUTRAL', proj: 'Konsolidasi di dalam range 1.2630 hingga 1.2720.' },
        { name: 'USD/JPY', sent: 'BULLISH', proj: 'Menguji batas atas resisten psikologis 161.00.' }
    ];

    container.innerHTML = pairs.map(p => {
        const badgeColor = p.sent === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                           p.sent === 'BEARISH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                           'bg-slate-700 text-slate-300 border-slate-600';
        return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-white text-xs">${p.name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}">${p.sent}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${p.proj}</p>
            </div>
        `;
    }).join('');
}

/* ==========================================================================
   8. AI VOICE CHAT ASSISTANT (WEB SPEECH RECOGNITION API)
   ========================================================================== */
function initAIVoiceChat() {
    const voiceBtn = document.getElementById('btn-voice-input');
    const inputEl = document.getElementById('ai-chat-input');

    if (!voiceBtn || !inputEl) return;

    // Check Web Speech API support
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
    } else {
        voiceBtn.addEventListener('click', () => {
            alert('Fitur Voice Recognition tidak didukung di browser ini. Silakan gunakan Google Chrome.');
        });
    }
}

window.sendAIChatMessage = function() {
    const input = document.getElementById('ai-chat-input');
    const log = document.getElementById('ai-chat-messages');
    if (!input || !input.value.trim() || !log) return;

    const userText = input.value.trim();
    input.value = '';

    // Append User Message
    log.innerHTML += `
        <div class="flex gap-3 items-start justify-end">
            <div class="bg-teal-500/20 text-teal-200 border border-teal-500/30 p-3 rounded-2xl rounded-tr-none max-w-xl text-xs">
                ${userText}
            </div>
        </div>
    `;
    log.scrollTop = log.scrollHeight;

    // AI Response Simulation
    setTimeout(() => {
        let aiReply = "Berdasarkan struktur Smart Money Concept (SMC), pergerakan harga saat ini menunjukkan zona akumulasi di dekat area FVG H1.";
        if (userText.toLowerCase().includes('gold') || userText.toLowerCase().includes('xau')) {
            aiReply = "Untuk XAU/USD (Emas), tren harian menunjukkan bias BULLISH dengan target resisten di $2,370 dan support protektif di $2,320.";
        } else if (userText.toLowerCase().includes('btc') || userText.toLowerCase().includes('crypto')) {
            aiReply = "Aset Crypto Bitcoin (BTC) menembus $95,000 didorong arus masuk ETF Spot. Sinyal teknikal tetap kuat untuk reli ke $98,000.";
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
   9. SHIPFINDER MARITIME AIS TRACK ENGINE
   ========================================================================== */
function initShipFinderEngine() {
    const iframe = document.getElementById('shipfinder-iframe');
    const buttons = document.querySelectorAll('.ship-preset-btn');
    if (!iframe) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active', 'bg-teal-500/20', 'text-teal-300', 'border-teal-500/30'));
            buttons.forEach(b => b.classList.add('bg-slate-800', 'text-slate-300'));

            btn.classList.add('active', 'bg-teal-500/20', 'text-teal-300', 'border-teal-500/30');

            const lat = btn.getAttribute('data-lat');
            const lon = btn.getAttribute('data-lon');
            const zoom = btn.getAttribute('data-zoom');

            iframe.src = `https://www.vesselfinder.com/aisshownavpix?zoom=${zoom}&lat=${lat}&lon=${lon}&width=100%25&height=100%25&names=true&mmsi=0&track=true&fleet=false&fleet_name=false&fleet_hide_box=true&sim_track=false&show_track=true&show_ports=true`;
        });
    });
}

/* ==========================================================================
   10. CRYPTO & STOCK DASHBOARDS (WATCHLIST & RECOMMENDATIONS)
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
        { sym: 'NVDA (Nvidia)', price: '$128.50', change: 4.80, rec: 'STRONG BUY' },
        { sym: 'AAPL (Apple)', price: '$224.30', change: 1.15, rec: 'BUY' },
        { sym: 'BBRI (Bank BRI)', price: 'Rp 5,250', change: 1.95, rec: 'BUY' },
        { sym: 'TSLA (Tesla)', price: '$252.10', change: -2.30, rec: 'HOLD' }
    ];

    if (body) {
        body.innerHTML = stocks.map(s => `
            <tr class="hover:bg-slate-800/40">
                <td class="py-2.5 font-bold text-white">${s.sym}</td>
                <td class="py-2.5 text-teal-300">${s.price}</td>
                <td class="py-2.5 ${s.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${s.change >= 0 ? '+' : ''}${s.change}%</td>
                <td class="py-2.5"><span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">${s.rec}</span></td>
                <td class="py-2.5 text-right"><button onclick="quickSearch('NVDA')" class="text-teal-400 hover:underline text-xs">Detail</button></td>
            </tr>
        `).join('');
    }

    if (watchlist) {
        watchlist.innerHTML = `
            <div class="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl">
                <span class="font-bold text-white">NVDA</span>
                <span class="text-emerald-400 font-bold">$128.50 (+4.8%)</span>
            </div>
            <div class="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl">
                <span class="font-bold text-white">BBRI</span>
                <span class="text-emerald-400 font-bold">Rp 5,250 (+1.9%)</span>
            </div>
        `;
    }
}

window.addStockWatchlistPrompt = function() {
    const sym = prompt('Masukkan kode saham baru untuk Watchlist (Cth: AMZN, BMRI):');
    if (sym) {
        alert(`Saham ${sym.toUpperCase()} berhasil ditambahkan ke Watchlist Anda!`);
    }
};

/* ==========================================================================
   11. THREE.JS 3D CANVAS BACKGROUND
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
