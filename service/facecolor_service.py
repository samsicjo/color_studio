# face_color_extraction_fixed.py
# 얼굴 부위별 색상 추출 - 개선된 버전

import numpy as np
import cv2
from PIL import Image
import torch
from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from fastapi import UploadFile
import io
import os

class FaceColorExtractor:
    def __init__(self):
        """얼굴 파싱 모델 초기화"""
        self.processor = SegformerImageProcessor.from_pretrained("jonathandinu/face-parsing")
        self.model = SegformerForSemanticSegmentation.from_pretrained("jonathandinu/face-parsing")
        
        # 실제 모델의 라벨 매핑 확인 및 수정
        self.label_map = {
            0: "background",
            1: "skin", 
            2: "nose",
            3: "eye_g",  # 안경
            4: "left_eye",
            5: "right_eye", 
            6: "left_brow",
            7: "right_brow",
            8: "left_ear",
            9: "right_ear",
            10: "mouth",
            11: "upper_lip",
            12: "lower_lip", 
            13: "hair",
            14: "hat",
            15: "earr_l",
            16: "earr_r",
            17: "neck_l",
            18: "neck"
        }
        
        # 관심 부위 정의 - 안경 제외
        self.target_parts = {
            "eyes": [4, 5],         # 좌안, 우안
            "nose": [2],            # 코
            "lips": [10, 11, 12],   # 입, 상순, 하순
            "hair": [13],           # 머리카락
            "skin": [1]             # 피부
        }
    
    def parse_face(self, image_path):
        """얼굴 이미지 파싱"""
        # 이미지 로드
        image = Image.open(image_path).convert("RGB")
        
        # 전처리
        inputs = self.processor(images=image, return_tensors="pt")
        
        # 모델 실행
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
        
        # 세그멘테이션 마스크 생성
        predicted_segmentation = self.processor.post_process_semantic_segmentation(
            outputs, target_sizes=[image.size[::-1]]
        )[0]
        
        return np.array(image), predicted_segmentation.numpy()
    
    def analyze_segmentation_mask(self, segmentation_mask):
        """세그멘테이션 마스크 분석 - 실제 라벨 확인"""
        unique_labels = np.unique(segmentation_mask)
        print("세그멘테이션 마스크에서 발견된 라벨들:")
        for label in unique_labels:
            pixel_count = np.sum(segmentation_mask == label)
            label_name = self.label_map.get(label, f"unknown_{label}")
            print(f"  라벨 {label}: {label_name} ({pixel_count} pixels)")
        return unique_labels
    
    def extract_dominant_color(self, image_region, n_colors=1):
        """이미지 영역에서 주요 색상 추출"""
        if len(image_region) == 0:
            return None
        
        # K-means 클러스터링으로 주요 색상 찾기
        pixels = image_region.reshape(-1, 3)
        
        # 유효한 픽셀만 사용 (너무 어둡거나 밝은 색 제외)
        valid_pixels = pixels[(np.sum(pixels, axis=1) > 30) & (np.sum(pixels, axis=1) < 720)]
        
        if len(valid_pixels) == 0:
            return None
        
        # 클러스터 수를 유효한 픽셀 수에 맞게 조정
        n_clusters = min(n_colors, len(valid_pixels), 5)
        if n_clusters == 0:
            return None
            
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(valid_pixels)
        
        # 가장 큰 클러스터의 중심색 반환
        labels = kmeans.labels_
        center_colors = kmeans.cluster_centers_
        
        # 클러스터별 픽셀 수 계산
        unique, counts = np.unique(labels, return_counts=True)
        dominant_color_idx = unique[np.argmax(counts)]
        
        return center_colors[dominant_color_idx].astype(int)
    
    def rgb_to_hex(self, rgb):
        """RGB를 HEX 코드로 변환"""
        if rgb is None:
            return None
        return f"{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
    
    def extract_face_colors(self, image_path):
        """얼굴 부위별 색상 추출 메인 함수"""
        # 얼굴 파싱
        original_image, segmentation_mask = self.parse_face(image_path)
        
        # 세그멘테이션 마스크 분석
        print("=== 세그멘테이션 마스크 분석 ===")
        unique_labels = self.analyze_segmentation_mask(segmentation_mask)
        
        results = {}
        
        # 각 관심 부위별 색상 추출
        for part_name, label_ids in self.target_parts.items():
            print(f"\n--- {part_name} 부위 분석 ---")
            
            # 해당 부위의 마스크 생성
            part_mask = np.zeros_like(segmentation_mask, dtype=bool)
            found_labels = []
            
            for label_id in label_ids:
                if label_id in unique_labels:
                    part_mask |= (segmentation_mask == label_id)
                    found_labels.append(label_id)
                    print(f"  라벨 {label_id} ({self.label_map.get(label_id, 'unknown')}) 발견")
            
            if not found_labels:
                print(f"  {part_name} 부위의 라벨을 찾을 수 없습니다.")
            
            if np.any(part_mask):
                # 마스크 영역의 픽셀만 추출
                part_pixels = original_image[part_mask]
                
                # 주요 색상 추출
                dominant_color = self.extract_dominant_color(part_pixels)
                hex_color = self.rgb_to_hex(dominant_color)
                
                print(f"  추출된 색상: RGB{dominant_color}, HEX: #{hex_color}")
                
                results[part_name] = {
                    "rgb": dominant_color.tolist() if dominant_color is not None else None,
                    "hex": hex_color,
                    "pixel_count": np.sum(part_mask)
                }
            else:
                results[part_name] = {
                    "rgb": None,
                    "hex": None,
                    "pixel_count": 0
                }
        
        return results, original_image, segmentation_mask
    
    def _plot_color_palette(self, axes, colors):
        """색상 팔레트 시각화"""
        axes.axis('off')
        axes.set_title("Extracted Colors")
        
        y_pos = 0.9
        for part_name, color_info in colors.items():
            if color_info["hex"]:
                color_rgb = [c/255 for c in color_info["rgb"]]
                axes.add_patch(plt.Rectangle((0.1, y_pos-0.05), 0.1, 0.08, 
                                          facecolor=color_rgb, edgecolor='black'))
                axes.text(0.25, y_pos, f"{part_name}: #{color_info['hex']}", 
                         fontsize=10, va='center')
                y_pos -= 0.15
        
        axes.set_xlim(0, 1)
        axes.set_ylim(0, 1)

    def _plot_part_masks(self, axes, original_image, segmentation_mask):
        """부위별 마스크 시각화"""
        part_names = list(self.target_parts.keys())
        for i, part_name in enumerate(part_names[:3]):
            if i < 3:
                label_ids = self.target_parts[part_name]
                part_mask = np.zeros_like(segmentation_mask, dtype=bool)
                
                for label_id in label_ids:
                    if label_id in np.unique(segmentation_mask):
                        part_mask |= (segmentation_mask == label_id)
                
                axes[1, i].imshow(original_image)
                if np.any(part_mask):
                    axes[1, i].imshow(part_mask, alpha=0.6, cmap='Reds')
                
                axes[1, i].set_title(f"{part_name.title()} Mask")
                axes[1, i].axis('off')

    def visualize_results(self, image_path, save_path=None):
        """결과 시각화"""
        colors, original_image, segmentation_mask = self.extract_face_colors(image_path)
        
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        
        # 원본 이미지
        axes[0, 0].imshow(original_image)
        axes[0, 0].set_title("Original Image")
        axes[0, 0].axis('off')
        
        # 세그멘테이션 마스크
        axes[0, 1].imshow(segmentation_mask, cmap='tab20')
        axes[0, 1].set_title("Segmentation Mask")
        axes[0, 1].axis('off')
        
        # 색상 팔레트와 마스크 시각화
        self._plot_color_palette(axes[0, 2], colors)
        self._plot_part_masks(axes, original_image, segmentation_mask)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.show()
        
        return colors

# 사용 예시
async def main(file: UploadFile):
    # 모델 초기화
    extractor = FaceColorExtractor()
    
    # 기본값으로 초기화
    face_colors = {
        "eyes": "000000",
        "nose": "000000", 
        "lips": "000000",
        "hair": "000000",
        "skin": "000000"
    }
    
    try:
        # 파일 내용 읽기
        contents = await file.read()
        
        # PIL Image로 변환
        image = Image.open(io.BytesIO(contents))
        
        # 임시 파일로 저장
        temp_path = "temp_image.jpg"
        image.save(temp_path)
        
        # 색상 추출
        colors, _, _ = extractor.extract_face_colors(temp_path)         
        
        for part_name, color_info in colors.items():
            if color_info["hex"] and part_name in face_colors:
                face_colors[part_name] = color_info["hex"]
        
        # 시각화
        #extractor.visualize_results(temp_path, "face_color_analysis.png")
        
    except Exception as e:
        print(f"오류 발생: {e}")
    finally:
        # 임시 파일 삭제
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    # FaceColor 객체 생성
    from schemas.schema import FaceColor
    return FaceColor(**face_colors)
# 간단한 버전 함수
def extract_face_colors_simple(image_path):
    """간단한 사용을 위한 래퍼 함수"""
    extractor = FaceColorExtractor()
    colors, _, _ = extractor.extract_face_colors(image_path)
    
    # HEX 색상만 반환
    result = {}
    for part, info in colors.items():
        result[part] = info["hex"]
    
    return result
