document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("upload-form");
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById("file-input");
        const resultDiv = document.getElementById("result");

        if (!fileInput.files.length) {
            alert("파일을 선택해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        try {
            const response = await fetch("/face", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("서버 오류");

            const data = await response.json();
            console.log("서버 응답:", data);

            // 결과 화면에 표시
            resultDiv.innerHTML = `
                <h3>분석 결과:</h3>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        } catch (err) {
            console.error("업로드 실패:", err);
            resultDiv.innerText = "업로드 실패: " + err.message;
        }
    });
});