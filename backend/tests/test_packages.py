from uuid import uuid4

from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.models.reading_package import ReadingPackage

client = TestClient(app)


def test_list_packages_returns_db_packages():
    package_name = f"Package {uuid4()}"

    with SessionLocal() as session:
        package = ReadingPackage(
            name=package_name,
            description="Test package description",
            price=99000,
            expected_response_minutes=45,
            is_active=True,
        )
        session.add(package)
        session.commit()
        session.refresh(package)
        package_id = str(package.id)

    response = client.get("/packages")

    assert response.status_code == 200
    payload = response.json()
    assert any(item["name"] == package_name for item in payload)
    assert any(item["id"] == package_id for item in payload)


def test_get_package_returns_detail_for_existing_package():
    package_name = f"Package detail {uuid4()}"

    with SessionLocal() as session:
        package = ReadingPackage(
            name=package_name,
            description="Detail test package",
            price=120000,
            expected_response_minutes=90,
            is_active=True,
        )
        session.add(package)
        session.commit()
        session.refresh(package)
        package_id = str(package.id)

    response = client.get(f"/packages/{package_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == package_id
    assert body["name"] == package_name


def test_get_package_returns_404_for_missing_package():
    response = client.get(f"/packages/{uuid4()}")

    assert response.status_code == 404
