import google.generativeai as genai
import os
import instructor
from schemas.schema import FaceColor, PersonalColorAnalysis, PersonalColorResponse
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class GeminiColorConsultant:
    def __init__(self):
        """Gemini API 초기화"""
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
        
        genai.configure(api_key=GEMINI_API_KEY)
        # 일반 텍스트용 모델
        self.text_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # 구조화된 출력용 모델
        self.structured_model = instructor.from_gemini(
            client=genai.GenerativeModel(
                model_name="models/gemini-2.0-flash",
            ),
        )

    def create_personal_color_prompt(self, face_color: FaceColor) -> str:
        """퍼스널 컬러 진단 프롬프트 생성"""
        prompt = f"""당신은 퍼스널 컬러 전문가고고
그리고 퍼스널 컬러 진단을 하는데
상세하게 제대로 검색을해
밑의 정보를 토대로

눈 : #{face_color.eyes}
코 : #{face_color.nose}
입술 : #{face_color.lips}
머리 : #{face_color.hair}
피부 : #{face_color.skin}

퍼스널컬러 타입을
Spring-Light, Spring-Bright, Summer-Light, Summer-Mute, Autumn-Mute, Autumn-Deep, Winter-Bright, Winter-Deep 중에서 가장 잘 맞는 퍼스널 컬러 타입을 추천해줘
답은 딱 그타입만 출력해줘
"""
        return prompt
    

    async def create_analyze_structured(self, prompt : str) -> str:        
        """구조화된 퍼스널 컬러 분석"""
        s_prompt = f"""당신은 퍼스널 컬러 전문가고        

퍼스널컬러 {prompt}에 맞게 다음 형식으로 응답해주세요:
1. 퍼스널 컬러 타입 Spring-Light, Spring-Bright, Summer-Light, Summer-Mute, Autumn-Mute, Autumn-Deep, Winter-Bright, Winter-Deep 중에서 가장 잘 맞는 퍼스널 컬러 타입 말해

2. 퍼스널 컬러 타입 Spring-Light, Spring-Bright, Summer-Light, Summer-Mute, Autumn-Mute, Autumn-Deep, Winter-Bright, Winter-Deep 중에서 가장 잘 맞지 않는 퍼스널 컬러 타입 말해

3. {prompt} 퍼스널 컬러에 맞는Skin Type analysis : 웜톤/뉴트럴/쿨톤 중 하나 선택

4. {prompt} 퍼스널 컬러에 맞는 PCCS Tone & circle : 대표 톤 4개로 나오게하는데 줄이지말고 light grayish, pale 이런식으로 나오게해

5. {prompt} 퍼스널 컬러에 맞는 Hair color : 4개 HEX값을 출력해

6. 5번에 나온 HEX값을 순서대로로 맞는 이름을 말해

7. {prompt} 퍼스널 컬러에 맞는 Hair tone : Dark / Medium dark / medium / medium light / light 중 1개 선택해

8. {prompt} 퍼스널 컬러에 맞는 Accessory 색상 추천 : 3개 출력해

9. {prompt} 퍼스널 컬러에 맞는 화장법 추천을 해주는데 답변을 자세하게 적어

답변은 한국어로 출력해주고
1번, 2번, 4번, 7번은 답이 정해져있으니까 영어로적어줘
"""
        return s_prompt



    async def get_personal_color_analysis(self, face_color: FaceColor) -> str:
        """Gemini API를 통한 퍼스널 컬러 분석 - 텍스트만 반환"""
        try:
            # 프롬프트 생성
            prompt = self.create_personal_color_prompt(face_color)
            # Gemini API 호출
            response = self.text_model.generate_content(prompt)
            # 텍스트 응답만 반환
            return response.text
            
        except Exception as e:
            return f"분석 중 오류가 발생했습니다: {str(e)}"


    async def get_personal_color_structured(self, prompt : str) -> PersonalColorAnalysis:        
        """구조화된 퍼스널 컬러 분석"""
        s_prompt = await self.create_analyze_structured(prompt)
        result = self.structured_model.create(
            response_model=PersonalColorAnalysis,
            messages=[{"role": "user", "content": s_prompt}]
        )
        return result
    

    
# 서비스 함수
async def analyze_personal_color(face_color: FaceColor) -> str:
    """퍼스널 컬러 분석 메인 함수 - 간단한 텍스트 반환"""
    consultant = GeminiColorConsultant()
    result = await consultant.get_personal_color_analysis(face_color)
    return result



async def structured_personal_color_analysis(prompt: PersonalColorResponse) -> PersonalColorAnalysis:
    """구조화된 퍼스널 컬러 분석 """
    consultant = GeminiColorConsultant()
    result = await consultant.get_personal_color_structured(prompt.personal_color_analysis)
    
    return result

