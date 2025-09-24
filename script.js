// دالة زر القائمة (للتأكد من أننا لم نكسر شيئًا)
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) navMenu.classList.toggle('active');
}

// الاختبار الحاسم
document.addEventListener('DOMContentLoaded', function() {
        
    const registerForm = document.getElementById('registerForm');
        
    if (registerForm) {
        alert("نجاح حاسم: تم العثور على نموذج التسجيل (registerForm)!");
            
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            alert("الزر يعمل!");
        });

    } else {
        alert("خطأ جذري: لم يتم العثور على نموذج التسجيل (registerForm)!");
    }
});
