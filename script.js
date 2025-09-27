// ==================================================================
//  ملف script.js - النسخة النهائية والمُجمعة
// ==================================================================

// --- 1. تهيئة Supabase (دائمًا في الأعلى) ---
const supabaseUrl = 'https://lzrzyjkzutlpwlxfnpxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6cnp5amt6dXRscHdseGZucHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTg2MDEsImV4cCI6MjA3NDUzNDYwMX0.3X9SVBgVSdaceVcTEIMPHznIHVqNfTk4yJRrBhtzKVo';
// *** الإصلاح الأول: يجب استخدام supabase.createClient ***
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


// ==================================================================
// --- 2. تعريف الدوال العامة التي يتم استدعاؤها من HTML (onclick) ---
// ==================================================================

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

// --- دوال مساعدة لفتح نوافذ معينة ---
function openRegisterModal() {
    openModal('registerModal');
}

function openSearchModal() {
    openModal('searchModal');
}


// ==================================================================
// --- 3. الكود الذي يعمل بعد تحميل الصفحة بالكامل (باستخدام addEventListener) ---
// ==================================================================
document.addEventListener('DOMContentLoaded', function() {

    // *** الإصلاح الثاني: كل الكود التالي يجب أن يكون داخل هذا القوس ***

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // امنع الإرسال الافتراضي للنموذج

            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = 'جاري التسجيل...';

            // عرض رسائل التنبيه
            const registerSuccessAlert = document.getElementById('registerSuccess');
            const registerErrorAlert = document.getElementById('registerError');
            registerSuccessAlert.style.display = 'none';
            registerErrorAlert.style.display = 'none';

            // جمع البيانات من النموذج
            const serviceSelect = document.getElementById('providerService');
            const serviceValue = serviceSelect.value === 'أخرى' ? document.getElementById('otherService').value : serviceSelect.value;

            const providerData = {
                name: document.getElementById('providerName').value,
                phone: document.getElementById('providerPhone').value,
                service: serviceValue,
                city: document.getElementById('providerCity').value,
                description: document.getElementById('providerDescription').value,
                years_experience: document.getElementById('providerExperience').value,
                is_approved: false
            };

            // إرسال البيانات إلى Supabase
            const { data, error } = await supabase
                .from('providers')
                .insert([providerData]);

            if (error) {
                console.error('Supabase error:', error.message);
                registerErrorAlert.textContent = 'حدث خطأ أثناء التسجيل: ' + error.message;
                registerErrorAlert.style.display = 'block';
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            } else {
                console.log('Supabase success:', data);
                registerSuccessAlert.style.display = 'block';
                registerForm.reset();
                setTimeout(() => {
                    closeModal('registerModal');
                    registerSuccessAlert.style.display = 'none';
                }, 3000);
                submitButton.disabled = false;
                submitButton.innerHTML = 'تم التسجيل بنجاح!';
            }
        });
    } // --- نهاية if (registerForm) ---

    // يمكنك إضافة أي كود آخر يستخدم addEventListener هنا في المستقبل

}); // --- *** نهاية document.addEventListener *** ---
