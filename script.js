/**
 * CBRNE Management & Radiation Protection in Sri Lanka
 * Frontend Controller Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Language Selection
    const savedLang = localStorage.getItem('cbrne_selected_lang') || 'en';
    changeLanguage(savedLang);

    // 2. Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('open');
        });

        // Close menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });
    }

    // 3. Active Nav Link Scroll Spy
    const sections = document.querySelectorAll('section[id]');

    function scrollActiveIndicator() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');

            const navLink = document.querySelector(`.nav-list a[href="#${sectionId}"]`);
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', scrollActiveIndicator);

    // 4. Initialize ALARA Distance Simulator
    const distanceRange = document.getElementById('distanceRange');
    if (distanceRange) {
        distanceRange.addEventListener('input', updateSimulator);
        updateSimulator();
    }

    // 5. Initialize Admin Panel Drawer
    const adminToggle = document.getElementById('adminToggle');
    const adminClose = document.getElementById('adminClose');
    const adminDrawer = document.getElementById('adminDrawer');

    if (adminToggle && adminClose && adminDrawer) {
        adminToggle.addEventListener('click', () => {
            adminDrawer.classList.toggle('open');
        });
        adminClose.addEventListener('click', () => {
            adminDrawer.classList.remove('open');
        });
    }

    // Load custom user records from local storage
    loadCustomItems();
});

/**
 * Switch Site Language Dynamically
 * @param {string} lang - 'en' or 'si'
 */
function changeLanguage(lang) {
    // Save to localStorage
    localStorage.setItem('cbrne_selected_lang', lang);

    // Update HTML attribute
    document.documentElement.setAttribute('lang', lang);

    // Toggle active state on language buttons
    const btnEn = document.getElementById('btn-en');
    const btnSi = document.getElementById('btn-si');

    if (btnEn && btnSi) {
        if (lang === 'si') {
            btnEn.classList.remove('active');
            btnSi.classList.add('active');
        } else {
            btnEn.classList.add('active');
            btnSi.classList.remove('active');
        }
    }

    // Update all translation nodes
    const translatableElements = document.querySelectorAll('[data-en][data-si]');
    translatableElements.forEach(el => {
        const text = el.getAttribute('data-' + lang);
        if (text) {
            el.innerHTML = text;
        }
    });

    // Refresh simulator text values to the active language
    updateSimulator();
}

/**
 * Update ALARA Radiation Distance Simulator values
 */
function updateSimulator() {
    const distanceRange = document.getElementById('distanceRange');
    const distanceVal = document.getElementById('distanceVal');
    const exposureVal = document.getElementById('exposureVal');
    const safetyStatus = document.getElementById('safetyStatus');
    const simPerson = document.getElementById('simPerson');
    const shieldingMaterial = document.getElementById('shieldingMaterial');
    const simShield = document.getElementById('simShield');

    if (!distanceRange || !distanceVal || !exposureVal || !safetyStatus || !simPerson) return;

    const distance = parseFloat(distanceRange.value);
    const lang = localStorage.getItem('cbrne_selected_lang') || 'en';

    // Update distance display
    const unit = lang === 'si' ? ' මීටර්' : ' m';
    distanceVal.textContent = distance + unit;

    // Compute shielding absorption
    let absorption = 0;
    let shieldClass = '';

    if (shieldingMaterial && simShield) {
        const material = shieldingMaterial.value;
        if (material === 'water') {
            absorption = 0.30;
            shieldClass = 'active-water';
        } else if (material === 'concrete') {
            absorption = 0.70;
            shieldClass = 'active-concrete';
        } else if (material === 'lead') {
            absorption = 0.98;
            shieldClass = 'active-lead';
        }
        simShield.className = 'sim-shield ' + shieldClass;
    }

    // Calculate relative exposure: Inverse-Square Law (Dose = 1/d^2) * (1 - absorption)
    const rawExposure = (1 / (distance * distance)) * 100;
    const exposure = rawExposure * (1 - absorption);
    exposureVal.textContent = exposure.toFixed(2) + '%';

    // Position person avatar: Map 1m-10m slider range to 25%-80% left CSS coordinate
    const minLeft = 25;
    const maxLeft = 80;
    const percentLeft = minLeft + ((distance - 1) / 9) * (maxLeft - minLeft);
    simPerson.style.left = percentLeft + '%';

    // Set Safety Status indicators
    if (exposure > 50) {
        safetyStatus.textContent = lang === 'si' ? 'අතිශය අනතුරුදායකයි' : 'Danger';
        safetyStatus.className = 'metric-value safety-status danger';
    } else if (exposure > 10) {
        safetyStatus.textContent = lang === 'si' ? 'නිරාවරණය වැඩියි' : 'Warning';
        safetyStatus.className = 'metric-value safety-status warning';
    } else {
        safetyStatus.textContent = lang === 'si' ? 'ආරක්ෂිතයි' : 'Safe';
        safetyStatus.className = 'metric-value safety-status safe';
    }
}

/**
 * Switch Admin Drawer Form Tabs
 * @param {string} tab - 'location' or 'cooperation'
 */
function switchAdminTab(tab) {
    const tabLocBtn = document.getElementById('tab-loc-btn');
    const tabCoopBtn = document.getElementById('tab-coop-btn');
    const formLocation = document.getElementById('formLocation');
    const formCoop = document.getElementById('formCoop');

    if (!tabLocBtn || !tabCoopBtn || !formLocation || !formCoop) return;

    if (tab === 'location') {
        tabLocBtn.classList.add('active');
        tabCoopBtn.classList.remove('active');
        formLocation.classList.add('active');
        formCoop.classList.remove('active');
    } else {
        tabLocBtn.classList.remove('active');
        tabCoopBtn.classList.add('active');
        formLocation.classList.remove('active');
        formCoop.classList.add('active');
    }
}

/**
 * Handle new Location addition
 */
function handleAddLocation(event) {
    event.preventDefault();

    const titleEn = document.getElementById('locTitleEn').value.trim();
    const titleSi = document.getElementById('locTitleSi').value.trim();
    const descEn = document.getElementById('locDescEn').value.trim();
    const descSi = document.getElementById('locDescSi').value.trim();

    if (!titleEn || !titleSi || !descEn || !descSi) return;

    const newLoc = { titleEn, titleSi, descEn, descSi };

    // Save to localStorage
    const customLocs = JSON.parse(localStorage.getItem('cbrne_custom_locations') || '[]');
    customLocs.push(newLoc);
    localStorage.setItem('cbrne_custom_locations', JSON.stringify(customLocs));

    // Render it in the locations grid
    renderLocationCard(newLoc);

    // Force language translation on newly added elements
    const currentLang = localStorage.getItem('cbrne_selected_lang') || 'en';
    changeLanguage(currentLang);

    // Reset Form & Close Drawer
    document.getElementById('formLocation').reset();
    document.getElementById('adminDrawer').classList.remove('open');
}

/**
 * Render a Location Card into the DOM
 * @param {object} loc - Location data
 */
function renderLocationCard(loc) {
    const locationsGrid = document.getElementById('locationsGrid');
    if (!locationsGrid) return;

    const card = document.createElement('div');
    card.className = 'location-card';
    card.innerHTML = `
        <h4 data-en="${loc.titleEn}" data-si="${loc.titleSi}"></h4>
        <p data-en="${loc.descEn}" data-si="${loc.descSi}"></p>
    `;
    locationsGrid.appendChild(card);
}

/**
 * Handle new Cooperation project addition
 */
function handleAddCooperation(event) {
    event.preventDefault();

    const year = document.getElementById('coopYear').value;
    const badge = document.getElementById('coopBadge').value.trim();
    const titleEn = document.getElementById('coopTitleEn').value.trim();
    const titleSi = document.getElementById('coopTitleSi').value.trim();
    const descEn = document.getElementById('coopDescEn').value.trim();
    const descSi = document.getElementById('coopDescSi').value.trim();

    if (!year || !badge || !titleEn || !titleSi || !descEn || !descSi) return;

    const newCoop = { year, badge, titleEn, titleSi, descEn, descSi };

    // Save to localStorage
    const customCoops = JSON.parse(localStorage.getItem('cbrne_custom_coops') || '[]');
    customCoops.push(newCoop);
    localStorage.setItem('cbrne_custom_coops', JSON.stringify(customCoops));

    // Render in timeline
    renderCooperationItem(newCoop);

    // Force language translation on newly added elements
    const currentLang = localStorage.getItem('cbrne_selected_lang') || 'en';
    changeLanguage(currentLang);

    // Reset Form & Close Drawer
    document.getElementById('formCoop').reset();
    document.getElementById('adminDrawer').classList.remove('open');
}

/**
 * Render a cooperation project timeline item
 * @param {object} coop - Cooperation project data
 */
function renderCooperationItem(coop) {
    const timelineContainer = document.getElementById('timelineContainer');
    if (!timelineContainer) return;

    // Define background badge color based on organization label
    const partner = coop.badge.toLowerCase();
    let badgeClass = 'bg-usa'; // default fallback
    if (partner.includes('who')) badgeClass = 'bg-who';
    else if (partner.includes('china')) badgeClass = 'bg-china';
    else if (partner.includes('japan')) badgeClass = 'bg-japan';
    else if (partner.includes('usa')) badgeClass = 'bg-usa';

    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
        <div class="timeline-badge ${badgeClass}">${coop.badge}</div>
        <div class="timeline-content">
            <span class="timeline-date">${coop.year}</span>
            <h3 data-en="${coop.titleEn}" data-si="${coop.titleSi}"></h3>
            <p data-en="${coop.descEn}" data-si="${coop.descSi}"></p>
        </div>
    `;
    timelineContainer.appendChild(item);
}

/**
 * Load Custom Items from LocalStorage on page initialization
 */
function loadCustomItems() {
    // 1. Load custom locations
    const customLocs = JSON.parse(localStorage.getItem('cbrne_custom_locations') || '[]');
    customLocs.forEach(loc => renderLocationCard(loc));

    // 2. Load custom cooperation items
    const customCoops = JSON.parse(localStorage.getItem('cbrne_custom_coops') || '[]');
    customCoops.forEach(coop => renderCooperationItem(coop));
}
