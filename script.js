// تهيئة Firebase - استبدل هذا بمعلومات مشروعك الخاصة
const firebaseConfig = {
  apiKey: "AIzaSyBSujjNja7qC_Lamp8DTH-T_O2ia2ZzU0E", // استبدل هذا
  authDomain: "khidma-5cbbc.firebaseapp.com", // استبدل هذا
  projectId: "khidma-5cbbc", // استبدل هذا
  storageBucket: "khidma-5cbbc.firebasestorage.app", // استبدل هذا
  messagingSenderId: "992721988153", // استبدل هذا
  appId: "1:992721988153:web:77599e16ea175be6a2bbe8" // استبدل هذا
};
// --- وظائف شريط التنقل والقوائم ---
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const navButtons = document.getElementById('navButtons');
    navMenu.classList.toggle('active');
    navButtons.classList.toggle('active'); // Add this line
}

// --- باقي كود script.js يبقى كما هو ---

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- وظائف النماذج (Modals) ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}
function openRegisterModal() { openModal('registerModal'); }
function openSearchModal() { openModal('searchModal'); }
function openOtherServiceModal() { openModal('otherServiceModal'); }

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// --- وظائف تسجيل مقدم الخدمة ---
const registerForm = document.getElementById('registerForm');
const providerServiceSelect = document.getElementById('providerService');
const otherServiceGroup = document.getElementById('otherServiceGroup');
const registerSuccessAlert = document.getElementById('registerSuccess');
const registerErrorAlert = document.getElementById('registerError');

providerServiceSelect.addEventListener('change', function() {
    otherServiceGroup.style.display = (this.value === 'أخرى') ? 'block' : 'none';
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const serviceValue = providerServiceSelect.value === 'أخرى' ? document.getElementById('otherService').value : providerServiceSelect.value;
    const providerData = {
        name: document.getElementById('providerName').value,
        phone: document.getElementById('providerPhone').value,
        service: serviceValue,
        city: document.getElementById('providerCity').value,
        description: document.getElementById('providerDescription').value,
        experience: document.getElementById('providerExperience').value,
        approved: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('providers').add(providerData).then(() => {
        registerSuccessAlert.style.display = 'block';
        registerErrorAlert.style.display = 'none';
        registerForm.reset();
        otherServiceGroup.style.display = 'none';
        setTimeout(() => closeModal('registerModal'), 3000);
    }).catch(error => {
        console.error("Error adding document: ", error);
        registerErrorAlert.style.display = 'block';
        registerSuccessAlert.style.display = 'none';
    });
});

// --- وظائف البحث ---
const mainSearchInput = document.getElementById('mainSearch');
const searchResultsSection = document.getElementById('searchResults');
const providersList = document.getElementById('providersList');
const loadingIndicator = document.getElementById('loading');
const advancedSearchForm = document.getElementById('advancedSearchForm');
const otherServiceSearchForm = document.getElementById('otherServiceSearchForm');

function performSearch() {
    const query = mainSearchInput.value.trim();
    if (query) searchProviders({ keyword: query });
}
function searchByCategory(category) { searchProviders({ service: category }); }

advancedSearchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const filters = {
        service: document.getElementById('searchService').value,
        city: document.getElementById('searchCity').value.trim(),
        keyword: document.getElementById('searchKeyword').value.trim()
    };
    searchProviders(filters);
    closeModal('searchModal');
});

otherServiceSearchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const filters = {
        service: 'أخرى',
        keyword: document.getElementById('customService').value.trim(),
        city: document.getElementById('customCity').value.trim()
    };
    searchProviders(filters);
    closeModal('otherServiceModal');
});

async function searchProviders(filters) {
    searchResultsSection.style.display = 'block';
    loadingIndicator.style.display = 'block';
    providersList.innerHTML = '';
    window.scrollTo({ top: searchResultsSection.offsetTop, behavior: 'smooth' });
    let query = db.collection('providers').where('approved', '==', true);
    if (filters.service && filters.service !== 'أخرى') query = query.where('service', '==', filters.service);
    if (filters.city) query = query.where('city', '==', filters.city);
    try {
        const snapshot = await query.get();
        let results = [];
        snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            results = results.filter(p => (p.name && p.name.toLowerCase().includes(keyword)) || (p.description && p.description.toLowerCase().includes(keyword)) || (p.service && p.service.toLowerCase().includes(keyword)));
        }
        displayResults(results);
    } catch (error) {
        console.error("Error getting documents: ", error);
        providersList.innerHTML = '<p class="error-message">حدث خطأ أثناء البحث.</p>';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function displayResults(results) {
    if (results.length === 0) {
        providersList.innerHTML = '<p>لا توجد نتائج تطابق بحثك.</p>';
        return;
    }
    results.forEach(provider => {
        const providerCard = `
            <div class="provider-card">
                <h3>${provider.name}</h3>
                <p><strong>الخدمة:</strong> ${provider.service}</p>
                <p><strong>المدينة:</strong> ${provider.city}</p>
                ${provider.experience ? `<p><strong>الخبرة:</strong> ${provider.experience} سنوات</p>` : ''}
                ${provider.description ? `<p>${provider.description}</p>` : ''}
                <div class="provider-contact">
                    <a href="tel:${provider.phone}" class="btn btn-primary"><i class="fas fa-phone"></i> اتصال</a>
                    <a href="https://wa.me/${provider.phone}" target="_blank" class="btn btn-secondary"><i class="fab fa-whatsapp"></i> واتساب</a>
                </div>
            </div>
        `;
        providersList.innerHTML += providerCard;
    });
}
