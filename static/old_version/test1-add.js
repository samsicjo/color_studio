// 개선된 이미지 미리보기 함수
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

// 기존 이미지 업로드 이벤트 리스너 개선
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        // 파일 크기 체크 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기가 너무 큽니다. 10MB 이하의 이미지를 선택해주세요.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            showImageInPreview(currentImageData);
            
            // 업로드 버튼 텍스트 업데이트
            const uploadBtn = document.querySelector('.image-upload-btn');
            const fileName = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;
            uploadBtn.innerHTML = `✅ ${fileName}`;
            uploadBtn.style.background = '#4caf50';
            uploadBtn.style.color = 'white';
            uploadBtn.style.borderColor = '#4caf50';
        };
        
        reader.onerror = function() {
            alert('파일을 읽는 중 오류가 발생했습니다.');
        };
        
        reader.readAsDataURL(file);
    } else {
        alert('이미지 파일만 업로드 가능합니다.');
    }
});

// 윈도우 리사이즈 시 이미지 크기 재조정
window.addEventListener('resize', function() {
    if (currentImageData && previewImage.style.display === 'block') {
        adjustPreviewContainerSize(previewImage.naturalWidth, previewImage.naturalHeight);
    }
});