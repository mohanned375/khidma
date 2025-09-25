// ==================================================================
//  ملف script.js - النسخة النهائية والمُجمعة
//  بناءً على كل ما تم اكتشافه ومعالجته.
// ==================================================================

// --- 1. الدوال العامة (Global Scope) ---
// هذه الدوال يجب أن تبقى هنا ليتم استدعاؤها عبر 'onclick' في HTML.

/**
 * تبديل عرض القائمة المنسدلة على الهواتف.
 */
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    } else {
        console.error("Error: Element with id 'navMenu' not found.");
    }
}

/**
 * تفتح أي نافذة منبثقة (modal) بناءً على الـ id الخاص بها.
 * @param {string} modalId - الـ id الخاص بالنافذة المطلوب فتحها.
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // استخدام flex لتوسيط المحتوى
    } else {
        console.error("Error: Modal with id '" + modalId + "' not found.");
    }
}

/**
 * تغلق أي نافذة منبثقة (modal) بناءً على الـ id الخاص بها.
 * @param {string} modalId - الـ id الخاص بالنافذة المطلوب إغلاقها.
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    } else {
        console.error("Error: Modal with id '" + modalId + "' not found.");
    }
}

// --- دوال مساعدة لفتح نوافذ معينة (للحفاظ على نظافة HTML) ---
function openRegisterModal() {
    openModal('registerModal');
}

function openSearchModal() {
    openModal('searchModal');
}

// --- 2. الكود الرئيسي الذي يعمل بعد تحميل الصفحة بالكامل ---
// نستخدم 'DOMContentLoaded' لضمان أن كل عناصر HTML قد تم تحميلها.
document.addEventListener('DOMContentLoaded', function() {

    let db; // تعريف متغير قاعدة البيانات ليكون متاحًا في هذا النطاق

    // --- تهيئة Firebase (الجزء الأكثر حساسية) ---
    try {
        // تأكد من أن هذه المعلومات مطابقة تمامًا لما هو في مشروعك على Firebase
        <script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyD07eyfujC_p1PCn_4c4jd8r8ilZ5vbSu4",
    authDomain: "khidma2-a4a3b.firebaseapp.com",
    projectId: "khidma2-a4a3b",
    storageBucket: "khidma2-a4a3b.firebasestorage.app",
    messagingSenderId: "617281495445",
    appId: "1:617281495445:web:d0dd353f7c065ef763169c",
    measurementId: "G-QQYLJTSFKL"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
        // الحصول على اتصال بقاعدة بيانات Firestore
        db = firebase.firestore();

    } catch (error) {
        console.error("فشل كارثي في تهيئة Firebase: ", error);
        alert("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقًا.");
    }

    // --- ربط نموذج التسجيل ---
    // هذا الكود يربط زر "تسجيل" الداخلي بالدالة التي ترسل البيانات.
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // منع تحديث الصفحة عند الإرسال
            
            // التحقق من أن اتصال قاعدة البيانات قد تم بنجاح قبل الإرسال
            if (db) {
                handleSubmit(db);
            } else {
                alert("خطأ في الاتصال بقاعدة البيانات. لا يمكن إرسال النموذج.");
            }
        });
    } else {
        console.error("خطأ فادح: نموذج التسجيل 'registerForm' غير موجود.");
    }

    // --- ربط قائمة اختيار الخدمة لإظهار حقل "أخرى" ---
    const providerServiceSelect = document.getElementById('providerService');
    const otherServiceGroup = document.getElementById('otherServiceGroup');
    if (providerServiceSelect && otherServiceGroup) {
        providerServiceSelect.addEventListener('change', function() {
            otherServiceGroup.style.display = (this.value === 'أخرى') ? 'block' : 'none';
        });
    }

}); // نهاية 'DOMContentLoaded'


// --- 3. دالة إرسال بيانات التسجيل (handleSubmit) ---
// هذه الدالة تقوم بالعمل الفعلي: جمع البيانات وإرسالها إلى Firebase.
function handleSubmit(db) {
    const form = document.getElementById('registerForm');
    const successAlert = document.getElementById('registerSuccess');
    const errorAlert = document.getElementById('registerError');
    const submitButton = form.querySelector('button[type="submit"]');

    // تعطيل الزر وعرض "جاري التسجيل..."
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
    
    const serviceSelect = document.getElementById('providerService');
    const serviceValue = serviceSelect.value === 'أخرى' ? document.getElementById('otherService').value : serviceSelect.value;
    
    // تجميع بيانات النموذج في كائن واحد
    const providerData = {
        name: document.getElementById('providerName').value,
        phone: document.getElementById('providerPhone').value,
        service: serviceValue,
        city: document.getElementById('providerCity').value,
        description: document.getElementById('providerDescription').value,
        experience: document.getElementById('providerExperience').value,
        approved: false,
        // استخدام طريقة الوقت المتوافقة مع الإصدار 7
        timestamp: firebase.firestore.Timestamp.now()
    };

    // إرسال البيانات إلى مجموعة 'providers' في Firestore
    db.collection('providers').add(providerData)
        .then(() => {
            // في حالة النجاح
            form.style.display = 'none'; // إخفاء النموذج
            successAlert.style.display = 'block'; // إظهار رسالة "تم التسجيل بنجاح"

            // بعد 3 ثوانٍ، قم بإغلاق النافذة وإعادة كل شيء لوضعه الطبيعي
            setTimeout(() => {
                closeModal('registerModal');
                form.reset(); // مسح بيانات النموذج
                form.style.display = 'block'; // إعادة إظهار النموذج للمرة القادمة
                successAlert.style.display = 'none'; // إخفاء رسالة النجاح
                submitButton.disabled = false; // إعادة تفعيل الزر
                submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
            }, 3000);
        })
        .catch((error) => {
            // في حالة الفشل
            console.error("خطأ أثناء الكتابة في قاعدة البيانات: ", error);
            errorAlert.style.display = 'block'; // إظهار رسالة الخطأ
            
            // إعادة تفعيل الزر للسماح للمستخدم بالمحاولة مرة أخرى
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
        });
}
