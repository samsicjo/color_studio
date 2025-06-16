// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Image upload and preview functionality
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const placeholderText = document.getElementById('placeholderText');
let currentImageData = null;

imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            showImageInPreview(currentImageData);
            
            // Update button text to show file selected
            const uploadBtn = document.querySelector('.image-upload-btn');
            uploadBtn.innerHTML = `✅ ${file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}`;
            uploadBtn.style.background = '#4caf50';
            uploadBtn.style.color = 'white';
            uploadBtn.style.borderColor = '#4caf50';
        };
        reader.readAsDataURL(file);
    }
});

function showImageInPreview(imageSrc) {
    previewImage.src = imageSrc;
    previewImage.style.display = 'block';
    placeholderText.style.display = 'none';
}

function hideImagePreview() {
    previewImage.style.display = 'none';
    placeholderText.style.display = 'flex';
    placeholderText.textContent = getTabPlaceholderText();
}

function getTabPlaceholderText() {
    const activeTab = document.querySelector('.mock-tab.active');
    const tabName = activeTab.getAttribute('data-tab');
    
    switch(tabName) {
        case 'dashboard':
            return '📊 Dashboard View - Upload image to preview';
        case 'projects':
            return '🚀 Projects View - Upload image to preview';
        case 'goals':
            return '🎯 Goals View - Upload image to preview';
        default:
            return '📸 Upload an image to see it here';
    }
}

// Tab switching functionality
document.querySelectorAll('.mock-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.mock-tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Update preview based on whether image is uploaded
        if (currentImageData) {
            showImageInPreview(currentImageData);
        } else {
            hideImagePreview();
        }
        
        // Add visual feedback
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
    });
});

// Initialize placeholder text
document.addEventListener('DOMContentLoaded', function() {
    placeholderText.textContent = getTabPlaceholderText();
});

// Email form validation (keeping existing functionality but updating for new structure)
const submitBtn = document.querySelector('.hero-form .btn-primary');

submitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (!currentImageData) {
        alert('이미지를 먼저 업로드해주세요! 📸');
        return;
    }
    
    // Simulate form submission
    this.textContent = '처리 중...';
    this.style.opacity = '0.7';
    
    setTimeout(() => {
        alert('가입 완료! 업로드된 이미지와 함께 환영합니다! 🎉');
        this.textContent = 'Get Started For Free';
        this.style.opacity = '1';
    }, 1500);
});

// Interactive task items
document.querySelectorAll('.task-item').forEach(item => {
    item.addEventListener('click', function() {
        this.style.transform = 'scale(1.02)';
        this.style.boxShadow = '0 5px 15px rgba(123, 104, 238, 0.3)';
        
        setTimeout(() => {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        }, 200);
    });
});

// AI features hover effect
document.querySelectorAll('.ai-feature').forEach(feature => {
    feature.addEventListener('mouseenter', function() {
        this.style.background = '#7b68ee';
        this.style.color = 'white';
        this.style.transform = 'translateY(-5px) scale(1.05)';
    });
    
    feature.addEventListener('mouseleave', function() {
        this.style.background = '#f8f9fa';
        this.style.color = '#333';
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Toolbar button interactions
document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.toolbar-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        this.style.background = '#7b68ee';
        this.style.color = 'white';
        
        setTimeout(() => {
            this.style.background = '#f0f0f0';
            this.style.color = '#333';
        }, 1000);
    });
});

// Add bounce animation to hero buttons
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.classList.add('bounce');
    });
    
    btn.addEventListener('mouseleave', function() {
        this.classList.remove('bounce');
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Dynamic greeting based on time
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingElement = document.querySelector('.ai-demo p');
    
    if (greetingElement) {
        if (hour < 12) {
            greetingElement.textContent = 'Good morning! Ready to be productive?';
        } else if (hour < 18) {
            greetingElement.textContent = 'Good afternoon! Let\'s get things done!';
        } else {
            greetingElement.textContent = 'Good evening! Finishing up your tasks?';
        }
    }
}

// Initialize greeting
updateGreeting();

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});