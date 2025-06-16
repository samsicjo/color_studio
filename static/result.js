const API_BASE_URL = 'http://127.0.0.1:8000';
// 업로드된 파일과 분석 결과를 저장할 전역 변수
let uploadedFile = null;
let analysisResult = null;

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
            aiDescription.textContent = `${seasonText}으로 분석되었습니다.`;
        }
        else{
            aiDescription.textContent = '분석 중 문제가 생겼습니다!';
        }
        
    }
    
    // AI 기능 목록을 실제 분석 결과로 교체
    const strongCard1 = aiSection.querySelector('.strongCard1');
    if (strongCard1) {
        strongCard1.innerHTML = `
            <div style="font-weight: bold;" class="strongCard1">퍼스널 컬러: ${result.personal_color_type}</div>
        `;
    }
    const strongCard2 = aiSection.querySelector('.strongCard2');
    if (strongCard2) {
        strongCard2.innerHTML = `
            <div style="font-weight: bold;" class="strongCard1">워스트 컬러: ${result.personal_color_type_not}</div>
        `;
    }
    const strongCard3 = aiSection.querySelector('.strongCard3');
    if (strongCard3) {
        strongCard3.innerHTML = `
            <div style="font-weight: bold;" class="strongCard1">피부 톤: ${result.skin_type_analysis}</div>
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

    
    // 문서 데모 영역에 상세 결과 표시
    const docsDemo = docsSection.querySelector('.docs-demo');
    if (docsDemo && result) {
        const detailsHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px; min-height: 300px;">
                <h3 style="color: #333; margin-bottom: 15px;">퍼스널 컬러를 기반으로 알려줄게요!</h3>
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                            <div style="font-weight: 500; margin-bottom: 5px;">화장법 추천</div>
                            <div style="font-size: 14px; color: #666;">
                                ${result.makeup_tips || '화장법 분석에 실패하였습니다! 다시 시도해보거나 다른 사진으로 다시 시도해주세요!'}<br>
                            </div>
                        </div>
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                            <div style="font-weight: 500; margin-bottom: 5px;">추천 악세서리 색</div>
                            <div style="font-size: 14px; color: #666;">${result.Accessory_color_recommendation[0] || '추천 악세서리를 불러오는 중 문제가 생겼습니다.'}, 
                            ${result.Accessory_color_recommendation[1] || ' '},
                            ${result.Accessory_color_recommendation[2] +'색이 잘 어울려요! '|| ' '}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        docsDemo.innerHTML = detailsHTML;
    }
}
