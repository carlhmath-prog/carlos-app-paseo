from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey, Table, Column, Integer, Text, Time, Date
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

walker_services = Table(
    "walker_services",
    db.metadata,
    Column("walker_id", ForeignKey("walker_profile.id"), primary_key=True),
    Column("service_id", ForeignKey("service.id"), primary_key=True),
    Column("price", Integer, nullable=False),
)

walker_zones = Table(
    "walker_zones",
    db.metadata,
    Column("walker_id", ForeignKey("walker_profile.id"), primary_key=True),
    Column("zone_id", ForeignKey("zone.id"), primary_key=True),
)

walker_pet_types = Table(
    "walker_pet_types",
    db.metadata,
    Column("walker_id", ForeignKey("walker_profile.id"), primary_key=True),
    Column("pet_type_id", ForeignKey("pet_type.id"), primary_key=True),
)


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="cliente")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            # do not serialize the password, its a security breach
        }


class Service(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    duration_minutes: Mapped[int] = mapped_column(
        Integer, nullable=False, default=60)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)

    def serialize(self):
        return {"id": self.id, "name": self.name, "description": self.description,
                "duration_minutes": self.duration_minutes, "is_active": self.is_active}


class Zone(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)

    def serialize(self):
        return {"id": self.id, "name": self.name, "city": self.city, "is_active": self.is_active}


class PetType(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)

    def serialize(self):
        return {"id": self.id, "name": self.name, "is_active": self.is_active}


class WalkerProfile(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text(), nullable=True)
    experience_years: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0)

    def serialize(self):
        return {"id": self.id, "user_id": self.user_id, "full_name": self.full_name,
                "phone": self.phone, "bio": self.bio, "experience_years": self.experience_years}


class WalkerAvailability(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    walker_id: Mapped[int] = mapped_column(
        ForeignKey("walker_profile.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[object] = mapped_column(Time(), nullable=False)
    end_time: Mapped[object] = mapped_column(Time(), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)

    def serialize(self):
        return {"id": self.id, "walker_id": self.walker_id, "day_of_week": self.day_of_week,
                "start_time": self.start_time.isoformat(), "end_time": self.end_time.isoformat(),
                "is_active": self.is_active}


class Reservation(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)
    walker_id: Mapped[int] = mapped_column(
        ForeignKey("walker_profile.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(
        ForeignKey("service.id"), nullable=False)
    reservation_date: Mapped[object] = mapped_column(Date(), nullable=False)
    reservation_time: Mapped[object] = mapped_column(Time(), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pendiente")

    def serialize(self):
        return {
            "id": self.id,
            "client_id": self.client_id,
            "walker_id": self.walker_id,
            "service_id": self.service_id,
            "reservation_date": self.reservation_date.isoformat(),
            "reservation_time": self.reservation_time.isoformat(),
            "status": self.status,
        }
