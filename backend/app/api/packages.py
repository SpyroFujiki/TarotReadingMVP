from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/packages", tags=["packages"])

PACKAGES = [
    {
        "id": 1,
        "name": "The Star",
        "description": "Giải đáp ngắn gọn một câu hỏi cụ thể",
        "price": 79000,
        "expected_response_minutes": 20,
    },
    {
        "id": 2,
        "name": "The Moon",
        "description": "Phân tích chi tiết 01 vấn đề cụ thể",
        "price": 149000,
        "expected_response_minutes": 60,
    },
    {
        "id": 3,
        "name": "The Sun",
        "description": "Trải bài chuyên sâu với phần giải thích mở rộng về 01 lĩnh vực.",
        "price": 299000,
        "expected_response_minutes": 120,
    },
]

@router.get("")
def list_packages():
    return PACKAGES

@router.get("/{package_id}")
def get_package(package_id: int):
    package = next((item for item in PACKAGES if item["id"] == package_id), None)

    if package is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy gói xem."
        )

    return package