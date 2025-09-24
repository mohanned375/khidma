// ==================================================================
//  ملف script.js - بناء على الاختبار الناجح
// ==================================================================

// --- 1. الدوال العامة التي تعمل مع onclick ---
// هذه الدوال يجب أن تبقى هنا في النطاق العام

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
// تأكد من وجود هذه الدوال في ملفك
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function openRegisterModal() {
    alert("تم استدعاء دالة openRegisterModal بنجاح!"); // <-- أضف هذا السطر
    openModal('registerModal');
}

function openSearchModal() {
    alert("تم استدعاء دالة openSearchModal بنجاح!"); // <-- أضف هذا السطر
    openModal('searchModal');
}


// --- 2. الكود الرئيسي الذي يعمل بعد تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', function() {

    // --- تهيئة Firebase ---
    // سنضعها في try...catch لمنعها من إيقاف الكود
    let db; 
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
try {
    const testData = { test: "hello", time: new Date() };
    db.collection("testCollection").add(testData)
      .then(() => {
        alert("تمت كتابة testCollection بنجاح 🎉");
      })
      .catch((err) => {
        alert("خطأ في الكتابة: " + err.message);
        console.error(err);
      });
} catch (err) {
    alert("فشل إنشاء testCollection: " + err.message);
              }
        
        db = firebase.firestore();
        console.log("Firebase Initialized Successfully.");
    } catch (error) {
        console.error("Firebase Initialization Failed: ", error);
    }

    // --- ربط نموذج التسجيل (بناءً على اختبارنا الناجح) ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log("Register form found successfully.");
        
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // منع التحديث
            
            // التحقق من وجود اتصال بقاعدة البيانات
            if (db) {
                // إذا كان الاتصال موجودًا، قم بتشغيل دالة الإرسال
                handleSubmit(db);
            } else {
                // إذا فشل الاتصال، اعرض رسالة خطأ
                alert("فشل الاتصال بقاعدة البيانات. لا يمكن إرسال النموذج.");
                console.error("Cannot submit form: Database connection is not available.");
            }
        });
    } else {
        console.error("CRITICAL ERROR: Register form not found on page load.");
    }

    // --- ربط حقل "نوع الخدمة" ---
    const providerServiceSelect = document.getElementById('providerService');
    const otherServiceGroup = document.getElementById('otherServiceGroup');
    if (providerServiceSelect && otherServiceGroup) {
        providerServiceSelect.addEventListener('change', function() {
            otherServiceGroup.style.display = (this.value === 'أخرى') ? 'block' : 'none';
        });
    }
});


// --- 3. دالة إرسال بيانات التسجيل (handleSubmit) ---
// هذه الدالة لن تعمل إلا إذا تم استدعاؤها بنجاح
function handleSubmit(db) {
    const form = document.getElementById('registerForm');
    const successAlert = document.getElementById('registerSuccess');
    const errorAlert = document.getElementById('registerError');
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
    
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
            form.style.display = 'none';
            successAlert.style.display = 'block';
            setTimeout(() => {
                closeModal('registerModal');
                form.reset();
                form.style.display = 'block';
                successAlert.style.display = 'none';
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
