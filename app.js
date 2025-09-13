/* app.js
  - يحوي منطق التطبيق: تخزين/جلب مزودي الخدمة من Realtime Database،
  - تسجيل مقدم جديد، وعرض النتائج، ولوحة الإدارة مع Firebase Auth.
*/

/* ====== 1. UI helpers ====== */
const showSection = id => {
  document.querySelectorAll('.panel').forEach(s => s.style.display = 'none');
  document.getElementById('searchSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'none';
  document.getElementById('adminLoginSection').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('contactSection').style.display = 'none';
  // show requested
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
  window.scrollTo({top:0,behavior:'smooth'});
};

function showSearch(){ showSection('searchSection'); }
function showRegisterForm(){ showSection('registerSection'); }
function showAdminLogin(){ showSection('adminLoginSection'); }
function showServices(){ showSection('searchSection'); }
function showSettings(){ alert('الإعدادات داخلياً متاحة في لوحة الإدارة'); }
function showContactPage(){ showSection('contactSection'); }

/* menu toggle */
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuToggle');
  const menuList = document.getElementById('menuList');
  menuBtn && menuBtn.addEventListener('click', () => menuList.classList.toggle('show'));

  // hook register form
  const regForm = document.getElementById('registerForm');
  regForm && regForm.addEventListener('submit', onRegisterSubmit);

  // admin login
  const adminForm = document.getElementById('adminLoginForm');
  adminForm && adminForm.addEventListener('submit', adminLoginHandler);

  // search input enter
  const searchInput = document.getElementById('searchInput');
  searchInput && searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchServices(); });

  // load default view
  showSearch();
});

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBSujjNja7qC_Lamp8DTH-T_O2ia2ZzU0E",
    authDomain: "khidma-5cbbc.firebaseapp.com",
    databaseURL: "https://khidma-5cbbc-default-rtdb.firebaseio.com",
    projectId: "khidma-5cbbc",
    storageBucket: "khidma-5cbbc.firebasestorage.app",
    messagingSenderId: "992721988153",
    appId: "1:992721988153:web:77599e16ea175be6a2bbe8",
    measurementId: "G-PBZ7HSXRJ4"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
// Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

/* ====== 3. Providers functions ====== */
function onRegisterSubmit(e){
  e && e.preventDefault && e.preventDefault();

  const data = {
    name: (document.getElementById('providerName').value || '').trim(),
    phone: (document.getElementById('providerPhone').value || '').trim(),
    email: (document.getElementById('providerEmail').value || '').trim(),
    category: (document.getElementById('providerCategoryReg').value || 'other'),
    location: (document.getElementById('providerLocation').value || '').trim(),
    experience: parseInt(document.getElementById('providerExperience').value || 0),
    description: (document.getElementById('providerDescription').value || '').trim(),
    whatsapp: (document.getElementById('providerWhats').value || '').trim(),
    status: 'pending',
    rating: 4.0,
    createdAt: Date.now()
  };

  // basic validation
  if(!data.name || !data.phone || !data.location || !data.description){
    alert('يرجى ملء الحقول المطلوبة');
    return;
  }

  // push to realtime db
  const ref = database.ref('providers').push();
  ref.set(data).then(()=>{
    alert('تم إرسال طلب التسجيل! سيتم مراجعته من قبل الإدارة.');
    document.getElementById('registerForm').reset();
    showSearch();
  }).catch(err=>{
    console.error(err);
    alert('حدث خطأ عند التسجيل. حاول لاحقاً.');
  });
}

/* search + display */
function searchServices(){
  const q = (document.getElementById('searchInput').value || '').toLowerCase();
  const cat = document.getElementById('categorySelect').value || '';
  database.ref('providers').orderByChild('status').equalTo('approved').once('value', snap=>{
    const list = [];
    snap.forEach(child=>{
      const v = child.val(); v.id = child.key;
      list.push(v);
    });
    // filter locally by q and category
    let filtered = list;
    if(cat) filtered = filtered.filter(p=>p.category === cat);
    if(q) filtered = filtered.filter(p=>
      (p.name||'').toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q) ||
      (p.location||'').toLowerCase().includes(q)
    );
    displayProviders(filtered);
  });
}

function displayProviders(providers){
  const container = document.getElementById('providersContainer');
  if(!container) return;
  if(!providers || providers.length===0){
    container.innerHTML = '<p style="padding:20px;text-align:center;color:#666">لا توجد خدمات متاحة حالياً.</p>';
    return;
  }
  container.innerHTML = providers.map(p=>{
    const phoneLink = p.phone ? `tel:${p.phone}` : '#';
    const waLink = p.whatsapp ? `https://wa.me/${p.whatsapp.replace(/[^0-9]/g,'')}` : '#';
    return `
      <div class="provider-card">
        <h4>${escapeHtml(p.name)}</h4>
        <div>🎯 ${escapeHtml(p.category)} — 📍 ${escapeHtml(p.location)}</div>
        <div style="margin:6px 0">${escapeHtml(p.description)}</div>
        <div class="provider-actions">
          <a class="contact-btn" href="${phoneLink}" onclick="logContact('${p.id}','call')">📞 اتصال</a>
          <a class="contact-btn" style="background:#34b7f1" href="${waLink}" target="_blank" onclick="logContact('${p.id}','whatsapp')">💬 واتساب</a>
        </div>
      </div>
    `;
  }).join('');
}

/* log contact actions */
function logContact(providerId, method){
  const entry = { providerId, method, ts: Date.now() };
  database.ref('actions').push(entry);
}

/* escape html */
function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* ====== 4. ADMIN: auth + management ====== */
function adminLoginHandler(e){
  e && e.preventDefault && e.preventDefault();
  const email = document.getElementById('adminEmail').value;
  const pass = document.getElementById('adminPassword').value;
  auth.signInWithEmailAndPassword(email, pass).then(()=>{
    showAdminPanel();
  }).catch(err=>{
    alert('فشل تسجيل الدخول: ' + err.message);
  });
}

function showAdminPanel(){
  showSection('adminPanel');
  // load stats and providers
  database.ref('providers').once('value', snap=>{
    const items = [];
    snap.forEach(c => { const v=c.val(); v.id=c.key; items.push(v); });
    renderAdminProviders(items);
    // stats
    const total = items.length;
    const approved = items.filter(i=>i.status==='approved').length;
    const pending = items.filter(i=>i.status==='pending').length;
    document.getElementById('adminStats').innerHTML = `
      <div class="stat">المسجلون: <strong>${total}</strong></div>
      <div class="stat">معتمدون: <strong>${approved}</strong></div>
      <div class="stat">معلقون: <strong>${pending}</strong></div>
    `;
  });
}

function renderAdminProviders(items){
  const c = document.getElementById('allProvidersAdmin');
  if(!c) return;
  c.innerHTML = items.map(p=>{
    return `
      <div class="provider-card">
        <h4>${escapeHtml(p.name)}</h4>
        <div>📍 ${escapeHtml(p.location)} — 🎯 ${escapeHtml(p.category)}</div>
        <div>${escapeHtml(p.description)}</div>
        <div style="margin-top:8px">
          ${p.status==='pending' ? `<button class="btn" onclick="approveProvider('${p.id}')">موافقة</button>
          <button class="btn" onclick="rejectProvider('${p.id}')">رفض</button>` : ''}
          <button class="btn" onclick="deleteProvider('${p.id}')">حذف</button>
        </div>
      </div>
    `;
  }).join('');
}

function approveProvider(id){
  database.ref('providers/' + id).update({ status: 'approved' }).then(()=>showAdminPanel());
}
function rejectProvider(id){
  database.ref('providers/' + id).update({ status: 'rejected' }).then(()=>showAdminPanel());
}
function deleteProvider(id){
  if(confirm('تأكيد حذف المقدم نهائياً؟')) database.ref('providers/' + id).remove().then(()=>showAdminPanel());
}

function signOutAdmin(){ auth.signOut().then(()=> { alert('تم تسجيل الخروج'); showSearch(); }) }

/* listen auth state to show admin panel automatically */
auth.onAuthStateChanged(user=>{
  if(user) showAdminPanel();
});

/* ====== 5. Util: load initial approved list ====== */
(function init(){
  // initial display: load approved providers
  searchServices();
})();

