let currentTheme = "woodstock";

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    // --- ACCESSIBILITY PREFERENCES ---
    if (localStorage.getItem("retrofest_dark_mode") === "true")
        document.documentElement.classList.add("dark");
    if (localStorage.getItem("retrofest_high_contrast") === "true")
        document.body.classList.add("high-contrast");
    if (localStorage.getItem("retrofest_large_text") === "true")
        document.documentElement.classList.add("large-text");

    // --- COOKIE BANNER (With Memory) ---
    if (!localStorage.getItem("retrofest_cookie_consent")) {
        setTimeout(() => {
            document
                .getElementById("cookie-banner")
                ?.classList.remove("translate-y-full");
        }, 1000);
    }

    // --- ROUTER INIT (MPA Hash Based) ---
    window.addEventListener("hashchange", handleLocation);
    handleLocation();

    // --- SEARCH LOGIC ---
    const desktopSearch = document.getElementById("desktop-search");
    if (desktopSearch)
        desktopSearch.addEventListener("input", (e) =>
            handleSearch(e.target.value)
        );

    // --- FORM HANDLING ---
    const contactForm = document.getElementById("contact-form");
    if (contactForm) contactForm.addEventListener("submit", handleFormSubmit);

    const requestDetails = document.getElementById("request-details");
    if (requestDetails) {
        requestDetails.addEventListener("input", (e) => {
            document.getElementById("char-count").textContent =
                e.target.value.length;
        });
    }
});

// --- GLOBAL CLICK LISTENER ---
document.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
        const action = actionBtn.getAttribute("data-action");
        const payload = actionBtn.getAttribute("data-payload");

        switch (action) {
            case "legal":
                openModal("legal", payload);
                break;
            case "media":
                openModal("media", payload);
                e.stopPropagation();
                break;
            case "close-modal":
                if (actionBtn.id === "dynamic-modal" && e.target !== actionBtn)
                    return;
                closeModal();
                break;
            case "toggle-dark":
                toggleDarkMode();
                break;
            case "toggle-contrast":
                toggleContrast();
                break;
            case "toggle-text":
                toggleTextSize();
                break;
            case "toggle-menu":
                document
                    .getElementById("mobile-menu")
                    .classList.toggle("hidden");
                break;
            case "toggle-a11y":
                document
                    .getElementById("a11y-toolbar")
                    .classList.toggle("translate-x-full");
                break;
            case "close-cookies":
                document
                    .getElementById("cookie-banner")
                    .classList.add("translate-y-full");
                localStorage.setItem(
                    "retrofest_cookie_consent",
                    "acknowledged"
                );
                break;
            case "reset-contact":
                resetContactForm();
                break;
        }
        return;
    }

    const card = e.target.closest(".festival-card");
    if (card) card.classList.toggle("flipped");
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

// --- MPA LOCATION HANDLER ---
function handleLocation() {
    const festivalContainer = document.getElementById("view-festivals");
    if (!festivalContainer) return;

    const hash = window.location.hash.replace("#", "");
    if (hash && festivalData[hash]) {
        setTheme(hash);
    } else {
        setTheme("woodstock");
    }
}

// --- THEME & UI DATA BINDING ---
function setTheme(themeName) {
    currentTheme = themeName;
    const container = document.getElementById("festival-container");
    const title = document.getElementById("festival-title");
    const desc = document.getElementById("festival-desc");
    const about = document.getElementById("festival-about");
    const bgLayer = document.getElementById("festival-bg");

    const data = festivalData[themeName];

    // Apply background to the independent fixed layer
    if (bgLayer) {
        bgLayer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${data.bg}')`;
    }

    container.style.background = "none";
    container.className = `min-h-screen p-8 transition-colors duration-500 theme-${themeName}`;

    title.textContent = data.title;
    desc.innerHTML = data.desc;
    about.innerHTML = `
        <details class="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hc:border-[3px] hc:border-white hc:rounded-none group shadow-2xl transition-all">
            <summary class="cursor-pointer p-4 md:p-6 font-bold text-xl md:text-2xl flex justify-between items-center hover:bg-white/10 transition list-none">
                <span>Discover the History</span>
                <i data-lucide="chevron-down" class="w-6 h-6 transition-transform duration-300 group-open:rotate-180"></i>
            </summary>
            <div class="tracking-wide p-6 border-t border-white/20 text-base md:text-lg leading-relaxed text-left">
                <div class="festival-article space-y-4">${data.about}</div>
                <div class="mt-8 flex justify-center pt-4">
                    <a href="${data.wiki}" target="_blank" rel="noopener noreferrer" class="font-bold inline-flex items-center gap-2 text-sm bg-white/20 px-6 py-3 rounded-full border border-white/40 transition">
                        <i data-lucide="external-link" class="w-4 h-4"></i> Read Full Article
                    </a>
                </div>
            </div>
        </details>
    `;
    renderCards(themeName);
}

// --- RENDER CARDS & SEARCH ---
function renderCards(themeOrItems) {
    const grid = document.getElementById("card-grid");
    grid.innerHTML = "";

    let itemsToRender =
        typeof themeOrItems === "string"
            ? festivalData[themeOrItems].items
            : themeOrItems;

    if (!itemsToRender || itemsToRender.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-2xl font-bold text-white mb-2">No matches found</p></div>`;
        return;
    }

    itemsToRender.forEach((item) => {
        const card = document.createElement("div");
        card.className =
            "group h-80 w-full perspective-1000 cursor-pointer festival-card tracking-[0.03]";
        const buttonStyle = item.video
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-gray-200 text-gray-500 cursor-not-allowed";
        const buttonText = item.video ? "View Footage" : "No Footage";
        const actionAttr = item.video
            ? `data-action="media" data-payload="${item.id}"`
            : "";
        const displayImage = item.image || "./assets/placeholder.webp";

        card.innerHTML = `
            <div class="relative h-full w-full transition-all duration-700 preserve-3d">
                <div class="absolute h-full w-full backface-hidden rounded-xl shadow-xl p-6 flex flex-col justify-between card-front border-4 border-opacity-50" style="border-color: var(--border-card); background-color: var(--bg-card); color: var(--text-card);">
                    <div>
                        <div class="h-32 w-full rounded-lg mb-4 bg-black/10 flex items-center justify-center overflow-hidden relative">
                             <img src="${displayImage}" alt="${
            item.alt || item.title
        }" loading="lazy" class="w-full h-full object-cover opacity-80 hover:opacity-100 transition">
                        </div>
                        <h3 class="text-2xl font-bold uppercase tracking-wider">${
                            item.title
                        }</h3>
                        <p class="text-md opacity-80 font-bold mt-2">${
                            item.role
                        }</p>
                    </div>
                    <div class="text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                        <i data-lucide="rotate-cw" class="w-3 h-3"></i> Click to Flip
                    </div>
                </div>
                <div class="absolute h-full w-full backface-hidden rotate-y-180 rounded-xl shadow-xl p-6 flex flex-col justify-center border-4 border-opacity-50" style="border-color: var(--border-card); background-color: var(--bg-card); color: var(--text-card);">
                    <p class="text-lg leading-relaxed mb-4">${item.details}</p>
                    <button ${actionAttr} class="mt-4 py-2 px-4 rounded font-bold flex items-center justify-center gap-2 transition ${buttonStyle}">
                        <i data-lucide="play-circle" class="w-4 h-4"></i> ${buttonText}
                    </button>
                </div>
            </div>`;
        grid.appendChild(card);
    });

    lucide.createIcons();
}

let searchTimeout;
function handleSearch(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const term = query.toLowerCase().trim();
        if (term.length === 0) return setTheme(currentTheme);

        const allItems = [];
        Object.values(festivalData).forEach((theme) =>
            allItems.push(...theme.items)
        );

        const results = allItems.filter(
            (item) =>
                item.title.toLowerCase().includes(term) ||
                item.role.toLowerCase().includes(term) ||
                item.details.toLowerCase().includes(term)
        );

        document.getElementById(
            "festival-title"
        ).textContent = `Searching: "${query}"`;
        document.getElementById(
            "festival-desc"
        ).textContent = `Found ${results.length} matches.`;
        document.getElementById("festival-about").innerHTML = "";
        renderCards(results);
    }, 300);
}

// --- DYNAMIC MODAL LOGIC ---
function openModal(type, payload) {
    const modal = document.getElementById("dynamic-modal");
    modal.innerHTML = "";

    if (type === "legal") {
        const title =
            payload === "privacy" ? "Privacy Policy" : "Terms of Service";
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 hc:bg-black w-full max-w-2xl relative flex flex-col max-h-[80vh] border rounded-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold">${title}</h3>
                    <button data-action="close-modal" aria-label="Close modal"><i data-lucide="x"></i></button>
                </div>
                <div class="flex-grow">Educational use only.</div>
            </div>`;
    } else if (type === "media") {
        let item;
        Object.values(festivalData).forEach((theme) => {
            const found = theme.items.find((i) => i.id === parseInt(payload));
            if (found) item = found;
        });

        if (!item || !item.video) return;

        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 hc:bg-black rounded-lg w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
                <button data-action="close-modal" aria-label="Close modal" class="absolute top-4 right-4 z-20 bg-black/50 text-white rounded-full p-2"><i data-lucide="x"></i></button>
                <div class="w-full md:w-2/3 bg-black flex flex-col justify-center">
                    <video width="100%" height="100%" controls autoplay class="object-cover"><source src="${item.video}" type="video/mp4"></video>
                </div>
                <div class="w-full md:w-1/3 p-6 text-gray-900 dark:text-gray-100 hc:text-white">
                    <h3 class="text-2xl font-bold mb-2">${item.title}</h3>
                    <p class="mb-6">${item.details}</p>
                </div>
            </div>`;
    }

    lucide.createIcons();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById("dynamic-modal");
    modal.innerHTML = "";
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
}

// --- ACCESSIBILITY HELPER FUNCTIONS ---
function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
        "retrofest_dark_mode",
        document.documentElement.classList.contains("dark")
    );
}
function toggleContrast() {
    document.body.classList.toggle("high-contrast");
    localStorage.setItem(
        "retrofest_high_contrast",
        document.body.classList.contains("high-contrast")
    );
}
function toggleTextSize() {
    document.documentElement.classList.toggle("large-text");
    localStorage.setItem(
        "retrofest_large_text",
        document.documentElement.classList.contains("large-text")
    );
}

// --- FORM SUBMISSION HELPERS ---
function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById("contact-form").classList.add("hidden");
    document.getElementById("contact-success").classList.remove("hidden");
    document.getElementById("contact-success").classList.add("flex");
}

function resetContactForm() {
    document.getElementById("contact-form").reset();
    document.getElementById("contact-success").classList.add("hidden");
    document.getElementById("contact-success").classList.remove("flex");
    document.getElementById("contact-form").classList.remove("hidden");
    document.getElementById("char-count").textContent = "0";
}
