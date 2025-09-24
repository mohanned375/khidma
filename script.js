// ==================================================================
//  ملف script.js الكامل والنهائي
//  يجمع كل الوظائف المطلوبة مع التركيز على الاستقرار
// ==================================================================

// --- 1. الدوال العامة التي يتم استدعاؤها مباشرة من HTML ---
// يتم وضعها في النطاق العام (Global Scope) لتكون متاحة لـ onclick

function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
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

// --- 2. الكود الرئيسي الذي يعمل بعد تحميل الصفحة بالكامل ---
// هذا يضمن أن جميع عناصر HTML موجودة وجاهزة

document.addEventListener('DOMContentLoaded', function() {

    // --- تهيئة Firebase ---
    // هام: تأكد من أن هذه البيانات موجودة وصحيحة
const firebaseConfig = {
  apiKey: "AIzaSyBSujjNja7qC_Lamp8DTH-T_O2ia2ZzU0E", // استبدل هذا
  authDomain: "khidma-5cbbc.firebaseapp.com", // استبدل هذا
  projectId: "khidma-5cbbc", // استبدل هذا
  storageBucket: "khidma-5cbbc.firebasestorage.app", // استبدل هذا
  messagingSenderId: "992721988153", // استبدل هذا
  appId: "1:992721988153:web:77599e16ea175be6a2bbe8" // استبدل هذا
};
    // تهيئة Firebase وإنشاء اتصال بقاعدة البيانات
    try {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        console.log("Firebase Initialized Successfully.");

        // --- ربط نموذج التسجيل ---
        // يتم الربط هنا بالداخل لضمان وجود 'db'
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleSubmit(db); // تمرير 'db' إلى الدالة
            });
        } else {
            console.error("Error: Register form not found.");
        }

        // --- ربط نماذج البحث ---
        // (يمكن إضافة وظائف البحث هنا لاحقًا بنفس الطريقة)

    } catch (error) {
        console.error("Firebase Initialization Failed: ", error);
        alert("فشل الاتصال بقاعدة البيانات. يرجى التحقق من معلومات التهيئة والمكتبات.");
    }

    // --- ربط حقل "نوع الخدمة" في نموذج التسجيل ---
    const providerServiceSelect = document.getElementById('providerService');
    const otherServiceGroup = document.getElementById('otherServiceGroup');
    if (providerServiceSelect && otherServiceGroup) {
        providerServiceSelect.addEventListener('change', function() {
            otherServiceGroup.style.display = (this.value === 'أخرى') ? 'block' : 'none';
        });
    }
});


// --- 3. دالة إرسال بيانات التسجيل (handleSubmit) ---
// هذه الدالة يتم استدعاؤها من داخل المستمع أعلاه

function handleSubmit(db) {
    const form = document.getElementById('registerForm');
    const successAlert = document.getElementById('registerSuccess');
    const errorAlert = document.getElementById('registerError');
    const submitButton = form.querySelector('button[type="submit"]');

    // التحقق من وجود قاعدة البيانات قبل المتابعة
    if (!db) {
        console.error("Database connection is not available.");
        if (errorAlert) errorAlert.style.display = 'block';
        return;
    }

    // تعطيل الزر وإظهار مؤشر التحميل
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
    if (successAlert) successAlert.style.display = 'none';
    if (errorAlert) errorAlert.style.display = 'none';

    // تجميع البيانات من النموذج
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

    // إرسال البيانات إلى Firebase
    db.collection('providers').add(providerData)
        .then(() => {
            // عند النجاح
            console.log("Data sent successfully!");
            if (form) form.style.display = 'none';
            if (successAlert) successAlert.style.display = 'block';

            // إعادة النموذج لحالته الطبيعية بعد 3 ثوانٍ
            setTimeout(() => {
                closeModal('registerModal');
                if (form) {
                    form.reset();
                    form.style.display = 'block';
                }
                if (successAlert) successAlert.style.display = 'none';
                const otherServiceGroup = document.getElementById('otherServiceGroup');
                if (otherServiceGroup) otherServiceGroup.style.display = 'none';
                
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
            }, 3000);
        })
        .catch((error) => {
            // عند الفشل
            console.error("Error writing document: ", error);
            if (errorAlert) errorAlert.style.display = 'block';
            
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
        });
}
