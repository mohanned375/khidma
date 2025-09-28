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

    // --- هذا هو السطر الجديد الذي سيحل المشكلة ---
    // ابحث عن زر التسجيل وأعده إلى حالته الأصلية
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const submitButton = registerForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل'; // أعد النص والأيقونة
        }
        registerForm.reset(); // قم بإفراغ الحقول أيضًا
    }
}


function openSearchModal() {
    openModal('searchModal');
}


// ==================================================================
// --- 3. الكود الذي يعمل بعد تحميل الصفحة بالكامل (مستمع واحد فقط) ---
// ==================================================================
document.addEventListener('DOMContentLoaded', function() {

    // --- الربط مع نموذج التسجيل ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = 'جاري التسجيل...';

            const registerSuccessAlert = document.getElementById('registerSuccess');
            const registerErrorAlert = document.getElementById('registerError');
            registerSuccessAlert.style.display = 'none';
            registerErrorAlert.style.display = 'none';

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
                // لا تقم بتعطيل الزر هنا، سيتم إعادة تعيينه عند فتح النموذج مرة أخرى
            }
        });
    }

    // --- الربط مع حقل "خدمة أخرى" في نموذج التسجيل ---
    const providerServiceSelect = document.getElementById('providerService');
    const otherServiceGroup = document.getElementById('otherServiceGroup');
    if (providerServiceSelect && otherServiceGroup) {
        providerServiceSelect.addEventListener('change', function() {
            otherServiceGroup.style.display = (this.value === 'أخرى') ? 'block' : 'none';
        });
    }

    // --- الربط مع عناصر HTML الخاصة بالبحث ---
    const mainSearchInput = document.getElementById('mainSearch');
    const mainSearchButton = document.querySelector('.search-container .search-btn');
    const advancedSearchForm = document.getElementById('advancedSearchForm');
    const otherServiceSearchForm = document.getElementById('otherServiceSearchForm');

    if (mainSearchButton && mainSearchInput) {
        mainSearchButton.addEventListener('click', () => performSearch(mainSearchInput.value));
    }
    if (advancedSearchForm) {
        advancedSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const filters = {
                service: document.getElementById('searchService').value,
                city: document.getElementById('searchCity').value.trim()
            };
            searchProviders(filters);
            closeModal('searchModal');
        });
    }
    if (otherServiceSearchForm) {
        otherServiceSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const filters = {
                keyword: document.getElementById('customService').value.trim(),
                city: document.getElementById('customCity').value.trim()
            };
            searchProviders(filters);
            closeModal('otherServiceModal');
        });
    }

}); // --- *** نهاية document.addEventListener الوحيد *** ---


// ==================================================================
// --- 4. وظائف البحث (تبقى خارج addEventListener) ---
// ==================================================================

function performSearch(query) {
    if (query && query.trim()) {
        searchProviders({ keyword: query.trim() });
    }
}

function searchByCategory(category) {
    searchProviders({ service: category });
}

async function searchProviders(filters) {
    const searchResultsSection = document.getElementById('searchResults');
    const providersList = document.getElementById('providersList');
    const loadingIndicator = document.getElementById('loading');

    if (!searchResultsSection || !providersList || !loadingIndicator) {
        console.error("خطأ: عناصر عرض نتائج البحث غير موجودة.");
        return;
    }

    searchResultsSection.style.display = 'block';
    loadingIndicator.style.display = 'block';
    providersList.innerHTML = '';
    window.scrollTo({ top: searchResultsSection.offsetTop, behavior: 'smooth' });

    let query = supabase
        .from('providers')
        .select('*')
        .eq('is_approved', true);

    if (filters.service) {
        query = query.eq('service', filters.service);
    }
    if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.keyword) {
        query = query.or(`name.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%,service.ilike.%${filters.keyword}%`);
    }

    const { data, error } = await query;

    loadingIndicator.style.display = 'none';

    if (error) {
        console.error('Supabase search error:', error.message);
        providersList.innerHTML = '<p class="error-message">حدث خطأ أثناء البحث.</p>';
    } else {
        displayResults(data); // استدعاء دالة العرض
    }
}

function displayResults(results) {
    const providersList = document.getElementById('providersList');
    if (!providersList) {
        console.error("Element with id 'providersList' not found.");
        return;
    }

    if (!results || results.length === 0) {
        providersList.innerHTML = '<p>لا توجد نتائج تطابق بحثك.</p>';
        return;
    }

    let content = '';
    results.forEach(provider => {
        content += `
            <div class="provider-card">
                <h3>${provider.name}</h3>
                <p><strong>الخدمة:</strong> ${provider.service}</p>
                <p><strong>المدينة:</strong> ${provider.city}</p>
                ${provider.years_experience ? `<p><strong>الخبرة:</strong> ${provider.years_experience} سنوات</p>` : ''}
                ${provider.description ? `<p>${provider.description}</p>` : ''}
                <div class="provider-contact">
                    <a href="tel:${provider.phone}" class="btn btn-primary"><i class="fas fa-phone"></i> اتصال</a>
                    <a href="https://wa.me/${String(provider.phone).replace(/\D/g,'')}" target="_blank" class="btn btn-secondary"><i class="fab fa-whatsapp"></i> واتساب</a>
                </div>
            </div>
        `;
    });
    providersList.innerHTML = content;
}


