const API_BASE_URL = 'http://127.0.0.1:8000';
// 업로드된 파일과 분석 결과를 저장할 전역 변수
let uploadedFile = null;
let analysisResult = null;


const personalColorData = {
    "Spring-Light": {
        personalColors: [
        { name: "살구", hex: "#FFDAB9" },
        { name: "라이트 코랄", hex: "#F08080" },
        { name: "라이트 옐로우", hex: "#FFFFE0" },
        { name: "민트", hex: "#AAF0D1" },
        { name: "베이비 핑크", hex: "#FFC0CB" },
        { name: "라벤더", hex: "#E6E6FA" },
        { name: "하늘색", hex: "#ADD8E6" },
        { name: "복숭아", hex: "#FFE5B4" },
        { name: "라이트 블루", hex: "#B0E0E6" }
        ],
        worstColors: [
        { name: "딥 네이비", hex: "#000080" },
        { name: "블랙", hex: "#000000" },
        { name: "다크 오렌지", hex: "#FF4500" },
        { name: "버건디", hex: "#800020" },
        { name: "딥 퍼플", hex: "#4B0082" },
        { name: "올리브", hex: "#556B2F" },
        { name: "머스터드", hex: "#FFDB58" },
        { name: "다크 브라운", hex: "#5C4033" },
        { name: "스모크 블루", hex: "#5D8AA8" }
        ]
    },
    "Spring-Bright": {
        personalColors: [
        { name: "브라이트 옐로우", hex: "#FFF176" },
        { name: "생기있는 코랄", hex: "#FF6F61" },
        { name: "선명한 애플그린", hex: "#8BC34A" },
        { name: "민트블루", hex: "#80DEEA" },
        { name: "딸기 핑크", hex: "#F06292" },
        { name: "오렌지탠저린", hex: "#FF9800" },
        { name: "골든 옐로우", hex: "#FFD700" },
        { name: "푸시아", hex: "#FF00FF" },
        { name: "크림 민트", hex: "#B2FF59" }
        ],
        worstColors: [
        { name: "진한 브라운", hex: "#3E2723" },
        { name: "다크 카키", hex: "#4B5320" },
        { name: "뮤트 네이비", hex: "#1A237E" },
        { name: "다크 보라", hex: "#512DA8" },
        { name: "어두운 차콜", hex: "#263238" },
        { name: "블랙", hex: "#000000" },
        { name: "다크 와인", hex: "#4A0033" },
        { name: "올리브그레이", hex: "#5B5B5B" },
        { name: "어두운 브릭레드", hex: "#7B241C" }
    ]
    },
    "Summer-Mute": {
        personalColors: [
        { name: "소프트 라일락", hex: "#D7C1E0" },
        { name: "그레이지", hex: "#D8D8D8" },
        { name: "페일 라벤더", hex: "#E6E6FA" },
        { name: "페일 블루", hex: "#D0E1F9" },
        { name: "더스티 핑크", hex: "#E1A6AD" },
        { name: "소프트 민트", hex: "#C1E1C1" },
        { name: "페일 머스타드", hex: "#FFF8DC" },
        { name: "로즈 베이지", hex: "#F4C2C2" },
        { name: "페일 퍼플", hex: "#CBC3E3" }
        ],
        worstColors: [
        { name: "브라이트 오렌지", hex: "#FF5722" },
        { name: "형광 노랑", hex: "#FFFF00" },
        { name: "선명한 레드", hex: "#D50000" },
        { name: "강한 로열블루", hex: "#1E3A8A" },
        { name: "블랙", hex: "#000000" },
        { name: "강한 버건디", hex: "#800020" },
        { name: "진한 브라운", hex: "#4E342E" },
        { name: "다크 카키", hex: "#3D3C3A" },
        { name: "네온 핑크", hex: "#FF69B4" }
        ]
    },
    "Summer-Light": {
        personalColors: [
            { name: "로즈 핑크", hex: "#FFC0CB" },
            { name: "라일락", hex: "#C8A2C8" },
            { name: "소프트 블루", hex: "#AEC6CF" },
            { name: "민트 그린", hex: "#98FF98" },
            { name: "베이비 블루", hex: "#BFEFFF" },
            { name: "라벤더 블루", hex: "#CCCCFF" },
            { name: "연보라", hex: "#D8BFD8" },
            { name: "펄 핑크", hex: "#FFDDE2" },
            { name: "실버", hex: "#C0C0C0" }
        ],
        worstColors: [
            { name: "머스터드", hex: "#FFDB58" },
            { name: "올리브", hex: "#708238" },
            { name: "다크 오렌지", hex: "#FF8C00" },
            { name: "브릭 레드", hex: "#B22222" },
            { name: "카멜", hex: "#AF6E4D" },
            { name: "다크 브라운", hex: "#5C4033" },
            { name: "진녹색", hex: "#006400" },
            { name: "마룬", hex: "#800000" },
            { name: "짙은 네이비", hex: "#000033" }
        ]
    },
    "Autumn-Deep": {
        personalColors: [
        { name: "딥 브라운", hex: "#645321" },
        { name: "와인", hex: "#782838" },
        { name: "버건디", hex: "#800020" },
        { name: "브릭 레드", hex: "#9C6653" },
        { name: "다크 올리브", hex: "#556B2F" },
        { name: "머스터드 브라운", hex: "#C49E50" },
        { name: "소프트 마룬", hex: "#6E1414" },
        { name: "다크 브론즈", hex: "#4B3621" },
        { name: "시에나", hex: "#A0522D" }
        ],
        worstColors: [
        { name: "네온 옐로우", hex: "#FFFF33" },
        { name: "파스텔 핑크", hex: "#FFDDEE" },
        { name: "연보라", hex: "#D8BFD8" },
        { name: "아쿠아", hex: "#00FFFF" },
        { name: "라벤더", hex: "#E1BEE7" },
        { name: "라이트 그레이", hex: "#D3D3D3" },
        { name: "페일 블루", hex: "#D0E1F9" },
        { name: "베이비 블루", hex: "#B3E5FC" },
        { name: "피치 핑크", hex: "#FFDAB9" }
        ]
    },
    "Autumn-Mute": {
        personalColors: [
            { name: "소프트 브라운", hex: "#A1866F" },
            { name: "웜 토프", hex: "#D2B1A3" },
            { name: "페일 살몬", hex: "#FFA07A" },
            { name: "모카", hex: "#837060" },
            { name: "피치 브라운", hex: "#E6B89C" },
            { name: "소프트 올리브", hex: "#BAB86C" },
            { name: "웜 카키", hex: "#BDB76B" },
            { name: "더스티 오렌지", hex: "#D2996E" },
            { name: "로즈 브라운", hex: "#BC8F8F" }
        ],
        worstColors: [
            { name: "차가운 블루", hex: "#0000CD" },
            { name: "버건디", hex: "#800020" },
            { name: "비비드 핫핑크", hex: "#FF1493" },
            { name: "퓨어 레드", hex: "#FF0000" },
            { name: "진한 블랙", hex: "#000000" },
            { name: "딥 바이올렛", hex: "#4B0082" },
            { name: "차가운 네이비", hex: "#000080" },
            { name: "선명한 화이트", hex: "#FFFFFF" },
            { name: "비비드 오렌지", hex: "#FF4500" }
        ]
    },
    "Winter-Deep": {
        personalColors: [
        { name: "와인 레드", hex: "#720026" },
        { name: "쿨 블루", hex: "#0033A0" },
        { name: "버건디", hex: "#800020" },
        { name: "로얄 퍼플", hex: "#4B0082" },
        { name: "차콜 그레이", hex: "#36454F" },
        { name: "진청", hex: "#001F3F" },
        { name: "딥 에메랄드", hex: "#004D40" },
        { name: "플럼", hex: "#8E4585" },
        { name: "네이비", hex: "#000080" }
        ],
        worstColors: [
        { name: "제트 블랙", hex: "#000000" },
        { name: "딥 퍼플", hex: "#301934" },
        { name: "딥 네이비", hex: "#000066" },
        { name: "다크 레드", hex: "#660000" },
        { name: "다크 에메랄드", hex: "#004D40" },
        { name: "차콜 그레이", hex: "#36454F" },
        { name: "다크 바이올렛", hex: "#400080" },
        { name: "마룬", hex: "#800040" },
        { name: "인디고", hex: "#4B0082" }
        ]
    },
  "Winter-Bright": {
    personalColors: [
      { name: "아이시 블루", hex: "#E0F7FA" },
      { name: "쿨 민트", hex: "#B2EBF2" },
      { name: "라즈베리",hex: "#C2185B" },
      { name: "푸시아 핑크", hex: "#E91E63" },
      { name: "사이안 블루", hex: "#00BCD4" },
      { name: "선명한 블루", hex: "#2196F3" },
      { name: "블랙", hex: "#000000" },
      { name: "크리스탈 화이트", hex: "#F5F5F5" },
      { name: "비비드 레드", hex: "#D50000" }
    ],
    worstColors: [
      { name: "브라운", hex: "#5D4037" },
      { name: "모카", hex: "#837060" },
      { name: "다크 카멜", hex: "#8B6B4A" },
      { name: "올리브", hex: "#708238" },
      { name: "따뜻한 베이지", hex: "#F5DEB3" },
      { name: "차콜 브라운", hex: "#3E2723" },
      { name: "웜 오렌지", hex: "#FFA07A" },
      { name: "누드 핑크", hex: "#EEC9D2" },
      { name: "페일 옐로우", hex: "#FFFACD" }
    ]
  },
};
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

// 기존 이미지 업로드 이벤트 리스너 개선
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        // 파일 크기 체크 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기가 너무 큽니다. 10MB 이하의 이미지를 선택해주세요.');
            return;
        }
        // 업로드된 파일을 전역 변수에 저장 (추가된 부분)
        uploadedFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            showImageInPreview(currentImageData);
            
            // 업로드 버튼 텍스트 업데이트
            const uploadBtn = document.querySelector('.image-upload-btn');
            const fileName = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;
            uploadBtn.innerHTML = `✅ ${fileName}`; // 업로드 버튼 inner
            uploadBtn.style.background = '#FF5A48';
            uploadBtn.style.color = 'white';
            uploadBtn.style.borderColor = '#FF5A48';
        };
        
        reader.onerror = function() {
            alert('파일을 읽는 중 오류가 발생했습니다.');
        };
        
        reader.readAsDataURL(file);
    } else {
        alert('이미지 파일만 업로드 가능합니다.');
    }
});
function showImageInPreview(imageSrc) {
    const img = new Image();
    
    img.onload = function() {
        // 이미지 로드 완료 후 표시
        previewImage.src = imageSrc;
        previewImage.style.display = 'block';
        previewImage.classList.add('loaded');
        placeholderText.style.display = 'none';
        
        // 컨테이너 높이를 이미지 비율에 맞게 조정
        adjustPreviewContainerSize(this.naturalWidth, this.naturalHeight);
    };
    
    img.onerror = function() {
        alert('이미지를 불러올 수 없습니다. 다른 이미지를 선택해주세요.');
    };
    
    img.src = imageSrc;
}

// 이미지 비율에 따라 컨테이너 크기 조정
function adjustPreviewContainerSize(naturalWidth, naturalHeight) {
    const imagePreview = document.getElementById('imagePreview');
    const aspectRatio = naturalWidth / naturalHeight;
    const containerWidth = imagePreview.parentElement.offsetWidth - 40; // padding 고려
    
    let newHeight;
    
    if (aspectRatio > 1.5) {
        // 가로가 긴 이미지
        newHeight = Math.min(250, containerWidth / aspectRatio);
    } else if (aspectRatio < 0.7) {
        // 세로가 긴 이미지
        newHeight = Math.min(400, containerWidth / aspectRatio);
    } else {
        // 정사각형에 가까운 이미지
        newHeight = Math.min(300, containerWidth / aspectRatio);
    }
    
    // 최소/최대 높이 제한
    newHeight = Math.max(200, Math.min(400, newHeight));
    
    imagePreview.style.height = newHeight + 'px';
    
    // 부모 컨테이너도 조정
    const mockInterface = imagePreview.closest('.mock-interface');
    mockInterface.style.minHeight = (newHeight + 60) + 'px'; // 패딩 고려
}



// 이미지 숨기기 함수 개선
function hideImagePreview() {
    previewImage.style.display = 'none';
    previewImage.classList.remove('loaded');
    placeholderText.style.display = 'flex';
    placeholderText.textContent = getTabPlaceholderText();
    
    // 컨테이너 높이 초기화
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.style.height = '200px';
    const mockInterface = imagePreview.closest('.mock-interface');
    mockInterface.style.minHeight = '280px';
}

function getTabPlaceholderText() {
    const activeTab = document.querySelector('.mock-tab.active');
    
    // activeTab이 없으면 기본 텍스트 반환
    if (!activeTab) {
        return '📸 분석할 사진을 업로드 해주세요!';
    }
}


// Initialize placeholder text
document.addEventListener('DOMContentLoaded', function() {
    placeholderText.textContent = getTabPlaceholderText();
});

// Email form validation (keeping existing functionality but updating for new structure)
const submitBtn = document.querySelector('.hero-form .btn-primary');

submitBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    
    if (!uploadedFile) {
        alert('이미지를 먼저 업로드해주세요! 📸');
        return;
    }
    
    try {
        // 버튼 상태 변경
        this.textContent = '분석 중...';
        this.style.opacity = '0.7';
        this.disabled = true;
        
        // FastAPI로 POST 요청 보내기
        analysisResult = await sendImageToAPI(uploadedFile); // ############################# 이걸 이제 한 번 더 요청 넘겨줘야 함.
        console.log('분석 결과(analysisResult):', analysisResult);
        console.log('analysisResult.personal_color_analysis : ', analysisResult.personal_color_analysis )
        const recon_anResult = {'personal_color_analysis' : analysisResult.personal_color_analysis};
        console.log('recon_anResult : ', analysisResult.personal_color_analysis )
        
        try {
            const response = await fetch(`${API_BASE_URL}/personal/structed-analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // JSON 형식으로 데이터를 보냄.
                },
                body: JSON.stringify(recon_anResult)
            });

            const percol_all_data = await response.json();

            console.log("FastAPI에서 반환된 실제 데이터:", percol_all_data);

            console.log(percol_all_data);
            displayResultsInSections(percol_all_data);
            
            // 섹션들을 보이게 하기
            showResultSections();
        } catch (error) {
            console.error("Fetch 요청 중 오류 발생:", error);
        }

        
        
        // 성공 메시지
        alert('분석이 완료되었습니다! 아래 결과를 확인해주세요.');
        
    } catch (error) {
        // 오류 시 메시지 표시
        alert('오류 발생: ' + error.message);
        console.error('API 호출 오류:', error);
    } finally {
        // 버튼 상태 복원
        this.textContent = '다시 분석하기!';
        this.style.opacity = '1';
        this.disabled = false;
    }
});


// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
// 윈도우 리사이즈 시 이미지 크기 재조정
window.addEventListener('resize', function() {
    if (currentImageData && previewImage.style.display === 'block') {
        adjustPreviewContainerSize(previewImage.naturalWidth, previewImage.naturalHeight);
    }
});
// FastAPI 서버로 이미지를 보내는 함수
async function sendImageToAPI(selectedFile) {
    try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch(`${API_BASE_URL}/personal/analyze-all`, {
            method: 'POST',
            body: formData
        });
        
        // 응답 처리 개선
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            try {
                // Content-Type이 JSON인지 확인
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } else {
                    // JSON이 아닌 경우 텍스트로 읽기
                    const errorText = await response.text();
                    console.log('서버 오류 응답:', errorText);
                    errorMessage = `서버 오류 (${response.status}): ${errorText.substring(0, 100)}...`;
                }
            } catch (parseError) {
                console.log('오류 응답 파싱 실패:', parseError);
                errorMessage = `서버 오류 (${response.status}): 응답을 읽을 수 없습니다`;
            }
            
            throw new Error(errorMessage);
        }
        
        // 성공 응답 처리
        const result = await response.json();
        console.log("test!!!", result);
        return result;
        
    } catch (error) {
        console.error('API 호출 중 오류:', error);
        
        // 네트워크 오류인 경우
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('서버에 연결할 수 없습니다. FastAPI 서버가 실행 중인지 확인해주세요.');
        }
        
        throw error;
    }
}

// 결과 섹션들을 보이게 하는 함수
function showResultSections() {
    const sections = [
        document.querySelector('.ai-section'),
        document.querySelector('.simplify-section'),
        document.querySelector('.docs-section')
    ];
    
    sections.forEach((section, index) => {
        if (section) {
            // 각 섹션을 순차적으로 보이게 함 (0.5초 간격)
            setTimeout(() => {
                section.classList.add('show-result');
                section.style.display = 'block'; // 이 줄이 핵심!
            }, index * 500);
        }
    });
}
// 분석 결과를 각 섹션에 표시하는 함수
function displayResultsInSections(result) {
    // AI 섹션에 결과 표시
    updateAISection(result);
    
    // Simplify 섹션에 결과 표시
    updateSimplifySection(result);
    
    // Docs 섹션에 결과 표시
    updateDocsSection(result);
}
// AI 섹션 업데이트 함수
function updateAISection(result) {
    const aiSection = document.querySelector('.ai-section');
    if (!aiSection) return;
    
    // AI 섹션의 제목과 설명 업데이트
    const aiTitle = aiSection.querySelector('h2');
    const aiDescription = aiSection.querySelector('p');
    
    if (aiTitle) {
        aiTitle.innerHTML = `당신의 <span style="color: #FF5A48;">퍼스널 컬러</span> 분석 결과`; // 퍼스널 컬러 대표 색으로 바꿀 예정.
    }
    
    if (aiDescription) {
        // 실제 API 데이터 사용
        const seasonText = result.skin_type_analysis ? `${result.skin_type_analysis} 타입` : '알 수 없는 타입';
        const description = result.description || '분석이 완료되었습니다.';
        if(result.skin_type_analysis){
            aiDescription.textContent = `당신과 어울리는 컬러는 ${seasonText}으로 분석되었습니다.`;
        }
        else{
            aiDescription.textContent = '분석 중 문제가 생겼습니다!';
        }
        aiDescription.style.fontSize = '35px';       // 설명 텍스트 크기 조정
        aiDescription.style.color = '#444';          // 텍스트 색상 조금 더 진하게
        aiDescription.style.marginBottom = '20px';   // 여백도 조금 조정
        
    }
    
    // AI 기능 목록을 실제 분석 결과로 교체
    const colorInfo = personalColorData[result.personal_color_type];
    const worstColorInfo = personalColorData[result.personal_color_type_not];

    // 추천 컬러 박스
    let personalColorBoxes = '';
    if (colorInfo?.personalColors?.length > 0) {
        personalColorBoxes = `
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                ${colorInfo.personalColors.map(color => `
                    <div style="width: 40px; height: 40px; border-radius: 6px; background-color: ${color.hex}; border: 1px solid #999;" title="${color.name}"></div>
                `).join('')}
            </div>
        `;
    }

    // 워스트 컬러 박스
    let worstColorBoxes = '';
    if (worstColorInfo?.worstColors?.length > 0) {
        worstColorBoxes = `
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                ${worstColorInfo.worstColors.map(color => `
                    <div style="width: 40px; height: 40px; border-radius: 6px; background-color: ${color.hex}; border: 1px solid #999;" title="${color.name}"></div>
                `).join('')}
            </div>
        `;
    }

    // strongCard1 – 퍼스널 컬러
    const strongCard1 = aiSection.querySelector('.strongCard1');
    if (strongCard1) {
        strongCard1.innerHTML = `
            <div style="font-weight: bold; font-size: 27px; margin-bottom: 6px;">퍼스널 컬러: ${result.personal_color_type}</div>
            <div style="width: 100px; height: 40px; border-radius: 8px; background-color: ${result.personal_color_hex || '#ccc'}; border: 1px solid #999;"></div>
            ${personalColorBoxes}
        `;
    }

    // strongCard2 – 워스트 컬러
    const strongCard2 = aiSection.querySelector('.strongCard2');
    if (strongCard2) {
        strongCard2.innerHTML = `
            <div style="font-weight: bold; font-size: 27px; margin-bottom: 6px;">워스트 컬러: ${result.personal_color_type_not}</div>
            <div style="width: 100px; height: 40px; border-radius: 8px; background-color: ${result.personal_color_hex_not || '#ccc'}; border: 1px solid #999;"></div>
            ${worstColorBoxes}
        `;
    }

    // strongCard3 – 피부 톤
    const strongCard3 = aiSection.querySelector('.strongCard3');
    if (strongCard3) {
        strongCard3.innerHTML = `
            <div style="font-weight: bold; font-size: 27px; margin-bottom: 6px;">피부 톤: ${result.skin_type_analysis}</div>
        `;
    }
}

// Simplify 섹션 업데이트 함수
function updateSimplifySection(result) {
    const simplifySection = document.querySelector('.simplify-section');
    if (!simplifySection) return;
    
    const simplifyTitle = simplifySection.querySelector('h2');
    const simplifyDescription = simplifySection.querySelector('p');
    
    if (simplifyTitle) {
        simplifyTitle.textContent = '추천하는 헤어 컬러!';
    }
    
    if (simplifyDescription) {
        simplifyDescription.textContent = '얼굴 색과 가장 잘 어울리는 컬러를 가져왔어요!';
    }
    
    // 실제 추천 색상 데이터 사용
    const taskList = simplifySection.querySelector('.task-list');
    if (taskList) {
        if (result.Hair_color_name && result.Hair_color_name.length > 0) {
            let colorsHTML = '';
            result.Hair_color_name.slice(0, 4).forEach((color, index) => {
                colorsHTML += `
                    <div class="task-item">
                    <div class="task-status completed" style="background-color: ${result.Hair_color_hex[index]};"></div>
                        <div>
                            <div style="font-weight: 500;">${color}</div>
                            <div style="font-size: 14px; color: #666;">${result.Hair_color_hex[index]}</div>
                        </div>
                        
                    </div>
                `;
            });
            taskList.innerHTML = colorsHTML;
        } else {
            // 추천 색상이 없는 경우
            taskList.innerHTML = `
                <div class="task-item">
                    <div class="task-status">📋</div>
                    <div>
                        <div style="font-weight: 500;">추천 색상 데이터 없음</div>
                        <div style="font-size: 14px; color: #666;">분석 결과에서 색상 정보를 찾을 수 없습니다.</div>
                    </div>
                </div>
            `;
        }
    }
}

// Docs 섹션 업데이트 함수
function updateDocsSection(result) {
    const docsSection = document.querySelector('.docs-section');
    if (!docsSection) return;

    const makeupTip = document.getElementById('makeupTip');
    const accessoryTip = document.getElementById('accessoryTip');

    if (makeupTip) {
        makeupTip.textContent = result.makeup_tips || '추천 화장법을 불러오는 중 문제가 생겼습니다.';
    }

    if (accessoryTip && result.Accessory_color_recommendation) {
        accessoryTip.textContent = result.Accessory_color_recommendation
            .filter(Boolean)
            .join(', ') + ' 색이 잘 어울려요!';
    }

    // 문서 데모 영역에 상세 결과 표시
    const docsDemo = docsSection.querySelector('.docs-demo');
    if (docsDemo && result) {
            docsDemo.style.background = 'none';
            docsDemo.style.padding = '0';
            docsDemo.style.border = 'none';
            docsDemo.style.boxShadow = 'none';

        const accessoryList = Array.isArray(result.Accessory_color_recommendation) ? result.Accessory_color_recommendation.filter(Boolean) : [];
        const accessoryText = accessoryList.length > 0
            ? accessoryList.join(', ') + ' 색이 잘 어울려요!'
            : '추천 악세서리를 불러오는 중 문제가 생겼습니다.';

        const detailsHTML = `
            <h3 style="
                color: #333;
                font-size: 40px;
                font-weight: 700;
                margin-bottom: 24px;
                padding: 10px 0;
            ">
                퍼스널 컬러를 기반으로 알려줄게요!
            </h3>
            <div style="display: flex; flex-direction: column; gap: 30px;">
                <!-- 화장법 추천 박스 -->
                <div style="flex: 1; background: #fef9f4; padding: 25px; border-radius: 12px; min-width: 280px;">
                    <div style="font-weight: 600; font-size: 27px; margin-bottom: 10px;">💄 화장법 추천</div>
                    <div style="font-size: 20px; color: #444; line-height: 1.6;">
                        ${result.makeup_tips || '화장법 분석에 실패하였습니다! 다시 시도해주세요.'}
                    </div>
                </div>

                <!-- 추천 악세서리 색 박스 -->
                <div style="flex: 1; background: #f6f4fd; padding: 25px; border-radius: 12px; min-width: 280px;">
                    <div style="font-weight: 600; font-size: 27px; margin-bottom: 10px;">💍 추천 악세서리 색</div>
                    <div style="font-size: 20px; color: #444; line-height: 1.6;">
                        ${accessoryText}
                    </div>
                </div>
            </div>
        `;
        docsDemo.innerHTML = detailsHTML;
    }
}
