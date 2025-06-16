from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.router import router

app = FastAPI(title="퍼스널 컬러 분석 API", description="얼굴 이미지로 퍼스널 컬러를 분석합니다")

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# 라우터 등록
app.include_router(router)

# # 루트 경로에서 HTML 파일 제공
# @app.get("/")
# async def read_index():
#     return FileResponse('static/index.html')
