// ==================================================================
//  ملف script.js - نسخة معدلة لفصل المسؤوليات
// ==================================================================

// --- 1. الدوال العامة التي يتم استدعاؤها مباشرة من HTML ---
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) navMenu.classList.toggle('active');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// --- 2. الكود الرئيسي الذي يعمل بعد تحميل الصفحة بالكامل ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("Page loaded. Initializing scripts...");

    // --- تهيئة Firebase وإنشاء الاتصال ---
    let db; // تعريف متغير قاعدة البيانات هنا
    try {
const firebaseConfig = {
  apiKey: "AIzaSyBSujjNja7qC_Lamp8DTH-T_O2ia2ZzU0E", // استبدل هذا
  authDomain: "khidma-5cbbc.firebaseapp.com", // استبدل هذا
  projectId: "khidma-5cbbc", // استبدل هذا
  storageBucket: "khidma-5cbbc.firebasestorage.app", // استبدل هذا
  messagingSenderId: "992721988153", // استبدل هذا
  appId: "1:992721988153:web:77599e16ea175be6a2bbe8" // استبدل هذا
};
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore(); // إسناد القيمة للمتغير
        console.log("Firebase Initialized Successfully.");
    } catch (error) {
        console.error("Firebase Initialization Failed: ", error);
        // لا توقف الكود، فقط اعرض رسالة تحذير
    }

    // --- ربط نموذج التسجيل (يعمل بشكل مستقل الآن) ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // التحقق من وجود 'db' قبل استدعاء الدالة
            if (db) {
                handleSubmit(db);
            } else {
                console.error("Cannot submit form: Database connection is not available.");
                alert("فشل الاتصال بقاعدة البيانات. لا يمكن إرسال النموذج.");
            }
        });
    } else {
        console.error("Error: Register form not found.");
    }

    // --- ربط حقل "نوع الخدمة" (يعمل بشكل مستقل) ---
    const providerServiceSelect = document.getElementById('providerService');
    const otherServiceGroup = document.getElementById('otherServiceGroup');
    if (providerServiceSelect && otherServiceGroup) {
        providerServiceSelect.addEventListener('change', function() {
            otherServiceGroup.style.display = (this.value === 'أخرى') ? 'block' : 'none';
        });
    }
});


// --- 3. دالة إرسال بيانات التسجيل (handleSubmit) ---
// (تبقى كما هي، لأنها تعتمد على 'db' التي يتم تمريرها)
function handleSubmit(db) {
    const form = document.getElementById('registerForm');
    const successAlert = document.getElementById('registerSuccess');
    const errorAlert = document.getElementById('registerError');
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';

    const serviceSelect = document.getElementById('providerService');
    const serviceValue = serviceSelect.value === 'أخرى' ? document.getElementById('otherService').value : serviceSelect.value;
    
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

    db.collection('providers').add(providerData)
        .then(() => {
            console.log("Data sent successfully!");
            form.style.display = 'none';
            successAlert.style.display = 'block';

            setTimeout(() => {
                closeModal('registerModal');
                form.reset();
                form.style.display = 'block';
                successAlert.style.display = 'none';
                document.getElementById('otherServiceGroup').style.display = 'none';
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
            }, 3000);
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
            errorAlert.style.display = 'block';
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
        });
}
