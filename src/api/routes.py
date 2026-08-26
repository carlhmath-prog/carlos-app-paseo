"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from datetime import date, time
from flask import request, jsonify, Blueprint
from api.models import (
    db, User, Service, Zone, PetType, WalkerProfile, WalkerAvailability,
    Reservation, walker_services, walker_zones, walker_pet_types,
)
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


VALID_ROLES = {"cliente", "paseador", "admin"}


@api.route('/users', methods=['POST', 'GET'])
def handle_users():
    if request.method == 'GET':
        role = request.args.get('role')
        if role and role not in VALID_ROLES:
            raise APIException("Invalid role", 400)
        query = User.query.filter_by(role=role) if role else User.query
        return jsonify([user.serialize() for user in query.all()]), 200

    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password')
    role = data.get('role', 'cliente')
    if not email or not password or role not in VALID_ROLES:
        raise APIException(
            "email, password and a valid role are required", 400)
    if User.query.filter_by(email=email).first():
        raise APIException("Email already registered", 409)
    user = User(email=email, password=password, role=role, is_active=True)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.serialize()), 201


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password')
    user = User.query.filter_by(email=email, is_active=True).first()
    if not user or user.password != password:
        raise APIException("Correo o contraseña incorrectos", 401)
    return jsonify({"user": user.serialize()}), 200


def _catalog_response(model):
    return jsonify([item.serialize() for item in model.query.filter_by(is_active=True).all()]), 200


@api.route('/services', methods=['GET'])
def list_services():
    return _catalog_response(Service)


@api.route('/zones', methods=['GET'])
def list_zones():
    return _catalog_response(Zone)


@api.route('/pet-types', methods=['GET'])
def list_pet_types():
    return _catalog_response(PetType)


@api.route('/walkers', methods=['POST', 'GET'])
def handle_walkers():
    if request.method == 'GET':
        profiles = WalkerProfile.query.all()
        result = []
        for profile in profiles:
            item = profile.serialize()
            item['services'] = [
                {'id': service.id, 'name': service.name, 'price': price}
                for service, price in db.session.query(
                    Service, walker_services.c.price
                ).join(
                    walker_services, walker_services.c.service_id == Service.id
                ).filter(walker_services.c.walker_id == profile.id).all()
            ]
            item['zones'] = [
                {'id': zone.id, 'name': zone.name, 'city': zone.city}
                for zone in db.session.query(Zone).join(
                    walker_zones, walker_zones.c.zone_id == Zone.id
                ).filter(walker_zones.c.walker_id == profile.id).all()
            ]
            item['pet_types'] = [
                {'id': pet_type.id, 'name': pet_type.name}
                for pet_type in db.session.query(PetType).join(
                    walker_pet_types, walker_pet_types.c.pet_type_id == PetType.id
                ).filter(walker_pet_types.c.walker_id == profile.id).all()
            ]
            item['availability'] = [
                availability.serialize()
                for availability in WalkerAvailability.query.filter_by(
                    walker_id=profile.id, is_active=True
                ).order_by(WalkerAvailability.day_of_week).all()
            ]
            result.append(item)
        return jsonify(result), 200

    data = request.get_json(silent=True) or {}
    required = ('user_id', 'full_name')
    if any(not data.get(field) for field in required):
        raise APIException("user_id and full_name are required", 400)
    user = User.query.get(data['user_id'])
    if not user or user.role != 'paseador':
        raise APIException("The user must have the paseador role", 400)
    profile = WalkerProfile.query.filter_by(user_id=user.id).first()
    if profile:
        profile.full_name = data['full_name'].strip()
        profile.phone = data.get('phone')
        profile.bio = data.get('bio')
        profile.experience_years = data.get('experience_years', 0)
    else:
        profile = WalkerProfile(
            user_id=user.id,
            full_name=data['full_name'].strip(),
            phone=data.get('phone'),
            bio=data.get('bio'),
            experience_years=data.get('experience_years', 0),
        )
    db.session.add(profile)
    db.session.commit()
    return jsonify(profile.serialize()), 200 if profile.id else 201


@api.route('/walkers/<int:walker_id>/availability', methods=['POST'])
def create_walker_availability(walker_id):
    if not WalkerProfile.query.get(walker_id):
        raise APIException("Walker profile not found", 404)
    data = request.get_json(silent=True) or {}
    try:
        day = int(data['day_of_week'])
        start = time.fromisoformat(data['start_time'])
        end = time.fromisoformat(data['end_time'])
    except (KeyError, TypeError, ValueError):
        raise APIException(
            "day_of_week, start_time and end_time are required", 400)
    if day < 0 or day > 6 or start >= end:
        raise APIException("Invalid availability range", 400)
    availability = WalkerAvailability(
        walker_id=walker_id,
        day_of_week=day,
        start_time=start,
        end_time=end,
        is_active=True,
    )
    db.session.add(availability)
    db.session.commit()
    return jsonify(availability.serialize()), 201


@api.route('/walkers/<int:walker_id>/settings', methods=['POST'])
def configure_walker(walker_id):
    if not WalkerProfile.query.get(walker_id):
        raise APIException("Walker profile not found", 404)
    data = request.get_json(silent=True) or {}
    selected_services = data.get('services', [])
    selected_zones = data.get('zone_ids', [])
    selected_pet_types = data.get('pet_type_ids', [])
    availability = data.get('availability', [])
    if not selected_services or not selected_zones or not selected_pet_types or not availability:
        raise APIException(
            "Services, zones, pet types and availability are required", 400)

    try:
        db.session.execute(walker_services.delete().where(
            walker_services.c.walker_id == walker_id))
        db.session.execute(walker_zones.delete().where(
            walker_zones.c.walker_id == walker_id))
        db.session.execute(walker_pet_types.delete().where(
            walker_pet_types.c.walker_id == walker_id))
        WalkerAvailability.query.filter_by(walker_id=walker_id).delete()
        for service in selected_services:
            service_id = int(service['service_id'])
            price = int(service['price'])
            if price <= 0 or not Service.query.get(service_id):
                raise ValueError
            db.session.execute(walker_services.insert().values(
                walker_id=walker_id, service_id=service_id, price=price))
        for zone_id in selected_zones:
            if not Zone.query.get(int(zone_id)):
                raise ValueError
            db.session.execute(walker_zones.insert().values(
                walker_id=walker_id, zone_id=int(zone_id)))
        for pet_type_id in selected_pet_types:
            if not PetType.query.get(int(pet_type_id)):
                raise ValueError
            db.session.execute(walker_pet_types.insert().values(
                walker_id=walker_id, pet_type_id=int(pet_type_id)))
        for item in availability:
            day = int(item['day_of_week'])
            start = time.fromisoformat(item['start_time'])
            end = time.fromisoformat(item['end_time'])
            if day < 0 or day > 6 or start >= end:
                raise ValueError
            db.session.add(WalkerAvailability(
                walker_id=walker_id, day_of_week=day,
                start_time=start, end_time=end, is_active=True))
    except (KeyError, TypeError, ValueError):
        db.session.rollback()
        raise APIException(
            "Invalid services, zones, pet types or availability", 400)
    db.session.commit()
    return jsonify({"message": "Walker settings saved", "walker_id": walker_id}), 201


@api.route('/reservations', methods=['POST', 'GET'])
def handle_reservations():
    if request.method == 'GET':
        client_id = request.args.get('client_id', type=int)
        query = Reservation.query.filter_by(
            client_id=client_id) if client_id else Reservation.query
        return jsonify([reservation.serialize() for reservation in query.order_by(Reservation.reservation_date).all()]), 200

    data = request.get_json(silent=True) or {}
    required = ('client_id', 'walker_id', 'service_id',
                'reservation_date', 'reservation_time')
    if any(field not in data for field in required):
        raise APIException("All reservation fields are required", 400)
    client = User.query.get(data['client_id'])
    walker = WalkerProfile.query.get(data['walker_id'])
    service = Service.query.get(data['service_id'])
    if not client or client.role != 'cliente':
        raise APIException("The client_id must belong to a cliente", 400)
    if not walker or not service or not service.is_active:
        raise APIException("Walker or service not found", 404)
    try:
        reservation_date = date.fromisoformat(data['reservation_date'])
        reservation_time = time.fromisoformat(data['reservation_time'])
    except (TypeError, ValueError):
        raise APIException("Invalid reservation date or time", 400)
    if reservation_date < date.today():
        raise APIException("Reservation date must be in the future", 400)
    occupied = Reservation.query.filter_by(
        walker_id=walker.id,
        reservation_date=reservation_date,
        reservation_time=reservation_time,
    ).first()
    if occupied:
        raise APIException("This time is already reserved", 409)
    reservation = Reservation(
        client_id=client.id,
        walker_id=walker.id,
        service_id=service.id,
        reservation_date=reservation_date,
        reservation_time=reservation_time,
        status="pendiente",
    )
    db.session.add(reservation)
    db.session.commit()
    return jsonify(reservation.serialize()), 201
