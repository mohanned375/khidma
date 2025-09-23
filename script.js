// انتظر حتى يتم تحميل الصفحة بالكامل قبل تشغيل أي كود
document.addEventListener('DOMContentLoaded', function() {

    // --- تهيئة Firebase ---
    // هام: تأكد من أن هذه البيانات موجودة وصحيحة
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

    // --- ربط العناصر بالدوال (الجزء الأهم لحل المشكلة) ---

    // 1. ربط نموذج التسجيل
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            handleSubmit(event, db); // تمرير قاعدة البيانات إلى الدالة
        });
    }

    // 2. ربط نماذج البحث الأخرى (للتأكد من أنها تعمل أيضًا)
    const advancedSearchForm = document.getElementById('advancedSearchForm');
    if (advancedSearchForm) {
        advancedSearchForm.addEventListener('submit', function(event) {
            // يمكنك إضافة دالة البحث هنا لاحقًا
            event.preventDefault();
            console.log("Advanced search submitted");
            closeModal('searchModal');
        });
    }

    // 3. ربط حقل "نوع الخدمة" في نموذج التسجيل
    const providerServiceSelect = document.getElementById('providerService');
    const otherServiceGroup = document.getElementById('otherServiceGroup');
    if (providerServiceSelect) {
        providerServiceSelect.addEventListener('change', function() {
            if (this.value === 'أخرى') {
                otherServiceGroup.style.display = 'block';
            } else {
                otherServiceGroup.style.display = 'none';
            }
        });
    }
});

// --- الدوال العامة (تبقى خارج addEventListener) ---

// دالة فتح وإغلاق القائمة المنسدلة
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// دوال فتح وإغلاق النوافذ المنبثقة (Modals)
function openRegisterModal() {
    openModal('registerModal');
}

function openSearchModal() {
    openModal('searchModal');
}

function openOtherServiceModal() {
    openModal('otherServiceModal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// دالة التعامل مع إرسال نموذج تسجيل مقدم الخدمة (النسخة المحسّنة)
function handleSubmit(event, db) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.service === 'أخرى') {
        data.service = data.otherService || 'أخرى';
    }
    delete data.otherService;

    const successAlert = document.getElementById('registerSuccess');
    const errorAlert = document.getElementById('registerError');
    const submitButton = form.querySelector('button[type="submit"]');

    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';

    db.collection('providers').add(data)
        .then(() => {
            console.log("Document successfully written!");
            form.style.display = 'none';
            successAlert.style.display = 'block';

            setTimeout(() => {
                closeModal('registerModal');
                form.reset();
                form.style.display = 'block';
                successAlert.style.display = 'none';
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
            }, 5000);
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
            errorAlert.style.display = 'block';
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
        });
}
