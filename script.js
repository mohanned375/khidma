// تهيئة Firebase - استبدل هذا بمعلومات مشروعك الخاصة
const firebaseConfig = {
  apiKey: "AIzaSyBSujjNja7qC_Lamp8DTH-T_O2ia2ZzU0E", // استبدل هذا
  authDomain: "khidma-5cbbc.firebaseapp.com", // استبدل هذا
  projectId: "khidma-5cbbc", // استبدل هذا
  storageBucket: "khidma-5cbbc.firebasestorage.app", // استبدل هذا
  messagingSenderId: "992721988153", // استبدل هذا
  appId: "1:992721988153:web:77599e16ea175be6a2bbe8" // استبدل هذا
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- وظائف شريط التنقل والقوائم ---

// وظيفة لفتح وإغلاق القائمة المنسدلة في وضع الموبايل
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// --- وظائف النماذج (Modals) ---

// وظيفة لفتح أي نموذج بناءً على الـ ID الخاص به
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// وظيفة لإغلاق أي نموذج بناءً على الـ ID الخاص به
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// وظائف مخصصة لفتح كل نموذج
function openRegisterModal() {
    openModal('registerModal');
}

function openSearchModal() {
    openModal('searchModal');
}

function openOtherServiceModal() {
    openModal('otherServiceModal');
}

// إغلاق النموذج عند النقر خارج المحتوى
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

// إظهار حقل "خدمة أخرى" عند الاختيار
providerServiceSelect.addEventListener('change', function() {
    if (this.value === 'أخرى') {
        otherServiceGroup.style.display = 'block';
    } else {
        otherServiceGroup.style.display = 'none';
    }
});

// التعامل مع تقديم نموذج التسجيل
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const serviceValue = providerServiceSelect.value === 'أخرى' 
        ? document.getElementById('otherService').value 
        : providerServiceSelect.value;

    const providerData = {
        name: document.getElementById('providerName').value,
        phone: document.getElementById('providerPhone').value,
        service: serviceValue,
        city: document.getElementById('providerCity').value,
        description: document.getElementById('providerDescription').value,
        experience: document.getElementById('providerExperience').value,
        approved: false, // يتم تعيينه إلى false افتراضيًا للمراجعة
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('providers').add(providerData)
        .then(() => {
            registerSuccessAlert.style.display = 'block';
            registerErrorAlert.style.display = 'none';
            registerForm.reset();
            otherServiceGroup.style.display = 'none';
            setTimeout(() => closeModal('registerModal'), 3000);
        })
        .catch(error => {
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

// وظيفة البحث الرئيسية من الشريط العلوي
function performSearch() {
    const query = mainSearchInput.value.trim();
    if (query) {
        searchProviders({ keyword: query });
    }
}

// وظيفة البحث عند الضغط على فئة خدمة
function searchByCategory(category) {
    searchProviders({ service: category });
}

// التعامل مع نموذج البحث المتقدم
advancedSearchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const service = document.getElementById('searchService').value;
    const city = document.getElementById('searchCity').value.trim();
    const keyword = document.getElementById('searchKeyword').value.trim();
    
    const filters = {};
    if (service) filters.service = service;
    if (city) filters.city = city;
    if (keyword) filters.keyword = keyword;

    searchProviders(filters);
    closeModal('searchModal');
});

// التعامل مع نموذج البحث عن خدمة أخرى
otherServiceSearchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const customService = document.getElementById('customService').value.trim();
    const customCity = document.getElementById('customCity').value.trim();

    const filters = { service: 'أخرى', keyword: customService };
    if (customCity) filters.city = customCity;

    searchProviders(filters);
    closeModal('otherServiceModal');
});

// الوظيفة الأساسية للبحث في Firestore
async function searchProviders(filters) {
    searchResultsSection.style.display = 'block';
    loadingIndicator.style.display = 'block';
    providersList.innerHTML = '';
    window.scrollTo({ top: searchResultsSection.offsetTop, behavior: 'smooth' });

    let query = db.collection('providers').where('approved', '==', true);

    if (filters.service && filters.service !== 'أخرى') {
        query = query.where('service', '==', filters.service);
    }
    if (filters.city) {
        query = query.where('city', '==', filters.city);
    }

    try {
        const snapshot = await query.get();
        let results = [];
        snapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
        });

        // فلترة إضافية للكلمة المفتاحية
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            results = results.filter(provider => 
                (provider.name && provider.name.toLowerCase().includes(keyword)) ||
                (provider.description && provider.description.toLowerCase().includes(keyword)) ||
                (provider.service && provider.service.toLowerCase().includes(keyword))
            );
        }
        
        displayResults(results);

    } catch (error) {
        console.error("Error getting documents: ", error);
        providersList.innerHTML = '<p class="error-message">حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.</p>';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// وظيفة عرض نتائج البحث
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
