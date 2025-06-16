import numpy as np
import cv2
from PIL import Image
import torch
from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation
import io
import os
from fastapi import UploadFile
import logging
import time

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('clothing_service.log'),
        logging.StreamHandler()
    ]
)

class ClothingColorChanger:
    def __init__(self):
        """의상 파싱 모델 초기화"""
        try:
            logging.info("의상 파싱 모델 초기화 시작")
            start_time = time.time()
            
            self.processor = SegformerImageProcessor.from_pretrained("mattmdjaga/segformer_b2_clothes")
            logging.info("이미지 프로세서 로드 완료")
            
            self.model = SegformerForSemanticSegmentation.from_pretrained("mattmdjaga/segformer_b2_clothes")
            self.model.eval()  # 평가 모드로 설정
            logging.info("세그멘테이션 모델 로드 완료")
            
            # 의상 관련 라벨 매핑
            self.clothing_labels = {
                1: "clothing",  # 상의
                2: "clothing",  # 하의
                3: "clothing",  # 드레스
                4: "clothing"   # 아우터
            }
            
            end_time = time.time()
            logging.info(f"모델 초기화 완료 (소요시간: {end_time - start_time:.2f}초)")
        except Exception as e:
            logging.error(f"모델 초기화 중 오류 발생: {str(e)}", exc_info=True)
            raise
    
    def preprocess_image(self, image):
        """이미지 전처리"""
        try:
            logging.info(f"이미지 전처리 시작 (원본 크기: {image.size})")
            start_time = time.time()
            
            # 이미지 크기 조정 (너무 큰 이미지 처리)
            max_size = 1024
            if max(image.size) > max_size:
                ratio = max_size / max(image.size)
                new_size = tuple(int(dim * ratio) for dim in image.size)
                image = image.resize(new_size, Image.Resampling.LANCZOS)
                logging.info(f"이미지 크기 조정 완료 (새 크기: {new_size})")
            
            end_time = time.time()
            logging.info(f"이미지 전처리 완료 (소요시간: {end_time - start_time:.2f}초)")
            return image
        except Exception as e:
            logging.error(f"이미지 전처리 중 오류 발생: {str(e)}", exc_info=True)
            raise
    
    def parse_clothing(self, image):
        """의상 영역 파싱"""
        try:
            logging.info("의상 영역 파싱 시작")
            start_time = time.time()
            
            # 이미지 전처리
            processed_image = self.preprocess_image(image)
            
            # 모델 입력 준비
            logging.info("모델 입력 준비 중")
            inputs = self.processor(images=processed_image, return_tensors="pt")
            
            # 모델 실행
            logging.info("모델 추론 시작")
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
            
            # 세그멘테이션 마스크 생성
            logging.info("세그멘테이션 마스크 생성 중")
            predicted_segmentation = self.processor.post_process_semantic_segmentation(
                outputs, target_sizes=[processed_image.size[::-1]]
            )[0]
            
            end_time = time.time()
            logging.info(f"의상 영역 파싱 완료 (소요시간: {end_time - start_time:.2f}초)")
            return np.array(processed_image), predicted_segmentation.numpy()
        except Exception as e:
            logging.error(f"의상 파싱 중 오류 발생: {str(e)}", exc_info=True)
            raise
    
    def create_clothing_mask(self, segmentation_mask, image_shape):
        """의상 마스크 생성"""
        try:
            logging.info("의상 마스크 생성 시작")
            start_time = time.time()
            
            # 기본 마스크 생성
            clothing_mask = np.zeros_like(segmentation_mask, dtype=bool)
            
            # 의상 영역 포함
            for label_id in self.clothing_labels.keys():
                mask_area = (segmentation_mask == label_id)
                clothing_mask |= mask_area
                logging.info(f"라벨 {label_id} 영역 크기: {np.sum(mask_area)} 픽셀")
            
            # 상단 영역 제외 (머리카락 등)
            top_exclude = int(image_shape[0] * 0.33)
            clothing_mask[:top_exclude] = False
            logging.info(f"상단 {top_exclude}픽셀 제외")
            
            # 노이즈 제거
            total_pixels = np.sum(clothing_mask)
            logging.info(f"마스크 총 픽셀 수: {total_pixels}")
            if total_pixels < 1000:  # 최소 픽셀 수
                logging.warning("마스크 픽셀 수가 너무 적음")
                return None
            
            end_time = time.time()
            logging.info(f"의상 마스크 생성 완료 (소요시간: {end_time - start_time:.2f}초)")
            return clothing_mask
        except Exception as e:
            logging.error(f"마스크 생성 중 오류 발생: {str(e)}", exc_info=True)
            return None
    
    def apply_color_change(self, image, mask, target_color):
        """색상 변경 적용"""
        try:
            logging.info("색상 변경 적용 시작")
            start_time = time.time()
            
            if mask is None or not np.any(mask):
                logging.warning("유효한 마스크가 없음")
                return image
            
            # 원본 이미지 복사
            result_image = image.copy()
            
            # 의상 영역에 새로운 색상 적용
            for c in range(3):  # RGB 채널
                result_image[..., c] = np.where(
                    mask,
                    target_color[c],
                    image[..., c]
                )
            
            # 자연스러운 전환을 위한 알파 블렌딩
            alpha = 0.7
            result_image = cv2.addWeighted(image, 1-alpha, result_image, alpha, 0)
            
            end_time = time.time()
            logging.info(f"색상 변경 적용 완료 (소요시간: {end_time - start_time:.2f}초)")
            return result_image
        except Exception as e:
            logging.error(f"색상 변경 적용 중 오류 발생: {str(e)}", exc_info=True)
            return image
    
    def change_clothing_color(self, image, target_color):
        """의상 색상 변경 메인 함수"""
        try:
            logging.info(f"의상 색상 변경 시작 (타겟 색상: {target_color})")
            start_time = time.time()
            
            # 의상 파싱
            original_image, segmentation_mask = self.parse_clothing(image)
            
            # 의상 마스크 생성
            clothing_mask = self.create_clothing_mask(segmentation_mask, original_image.shape)
            
            # 색상 변경 적용
            result_image = self.apply_color_change(original_image, clothing_mask, target_color)
            
            end_time = time.time()
            logging.info(f"의상 색상 변경 완료 (소요시간: {end_time - start_time:.2f}초)")
            return result_image
        except Exception as e:
            logging.error(f"의상 색상 변경 중 오류 발생: {str(e)}", exc_info=True)
            return image

async def change_clothing_color(file: UploadFile, target_color: list):
    """의상 색상 변경 API 엔드포인트용 함수"""
    try:
        logging.info(f"API 요청 처리 시작 (파일명: {file.filename}, 타겟 색상: {target_color})")
        start_time = time.time()
        
        # 파일 내용 읽기
        contents = await file.read()
        logging.info(f"파일 읽기 완료 (크기: {len(contents)} 바이트)")
        
        # PIL Image로 변환
        image = Image.open(io.BytesIO(contents))
        logging.info(f"이미지 로드 완료 (크기: {image.size})")
        
        # 의상 색상 변경
        color_changer = ClothingColorChanger()
        result_image = color_changer.change_clothing_color(image, target_color)
        
        # 결과 이미지를 바이트로 변환
        result_image_pil = Image.fromarray(result_image)
        img_byte_arr = io.BytesIO()
        result_image_pil.save(img_byte_arr, format='JPEG', quality=95)
        img_byte_arr = img_byte_arr.getvalue()
        
        end_time = time.time()
        logging.info(f"API 요청 처리 완료 (소요시간: {end_time - start_time:.2f}초)")
        return img_byte_arr
        
    except Exception as e:
        logging.error(f"API 처리 중 오류 발생: {str(e)}", exc_info=True)
        return None 