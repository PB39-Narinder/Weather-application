document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navCenter = document.querySelector('.nav-center');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navCenter.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav-center') && 
                !event.target.closest('.mobile-menu-btn') && 
                navCenter.classList.contains('active')) {
                navCenter.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    }
}); 