from fastapi import APIRouter
from typing import List
from fastapi import UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from service.facecolor_service import main
from service.gemini_service import analyze_personal_color, structured_personal_color_analysis
from schemas.schema import FaceColor, PersonalColorAnalysis, PersonalColorResponse
from service.closing_service import change_clothing_color
import json
from fastapi import Form, Response

router = APIRouter()

router.mount("/static", StaticFiles(directory="static"), name="static")

@router.get("/")
def main_page():
    return FileResponse('static/index.html')

@router.get("/personal_color_analysis")
def ai_result():
    return FileResponse('static/result.html')

@router.post("/personal/facecolor", response_model=FaceColor)
async def extract_face_color(file: UploadFile):
    """이미지에서 얼굴 부위별 색상을 추출합니다."""
    face_color = await main(file)
    return face_color


@router.post("/personal/analyze-all" , response_model=PersonalColorResponse)
async def analyze_face_all(file: UploadFile):
    """이미지를 받아서 색상 추출부터 퍼스널 컬러 분석까지 한 번에 처리합니다."""
    try:
        # 1단계: 얼굴 색상 추출
        face_color = await main(file)
        
        # 2단계: Gemini API를 통한 퍼스널 컬러 분석
        analysis_text = await analyze_personal_color(face_color)
        
        # 통합 결과 반환
        return PersonalColorResponse(personal_color_analysis=analysis_text)
        
    except Exception as e:
        return PersonalColorResponse(personal_color_analysis=f"분석 중 오류가 발생했습니다: {str(e)}")

@router.post("/personal/structed-analyze", response_model=PersonalColorAnalysis)
async def analyze_face_structed(prompt: PersonalColorResponse):
    """구조화된 퍼스널 컬러 분석"""
    try:
        result = await structured_personal_color_analysis(prompt)
        
        return result
    except Exception as e:
        error_message = str(e)
        return PersonalColorAnalysis(
            personal_color_type=error_message,
            personal_color_type_not=error_message,
            skin_type_analysis=error_message,
            PCCS_Tone_circle=[error_message],
            Hair_color_hex=[error_message],
            Hair_color_name=[error_message],
            Hair_tone=error_message,
            Accessory_color_recommendation=[error_message],
            makeup_tips=error_message
        )
    


@router.post("/personal/temp") #빠른 테스트 용도. 가을 뮤트의 퍼스널 컬러 검사를 리턴한다.
def temp():
    temp = {
        "personal_color_analysis": "Autumn-Mute\n"
    }
    return temp

@router.post("/personal/tempcolor") # 빠른 테스트 용도. 임의로 정해 둔 색상 리턴
def temp_color():
    temp = {
        "eyes": "462d25",
        "nose": "bc8973",
        "lips": "9b6056",
        "hair": "362e2a",
        "skin": "b6846b"
    }
    return temp

#빠른 테스트 용도. 
# analyze_face_structed 결과 값과 같은 값 리턴
@router.post("/personal/tempresult")
def temp_result():
    temp = {
        "personal_color_type": "Autumn-Deep",
        "personal_color_type_not": "Spring-Light",
        "skin_type_analysis": "웜톤",
        "PCCS_Tone_circle": [
        "deep",
        "dark",
        "dark grayish",
        "strong"
        ],
        "Hair_color_hex": [
        "#4A3A3A",
        "#59463B",
        "#60391C",
        "#3B220F"
        ],
        "Hair_color_name": [
        "다크 브라운",
        "초콜릿 브라운",
        "다크 오렌지 브라운",
        "블랙"
        ],
        "Hair_tone": "Dark",
        "Accessory_color_recommendation": [
        "골드",
        "브론즈",
        "카키"
        ],
        "makeup_tips": "Autumn-Deep톤은 깊고 그윽한 분위기를 살리는 메이크업이 잘 어울립니다. 아이섀도우는 톤 다운된 브라운, 버건디, 카키 색상을 사용하여 깊이 있는 눈매를 연출하고, 아이라인은 또렷하게 그려줍니다. 립은 매트한 질감의 딥 레드, 브릭 레드, 말린 장미 색상을 사용하여 고급스러운 분위기를 더할 수 있습니다. 블러셔는 톤 다운된 오렌지나 브라운 계열을 사용하여 자연스럽게 혈색을 더해줍니다. 전체적으로 색조를 통일감 있게 사용하여 차분하면서도 세련된 메이크업을 완성해보세요."
    }
    return temp
