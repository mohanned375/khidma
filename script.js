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
document.addEventListener('DOMContentLoaded', function() {
    // --- وظائف تسجيل مقدم الخدمة ---
    const registerForm = document.getElementById('registerForm');
    const providerServiceSelect = document.getElementById('providerService');
    const otherServiceGroup = document.getElementById('otherServiceGroup');
    const registerSuccessAlert = document.getElementById('registerSuccess');
    const registerErrorAlert = document.getElementById('registerError');

    // التأكد من وجود العناصر قبل إضافة المستمعين لتجنب الأخطاء
    if (providerServiceSelect) {
        providerServiceSelect.addEventListener('change', function() {
            if (otherServiceGroup) {
                otherServiceGroup.style.display = (this.value === 'أخرى') ? 'block' : 'none';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // إظهار مؤشر التحميل وتعطيل الزر
            const submitButton = registerForm.querySelector('button[type="submit"]');
            if(submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
            }

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
                if (registerSuccessAlert) registerSuccessAlert.style.display = 'block';
                if (registerErrorAlert) registerErrorAlert.style.display = 'none';
                registerForm.reset();
                if (otherServiceGroup) otherServiceGroup.style.display = 'none';
                
                setTimeout(() => {
                    closeModal('registerModal');
                    // إعادة الزر لحالته الطبيعية بعد الإغلاق
                    if(submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
                    }
                }, 3000);

            }).catch(error => {
                console.error("Error adding document: ", error);
                if (registerErrorAlert) registerErrorAlert.style.display = 'block';
                if (registerSuccessAlert) registerSuccessAlert.style.display = 'none';
                // إعادة الزر لحالته الطبيعية عند حدوث خطأ
                if(submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
                }
            });
        });
    }

    // --- وظائف البحث ---
    const mainSearchInput = document.getElementById('mainSearch');
    const advancedSearchForm = document.getElementById('advancedSearchForm');
    const otherServiceSearchForm = document.getElementById('otherServiceSearchForm');

    // ربط زر البحث الرئيسي
    const mainSearchButton = document.querySelector('.search-btn');
    if (mainSearchButton) {
        mainSearchButton.addEventListener('click', performSearch);
    }
    
    if (advancedSearchForm) {
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
    }

    if (otherServiceSearchForm) {
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
    }
});
