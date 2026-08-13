import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.reading_package import ReadingPackage
from app.schemas.package import ReadingPackagePublic

router = APIRouter(prefix="/packages", tags=["packages"])


@router.get("", response_model=list[ReadingPackagePublic])
def list_packages(db: Session = Depends(get_db)) -> list[ReadingPackage]:
    packages = db.scalars(
        select(ReadingPackage).where(ReadingPackage.is_active.is_(True)).order_by(ReadingPackage.price.asc())
    ).all()
    return packages


@router.get("/{package_id}", response_model=ReadingPackagePublic)
def get_package(package_id: uuid.UUID, db: Session = Depends(get_db)) -> ReadingPackage:
    package = db.scalar(
        select(ReadingPackage).where(
            ReadingPackage.id == package_id,
            ReadingPackage.is_active.is_(True),
        )
    )

    if package is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy gói xem.",
        )

    return package