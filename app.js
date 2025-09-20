// إعدادات Firebase
const firebaseConfig = {
    // سيتم إضافة إعدادات Firebase هنا
    apiKey: "AIzaSyBSujjNja7qC_Lamp8DTH-T_O2ia2ZzU0E",
    authDomain: "khidma-5cbbc.firebaseapp.com",
    projectId: "khidma-5cbbc",
    storageBucket: "khidma-5cbbc.firebasestorage.app",
    messagingSenderId: "992721988153",
    appId: "1:992721988153:web:77599e16ea175be6a2bbe8"
  measurementId: "G-PBZ7HSXRJ4"
};

// تهيئة Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.log('Firebase initialization failed:', error);
    // استخدام localStorage كبديل مؤقت
    console.log('Using localStorage as fallback');
}

// متغيرات عامة
let providers = [];
let currentSearchResults = [];

// تحميل البيانات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadProviders();
    setupEventListeners();
    setupFormValidation();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // نموذج التسجيل
    document.getElementById('registerForm').addEventListener('submit', handleProviderRegistration);
    
    // نموذج البحث المتقدم
    document.getElementById('advancedSearchForm').addEventListener('submit', handleAdvancedSearch);
    
    // نموذج البحث عن خدمة أخرى
    document.getElementById('otherServiceSearchForm').addEventListener('submit', handleOtherServiceSearch);
    
    // تغيير نوع الخدمة في نموذج التسجيل
    document.getElementById('providerService').addEventListener('change', function() {
        const otherGroup = document.getElementById('otherServiceGroup');
        if (this.value === 'أخرى') {
            otherGroup.style.display = 'block';
            document.getElementById('otherService').required = true;
        } else {
            otherGroup.style.display = 'none';
            document.getElementById('otherService').required = false;
        }
    });
    
    // البحث الرئيسي
    document.getElementById('mainSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // إغلاق النماذج عند النقر خارجها
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// إعداد التحقق من صحة النماذج
function setupFormValidation() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            // التحقق من صحة رقم الهاتف السعودي
            const phoneRegex = /^(\+966|0)?[5][0-9]{8}$/;
            if (this.value && !phoneRegex.test(this.value)) {
                this.setCustomValidity('يرجى إدخال رقم هاتف سعودي صحيح');
            } else {
                this.setCustomValidity('');
            }
        });
    });
}

// تبديل القائمة في الهواتف المحمولة
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// فتح نموذج التسجيل
function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// فتح نموذج البحث
function openSearchModal() {
    document.getElementById('searchModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// فتح نموذج خدمة أخرى
function openOtherServiceModal() {
    document.getElementById('otherServiceModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// إغلاق النموذج
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // إخفاء رسائل التنبيه
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => alert.style.display = 'none');
}

// تسجيل مقدم خدمة جديد
async function handleProviderRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const providerData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        service: formData.get('service') === 'أخرى' ? formData.get('otherService') : formData.get('service'),
        city: formData.get('city'),
        description: formData.get('description'),
        experience: parseInt(formData.get('experience')) || 0,
        registrationDate: new Date().toISOString(),
        approved: false,
        id: generateId()
    };
    
    try {
        await saveProvider(providerData);
        showAlert('registerSuccess');
        e.target.reset();
        
        // إرسال إشعار للمدير (يمكن تطويره لاحقاً)
        console.log('New provider registered:', providerData);
        
        setTimeout(() => {
            closeModal('registerModal');
        }, 2000);
        
    } catch (error) {
        console.error('Error registering provider:', error);
        showAlert('registerError');
    }
}

// حفظ مقدم الخدمة
async function saveProvider(providerData) {
    if (db) {
        // حفظ في Firebase
        await db.collection('providers').doc(providerData.id).set(providerData);
    } else {
        // حفظ في localStorage كبديل
        const providers = JSON.parse(localStorage.getItem('providers') || '[]');
        providers.push(providerData);
        localStorage.setItem('providers', JSON.stringify(providers));
    }
}

// تحميل مقدمي الخدمات
async function loadProviders() {
    try {
        if (db) {
            // تحميل من Firebase
            const snapshot = await db.collection('providers').where('approved', '==', true).get();
            providers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            // تحميل من localStorage
            providers = JSON.parse(localStorage.getItem('providers') || '[]')
                .filter(provider => provider.approved);
        }
        
        console.log('Providers loaded:', providers.length);
    } catch (error) {
        console.error('Error loading providers:', error);
        // إضافة بيانات تجريبية في حالة الخطأ
        providers = getSampleProviders();
    }
}

// البحث الرئيسي
function performSearch() {
    const searchTerm = document.getElementById('mainSearch').value.trim();
    if (searchTerm) {
        searchProviders({ keyword: searchTerm });
    }
}

// البحث المتقدم
function handleAdvancedSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchCriteria = {
        service: formData.get('service'),
        city: formData.get('city'),
        keyword: formData.get('keyword')
    };
    
    searchProviders(searchCriteria);
    closeModal('searchModal');
}

// البحث عن خدمة أخرى
function handleOtherServiceSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchCriteria = {
        service: formData.get('customService'),
        city: formData.get('city')
    };
    
    searchProviders(searchCriteria);
    closeModal('otherServiceModal');
}

// البحث حسب الفئة
function searchByCategory(category) {
    searchProviders({ service: category });
}

// البحث في مقدمي الخدمات
function searchProviders(criteria) {
    showLoading(true);
    
    // تصفية النتائج
    currentSearchResults = providers.filter(provider => {
        let matches = true;
        
        if (criteria.service && criteria.service !== '') {
            matches = matches && provider.service.toLowerCase().includes(criteria.service.toLowerCase());
        }
        
        if (criteria.city && criteria.city !== '') {
            matches = matches && provider.city.toLowerCase().includes(criteria.city.toLowerCase());
        }
        
        if (criteria.keyword && criteria.keyword !== '') {
            const keyword = criteria.keyword.toLowerCase();
            matches = matches && (
                provider.name.toLowerCase().includes(keyword) ||
                provider.service.toLowerCase().includes(keyword) ||
                provider.description.toLowerCase().includes(keyword) ||
                provider.city.toLowerCase().includes(keyword)
            );
        }
        
        return matches;
    });
    
    // عرض النتائج بعد تأخير قصير لمحاكاة التحميل
    setTimeout(() => {
        showLoading(false);
        displaySearchResults();
        
        // التمرير إلى قسم النتائج
        document.getElementById('searchResults').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }, 1000);
}

// عرض نتائج البحث
function displaySearchResults() {
    const resultsSection = document.getElementById('searchResults');
    const providersList = document.getElementById('providersList');
    
    resultsSection.style.display = 'block';
    
    if (currentSearchResults.length === 0) {
        providersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>لم يتم العثور على نتائج</h3>
                <p>جرب البحث بكلمات مختلفة أو تصفح جميع الخدمات</p>
            </div>
        `;
        return;
    }
    
    providersList.innerHTML = currentSearchResults.map(provider => `
        <div class="provider-card fade-in">
            <div class="provider-info">
                <h3>${provider.name}</h3>
                <p><i class="fas fa-briefcase"></i> ${provider.service}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${provider.city}</p>
                <p><i class="fas fa-clock"></i> ${provider.experience} سنوات خبرة</p>
                ${provider.description ? `<p><i class="fas fa-info-circle"></i> ${provider.description}</p>` : ''}
            </div>
            <div class="provider-actions">
                <button class="btn btn-call" onclick="callProvider('${provider.phone}')">
                    <i class="fas fa-phone"></i> اتصال
                </button>
                <button class="btn btn-whatsapp" onclick="whatsappProvider('${provider.phone}', '${provider.name}')">
                    <i class="fab fa-whatsapp"></i> واتساب
                </button>
                <button class="btn btn-secondary" onclick="shareProvider(${JSON.stringify(provider).replace(/"/g, '&quot;')})">
                    <i class="fas fa-share-alt"></i> مشاركة
                </button>
            </div>
        </div>
    `).join('');
}

// الاتصال بمقدم الخدمة
function callProvider(phone) {
    // تنسيق رقم الهاتف
    const formattedPhone = formatPhoneNumber(phone);
    
    // التحقق من دعم الجهاز للمكالمات
    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
        // على الأجهزة المحمولة
        window.location.href = `tel:${formattedPhone}`;
    } else {
        // على أجهزة سطح المكتب
        if (confirm(`هل تريد الاتصال بالرقم: ${phone}؟`)) {
            // محاولة فتح تطبيق الاتصال إذا كان متاحاً
            try {
                window.open(`tel:${formattedPhone}`, '_self');
            } catch (error) {
                // نسخ الرقم إلى الحافظة كبديل
                copyToClipboard(phone);
                alert(`تم نسخ الرقم إلى الحافظة: ${phone}`);
            }
        }
    }
    
    // تسجيل إحصائية الاتصال
    logContactAction('call', phone);
}

// التواصل عبر الواتساب
function whatsappProvider(phone, name) {
    const formattedPhone = formatPhoneNumber(phone);
    const message = encodeURIComponent(`مرحباً ${name}، أود الاستفسار عن خدماتكم من خلال منصة خدمة.

الخدمة المطلوبة: [يرجى تحديد نوع الخدمة]
الموقع: [يرجى تحديد الموقع]
الوقت المناسب: [يرجى تحديد الوقت المناسب]

شكراً لكم.`);
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    // فتح الواتساب في نافذة جديدة
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    
    // التحقق من فتح النافذة بنجاح
    setTimeout(() => {
        if (!whatsappWindow || whatsappWindow.closed) {
            // إذا فشل فتح الواتساب، عرض رسالة بديلة
            showWhatsappFallback(phone, name);
        }
    }, 1000);
    
    // تسجيل إحصائية الواتساب
    logContactAction('whatsapp', phone);
}

// عرض بديل للواتساب في حالة الفشل
function showWhatsappFallback(phone, name) {
    const fallbackModal = document.createElement('div');
    fallbackModal.className = 'modal';
    fallbackModal.style.display = 'block';
    fallbackModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>التواصل عبر الواتساب</h3>
            <p>يمكنك التواصل مع <strong>${name}</strong> عبر الواتساب:</p>
            <div style="margin: 20px 0;">
                <p><strong>رقم الهاتف:</strong> ${phone}</p>
                <button class="btn btn-primary" onclick="copyToClipboard('${phone}'); alert('تم نسخ الرقم!');">
                    <i class="fas fa-copy"></i> نسخ الرقم
                </button>
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                أو ابحث عن الرقم في تطبيق الواتساب مباشرة
            </p>
        </div>
    `;
    document.body.appendChild(fallbackModal);
}

// نسخ النص إلى الحافظة
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // استخدام Clipboard API الحديث
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        // استخدام الطريقة التقليدية
        fallbackCopyToClipboard(text);
    }
}

// طريقة بديلة لنسخ النص
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('Text copied using fallback method');
    } catch (err) {
        console.error('Fallback copy failed: ', err);
    }
    
    document.body.removeChild(textArea);
}

// تسجيل إحصائيات التواصل
function logContactAction(action, phone) {
    const contactLog = {
        action: action, // 'call' أو 'whatsapp'
        phone: phone,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
    };
    
    // حفظ في localStorage للإحصائيات
    const logs = JSON.parse(localStorage.getItem('contactLogs') || '[]');
    logs.push(contactLog);
    
    // الاحتفاظ بآخر 1000 سجل فقط
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('contactLogs', JSON.stringify(logs));
    
    // إرسال إلى Firebase إذا كان متاحاً
    if (db) {
        try {
            db.collection('contactLogs').add(contactLog);
        } catch (error) {
            console.error('Error logging contact action:', error);
        }
    }
}

// إضافة أزرار مشاركة إضافية
function shareProvider(provider) {
    const shareData = {
        title: `${provider.name} - ${provider.service}`,
        text: `تواصل مع ${provider.name} لخدمات ${provider.service} في ${provider.city}`,
        url: window.location.href
    };
    
    if (navigator.share) {
        // استخدام Web Share API إذا كان متاحاً
        navigator.share(shareData).then(() => {
            console.log('Provider shared successfully');
        }).catch(err => {
            console.error('Error sharing provider:', err);
            showShareFallback(provider);
        });
    } else {
        showShareFallback(provider);
    }
}

// عرض خيارات المشاركة البديلة
function showShareFallback(provider) {
    const shareModal = document.createElement('div');
    shareModal.className = 'modal';
    shareModal.style.display = 'block';
    shareModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>مشاركة مقدم الخدمة</h3>
            <p><strong>${provider.name}</strong> - ${provider.service}</p>
            <div style="display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="shareViaWhatsApp('${provider.name}', '${provider.service}', '${provider.phone}')">
                    <i class="fab fa-whatsapp"></i> واتساب
                </button>
                <button class="btn btn-secondary" onclick="shareViaTelegram('${provider.name}', '${provider.service}', '${provider.phone}')">
                    <i class="fab fa-telegram"></i> تيليجرام
                </button>
                <button class="btn btn-secondary" onclick="copyProviderInfo('${provider.name}', '${provider.service}', '${provider.phone}', '${provider.city}')">
                    <i class="fas fa-copy"></i> نسخ المعلومات
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(shareModal);
}

// مشاركة عبر الواتساب
function shareViaWhatsApp(name, service, phone) {
    const message = encodeURIComponent(`أنصحك بالتواصل مع ${name} لخدمات ${service}
رقم الهاتف: ${phone}
من خلال منصة خدمة`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

// مشاركة عبر التيليجرام
function shareViaTelegram(name, service, phone) {
    const message = encodeURIComponent(`أنصحك بالتواصل مع ${name} لخدمات ${service}
رقم الهاتف: ${phone}
من خلال منصة خدمة`);
    window.open(`https://t.me/share/url?text=${message}`, '_blank');
}

// نسخ معلومات مقدم الخدمة
function copyProviderInfo(name, service, phone, city) {
    const info = `${name}
الخدمة: ${service}
المدينة: ${city}
الهاتف: ${phone}
من منصة خدمة`;
    
    copyToClipboard(info);
    alert('تم نسخ معلومات مقدم الخدمة!');
}

// تنسيق رقم الهاتف
function formatPhoneNumber(phone) {
    // إزالة المسافات والرموز الخاصة
    let cleaned = phone.replace(/\D/g, '');
    
    // إضافة رمز الدولة إذا لم يكن موجوداً
    if (cleaned.startsWith('05')) {
        cleaned = '966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5')) {
        cleaned = '966' + cleaned;
    } else if (!cleaned.startsWith('966')) {
        cleaned = '966' + cleaned;
    }
    
    return cleaned;
}

// عرض/إخفاء مؤشر التحميل
function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}

// عرض رسالة تنبيه
function showAlert(alertId) {
    const alert = document.getElementById(alertId);
    alert.style.display = 'block';
    
    // إخفاء الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// توليد معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// بيانات تجريبية لمقدمي الخدمات
function getSampleProviders() {
    return [
        {
            id: 'sample1',
            name: 'أحمد محمد',
            phone: '0501234567',
            service: 'بناء',
            city: 'الرياض',
            description: 'مقاول بناء متخصص في المشاريع السكنية والتجارية',
            experience: 10,
            approved: true,
            registrationDate: new Date().toISOString()
        },
        {
            id: 'sample2',
            name: 'محمد علي',
            phone: '0507654321',
            service: 'كهرباء',
            city: 'جدة',
            description: 'فني كهربائي معتمد لجميع أعمال الكهرباء المنزلية والتجارية',
            experience: 8,
            approved: true,
            registrationDate: new Date().toISOString()
        },
        {
            id: 'sample3',
            name: 'عبدالله أحمد',
            phone: '0509876543',
            service: 'سباكة',
            city: 'الدمام',
            description: 'سباك محترف لحل جميع مشاكل السباكة والصرف الصحي',
            experience: 12,
            approved: true,
            registrationDate: new Date().toISOString()
        },
        {
            id: 'sample4',
            name: 'سعد محمد',
            phone: '0503456789',
            service: 'ميكانيكا',
            city: 'الرياض',
            description: 'ميكانيكي سيارات متخصص في جميع أنواع السيارات',
            experience: 15,
            approved: true,
            registrationDate: new Date().toISOString()
        },
        {
            id: 'sample5',
            name: 'خالد عبدالرحمن',
            phone: '0506789012',
            service: 'نجارة',
            city: 'مكة المكرمة',
            description: 'نجار ماهر في صناعة وإصلاح الأثاث الخشبي',
            experience: 7,
            approved: true,
            registrationDate: new Date().toISOString()
        }
    ];
}

// وظائف إدارية (للمدير)
const AdminPanel = {
    // عرض جميع مقدمي الخدمات المسجلين
    async getAllProviders() {
        try {
            if (db) {
                const snapshot = await db.collection('providers').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                return JSON.parse(localStorage.getItem('providers') || '[]');
            }
        } catch (error) {
            console.error('Error getting providers:', error);
            return [];
        }
    },
    
    // الموافقة على مقدم خدمة
    async approveProvider(providerId) {
        try {
            if (db) {
                await db.collection('providers').doc(providerId).update({ approved: true });
            } else {
                const providers = JSON.parse(localStorage.getItem('providers') || '[]');
                const providerIndex = providers.findIndex(p => p.id === providerId);
                if (providerIndex !== -1) {
                    providers[providerIndex].approved = true;
                    localStorage.setItem('providers', JSON.stringify(providers));
                }
            }
            console.log('Provider approved:', providerId);
        } catch (error) {
            console.error('Error approving provider:', error);
        }
    },
    
    // رفض مقدم خدمة
    async rejectProvider(providerId) {
        try {
            if (db) {
                await db.collection('providers').doc(providerId).delete();
            } else {
                const providers = JSON.parse(localStorage.getItem('providers') || '[]');
                const filteredProviders = providers.filter(p => p.id !== providerId);
                localStorage.setItem('providers', JSON.stringify(filteredProviders));
            }
            console.log('Provider rejected:', providerId);
        } catch (error) {
            console.error('Error rejecting provider:', error);
        }
    }
};

// تصدير وظائف الإدارة للوصول إليها من وحدة التحكم
window.AdminPanel = AdminPanel;

// تحديث البيانات كل 5 دقائق
setInterval(loadProviders, 5 * 60 * 1000);

// إضافة بيانات تجريبية إذا لم تكن موجودة
if (!localStorage.getItem('providers')) {
    const sampleProviders = getSampleProviders();
    localStorage.setItem('providers', JSON.stringify(sampleProviders));
    providers = sampleProviders;
}
console.log('services platform App;initialized successfully');
}

