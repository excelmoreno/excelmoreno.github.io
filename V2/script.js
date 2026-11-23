
// =====================================
// CIMAREVIEWS V2
// =====================================

// DATOS INICIALES
const initialBusinesses = [
    {
        id: 1,
        name: "Cafetería Central",
        category: "Cafetería",
        description: "Café, bebidas frías y alimentos para disfrutar entre clases.",
        price: "$40 - $90",
        location: "Campus universitario",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
        owner: "demo",
        promotion: true,
        reviews: [
            { user: "Andrea", rating: 5, text: "Muy buen café y excelente ambiente." },
            { user: "Luis", rating: 4, text: "Buena opción para desayunar." }
        ]
    },
    {
        id: 2,
        name: "Burger Campus",
        category: "Comida rápida",
        description: "Hamburguesas, papas y combos a precios accesibles.",
        price: "$65 - $120",
        location: "Zona de estudiantes",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        owner: "demo",
        promotion: true,
        reviews: [
            { user: "Carlos", rating: 4, text: "Buenas hamburguesas y porciones." }
        ]
    },
    {
        id: 3,
        name: "Dulce Momento",
        category: "Postres",
        description: "Postres, pasteles, galletas y bebidas dulces.",
        price: "$30 - $80",
        location: "Cerca de biblioteca",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
        owner: "demo",
        promotion: false,
        reviews: [
            { user: "María", rating: 5, text: "Los postres están muy ricos." }
        ]
    },
    {
        id: 4,
        name: "Green Bowl",
        category: "Comida saludable",
        description: "Ensaladas, bowls y opciones frescas para comer.",
        price: "$55 - $100",
        location: "Área de cafeterías",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        owner: "demo",
        promotion: false,
        reviews: []
    }
];

// DATOS GUARDADOS
let businesses = JSON.parse(localStorage.getItem("cimaBusinesses")) || initialBusinesses;
let users = JSON.parse(localStorage.getItem("cimaUsers")) || [];
let favorites = JSON.parse(localStorage.getItem("cimaFavorites")) || [];
let currentUser = JSON.parse(localStorage.getItem("cimaSession")) || null;

let authMode = "login";
let currentReviewBusiness = null;

// GUARDAR DATOS
function saveData() {
    localStorage.setItem("cimaBusinesses", JSON.stringify(businesses));
    localStorage.setItem("cimaUsers", JSON.stringify(users));
    localStorage.setItem("cimaFavorites", JSON.stringify(favorites));
    localStorage.setItem("cimaSession", JSON.stringify(currentUser));
}

// ESCAPAR TEXTO PARA MOSTRARLO EN HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// NAVEGACIÓN
function showSection(sectionId) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.add("hidden");
    });

    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove("hidden");
    }

    if (sectionId === "favoritos") renderFavorites();
    if (sectionId === "promociones") renderPromotions();
    if (sectionId === "vendedor") renderSellerBusinesses();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// CALCULAR CALIFICACIÓN PROMEDIO
function getAverageRating(business) {
    if (!business.reviews || business.reviews.length === 0) {
        return "Sin calificaciones";
    }

    const total = business.reviews.reduce((sum, review) => {
        return sum + Number(review.rating);
    }, 0);

    return (total / business.reviews.length).toFixed(1);
}

// CREAR TARJETA DE ESTABLECIMIENTO
function createBusinessCard(business) {
    const isFavorite = favorites.includes(business.id);
    const average = getAverageRating(business);
    const reviewCount = business.reviews ? business.reviews.length : 0;

    const mapUrl = "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(business.location || business.name);

    return `
        <article class="business-card">
            <img
                class="business-image"
                src="${escapeHTML(business.image || "https://placehold.co/600x400/eaf5ee/27845a?text=CimaReviews")}"
                alt="${escapeHTML(business.name)}"
                onerror="this.src='https://placehold.co/600x400/eaf5ee/27845a?text=CimaReviews'"
            >

            <div class="business-info">
                <span class="category-tag">${escapeHTML(business.category)}</span>

                ${business.promotion ? '<span class="category-tag">Destacado</span>' : ""}

                <h3>${escapeHTML(business.name)}</h3>
                <div class="rating">★ ${escapeHTML(average)} 
                    <span style="color:#718078;font-weight:400">
                        (${reviewCount} opiniones)
                    </span>
                </div>

                <p>${escapeHTML(business.description)}</p>
                <p><strong>Precio:</strong> ${escapeHTML(business.price || "No especificado")}</p>
                <p><strong>Ubicación:</strong> ${escapeHTML(business.location || "No especificada")}</p>

                <div class="card-actions">
                    <button class="btn btn-primary"
                        onclick="openReview(${business.id})">
                        Ver opiniones
                    </button>

                    <button class="favorite-button"
                        onclick="toggleFavorite(${business.id})"
                        title="Agregar a favoritos">
                        ${isFavorite ? "♥ Guardado" : "♡ Favorito"}
                    </button>

                    <a class="btn btn-outline"
                        href="${mapUrl}"
                        target="_blank"
                        rel="noopener noreferrer">
                        Ubicación
                    </a>
                </div>
            </div>
        </article>
    `;
}

// MOSTRAR CATÁLOGO
function renderBusinesses() {
    const grid = document.getElementById("businessGrid");
    const search = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;

    const filtered = businesses.filter(business => {
        const matchesName =
            business.name.toLowerCase().includes(search) ||
            business.description.toLowerCase().includes(search);

        const matchesCategory =
            category === "Todos" || business.category === category;

        return matchesName && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-message">No se encontraron establecimientos.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(createBusinessCard).join("");
}

// FAVORITOS
function toggleFavorite(id) {
    if (!currentUser) {
        alert("Inicia sesión para guardar tus favoritos.");
        openAuth("login");
        return;
    }

    if (favorites.includes(id)) {
        favorites = favorites.filter(favoriteId => favoriteId !== id);
    } else {
        favorites.push(id);
    }

    saveData();
    renderBusinesses();
    renderFavorites();
}

function renderFavorites() {
    const grid = document.getElementById("favoritesGrid");
    const favoriteBusinesses = businesses.filter(business =>
        favorites.includes(business.id)
    );

    grid.innerHTML = favoriteBusinesses.length
        ? favoriteBusinesses.map(createBusinessCard).join("")
        : `<div class="empty-message">Todavía no tienes establecimientos favoritos.</div>`;
}

// PROMOCIONES
function renderPromotions() {
    const grid = document.getElementById("promotionsGrid");
    const promotions = businesses.filter(business => business.promotion);

    grid.innerHTML = promotions.length
        ? promotions.map(createBusinessCard).join("")
        : `<div class="empty-message">No hay promociones disponibles.</div>`;
}

// AUTENTICACIÓN
function openAuth(mode) {
    authMode = mode;

    const modal = document.getElementById("authModal");
    const title = document.getElementById("authTitle");
    const description = document.getElementById("authDescription");
    const nameGroup = document.getElementById("registerNameGroup");
    const roleGroup = document.getElementById("registerRoleGroup");
    const submit = document.getElementById("authSubmit");
    const switchText = document.getElementById("authSwitch");
    const message = document.getElementById("authMessage");

    message.textContent = "";
    document.getElementById("authForm").reset();

    if (mode === "register") {
        title.textContent = "Crear cuenta";
        description.textContent = "Regístrate para comenzar a utilizar CimaReviews.";
        nameGroup.classList.remove("hidden");
        roleGroup.classList.remove("hidden");
        submit.textContent = "Registrarme";
        switchText.innerHTML = '¿Ya tienes cuenta? <a href="#" onclick="openAuth(\'login\')">Inicia sesión</a>';
    } else {
        title.textContent = "Iniciar sesión";
        description.textContent = "Ingresa a tu cuenta de CimaReviews.";
        nameGroup.classList.add("hidden");
        roleGroup.classList.add("hidden");
        submit.textContent = "Iniciar sesión";
        switchText.innerHTML = '¿No tienes cuenta? <a href="#" onclick="openAuth(\'register\')">Regístrate</a>';
    }

    modal.classList.remove("hidden");
}

function closeAuth() {
    document.getElementById("authModal").classList.add("hidden");
}

// PROCESAR REGISTRO E INICIO DE SESIÓN
document.getElementById("authForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("authEmail").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value;
    const message = document.getElementById("authMessage");

    if (authMode === "register") {
        const name = document.getElementById("authName").value.trim();
        const role = document.getElementById("authRole").value;

        if (!name) {
            message.textContent = "Escribe tu nombre.";
            return;
        }

        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            message.textContent = "Este correo ya está registrado.";
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role
        };

        users.push(newUser);
        currentUser = newUser;

    } else {
        const user = users.find(user =>
            user.email === email && user.password === password
        );

        if (!user) {
            message.textContent = "Correo o contraseña incorrectos.";
            return;
        }

        currentUser = user;
    }

    saveData();
    closeAuth();
    updateUserInterface();

    alert("¡Bienvenido a CimaReviews!");
});

// ACTUALIZAR INTERFAZ DEL USUARIO
function updateUserInterface() {
    const userActions = document.getElementById("userActions");
    const loggedActions = document.getElementById("loggedActions");
    const sellerLink = document.getElementById("sellerLink");
    const userName = document.getElementById("userName");

    if (currentUser) {
        userActions.classList.add("hidden");
        loggedActions.classList.remove("hidden");
        userName.textContent = "Hola, " + currentUser.name;

        if (currentUser.role === "vendedor") {
            sellerLink.classList.remove("hidden");
        } else {
            sellerLink.classList.add("hidden");
        }
    } else {
        userActions.classList.remove("hidden");
        loggedActions.classList.add("hidden");
        sellerLink.classList.add("hidden");
    }

    renderBusinesses();
}

// CERRAR SESIÓN
function logout() {
    currentUser = null;
    saveData();
    updateUserInterface();
    showSection("inicio");
}

// RESEÑAS
function openReview(id) {
    currentReviewBusiness = id;

    const business = businesses.find(item => item.id === id);
    if (!business) return;

    document.getElementById("reviewTitle").textContent =
        "Opiniones de " + business.name;

    document.getElementById("reviewMessage").textContent = "";

    renderReviews();
    document.getElementById("reviewModal").classList.remove("hidden");
}

function closeReview() {
    document.getElementById("reviewModal").classList.add("hidden");
}

function renderReviews() {
    const business = businesses.find(item =>
        item.id === currentReviewBusiness
    );

    if (!business) return;

    const list = document.getElementById("reviewList");

    if (!business.reviews || business.reviews.length === 0) {
        list.innerHTML = `<p class="empty-message">Este establecimiento todavía no tiene opiniones.</p>`;
        return;
    }

    list.innerHTML = business.reviews.map(review => `
        <div class="review-item">
            <strong>${escapeHTML(review.user)}</strong>
            <div class="rating">${"★".repeat(Number(review.rating))}${"☆".repeat(5 - Number(review.rating))}</div>
            <p>${escapeHTML(review.text)}</p>
        </div>
    `).join("");
}

// PUBLICAR RESEÑA
document.getElementById("reviewForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const message = document.getElementById("reviewMessage");

    if (!currentUser) {
        message.textContent = "Debes iniciar sesión para publicar una opinión.";
        return;
    }

    if (currentUser.role !== "cliente") {
        message.textContent = "Solo las cuentas de cliente pueden publicar opiniones.";
        return;
    }

    const business = businesses.find(item =>
        item.id === currentReviewBusiness
    );

    if (!business) return;

    const rating = Number(document.getElementById("reviewRating").value);
    const text = document.getElementById("reviewText").value.trim();

    if (!text) {
        message.textContent = "Escribe tu opinión antes de publicar.";
        return;
    }

    business.reviews.push({
        user: currentUser.name,
        rating,
        text
    });

    saveData();
    document.getElementById("reviewForm").reset();

    message.textContent = "¡Tu opinión fue publicada!";
    renderReviews();
    renderBusinesses();
});

// AGREGAR ESTABLECIMIENTO COMO VENDEDOR
document.getElementById("businessForm").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!currentUser || currentUser.role !== "vendedor") {
        alert("Necesitas iniciar sesión con una cuenta de vendedor.");
        return;
    }

    const newBusiness = {
        id: Date.now(),
        name: document.getElementById("businessName").value.trim(),
        category: document.getElementById("businessCategory").value,
        description: document.getElementById("businessDescription").value.trim(),
        price: document.getElementById("businessPrice").value.trim() || "No especificado",
        location: document.getElementById("businessLocation").value.trim() || "No especificada",
        image: document.getElementById("businessImage").value.trim() ||
            "https://placehold.co/600x400/eaf5ee/27845a?text=CimaReviews",
        owner: currentUser.email,
        promotion: document.getElementById("businessPromotion").checked,
        reviews: []
    };

    businesses.push(newBusiness);

    saveData();
    this.reset();

    renderBusinesses();
    renderSellerBusinesses();

    alert("¡Establecimiento agregado correctamente!");
});

// MOSTRAR LOS NEGOCIOS DEL VENDEDOR ACTUAL
function renderSellerBusinesses() {
    const grid = document.getElementById("sellerBusinesses");

    if (!currentUser || currentUser.role !== "vendedor") {
        grid.innerHTML = `<div class="empty-message">Inicia sesión como vendedor para administrar tus establecimientos.</div>`;
        return;
    }

    const ownBusinesses = businesses.filter(business =>
        business.owner === currentUser.email
    );

    if (ownBusinesses.length === 0) {
        grid.innerHTML = `<div class="empty-message">Todavía no has registrado establecimientos.</div>`;
        return;
    }

    grid.innerHTML = ownBusinesses.map(business => `
        <article class="business-card">
            <img class="business-image"
                src="${escapeHTML(business.image)}"
                alt="${escapeHTML(business.name)}">

            <div class="business-info">
                <span class="category-tag">${escapeHTML(business.category)}</span>
                <h3>${escapeHTML(business.name)}</h3>
                <p>${escapeHTML(business.description)}</p>
                <p class="rating">★ ${escapeHTML(getAverageRating(business))}</p>
                <div class="card-actions">
                    <button class="btn btn-outline"
                        onclick="deleteBusiness(${business.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

// ELIMINAR ESTABLECIMIENTO
function deleteBusiness(id) {
    const business = businesses.find(item => item.id === id);

    if (!business || !currentUser || business.owner !== currentUser.email) {
        alert("No puedes eliminar este establecimiento.");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar este establecimiento?")) {
        return;
    }

    businesses = businesses.filter(item => item.id !== id);
    favorites = favorites.filter(favoriteId => favoriteId !== id);

    saveData();
    renderBusinesses();
    renderFavorites();
    renderSellerBusinesses();
}

// INICIALIZAR APLICACIÓN
document.addEventListener("DOMContentLoaded", function() {
    updateUserInterface();
    renderBusinesses();
});
