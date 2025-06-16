// 모바일 메뉴 토글
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('index-mobileMenu');
    const hamburger = document.querySelector('.index-nav__hamburger');
    
    mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('index-mobileMenu');
    const hamburger = document.querySelector('.index-nav__hamburger');
    
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// 스크롤 애니메이션
function animateOnScroll() {
    const elements = document.querySelectorAll('.index-fade-in');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

// 스크롤 이벤트 리스너
window.addEventListener('scroll', animateOnScroll);

// 부드러운 스크롤
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

// 헤더 스크롤 효과
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// 페이지 로드 시 애니메이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
});

// 구체 클릭 인터랙션
document.querySelector('.index-sphere').addEventListener('click', function() {
    this.style.transform = 'scale(1.1)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 200);
});

// 카드 호버 효과 강화
document.querySelectorAll('.index-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// 페럴랙스 효과
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const sphere = document.querySelector('.index-sphere-container');
    if (sphere) {
        sphere.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});
// startBtn Id를 가진 애를(index.html에 Get Start 버튼) 누르면
// window.location.href 하이퍼링크로 이동시켜준다
// 그게 /result고 router.py 보면 /result는 get 요청하는 새로운 페이지임
document.getElementById("startBtn").addEventListener("click", () => {
    window.location.href = "/personal_color_analysis";
});


