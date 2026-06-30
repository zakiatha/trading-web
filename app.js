document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initMobileMenu();
    initRiskCalculator();
    init3DBackground();
    initActiveLinkTracker();
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
