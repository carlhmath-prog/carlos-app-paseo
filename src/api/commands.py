
import click
from api.models import db, User, Service, Zone, PetType

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""


def setup_commands(app):
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users")  # name of our command
    @click.argument("count")  # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass

    @app.cli.command("insert-catalog-data")
    def insert_catalog_data():
        services = [
            ("Paseo grupal", "Paseo supervisado para grupos pequeños", 60),
            ("Paseo individual", "Atención exclusiva para tu mascota", 60),
            ("Cuidado a domicilio", "Visita, juegos y cuidados en casa", 60),
        ]
        zones = [("Centro", "Madrid"), ("Salamanca",
                                        "Madrid"), ("Chamberí", "Madrid")]
        pet_types = ["Perro", "Gato", "Cachorro", "Mascota senior"]
        for name, description, duration in services:
            if not Service.query.filter_by(name=name).first():
                db.session.add(Service(
                    name=name, description=description, duration_minutes=duration, is_active=True))
        for name, city in zones:
            if not Zone.query.filter_by(name=name).first():
                db.session.add(Zone(name=name, city=city, is_active=True))
        for name in pet_types:
            if not PetType.query.filter_by(name=name).first():
                db.session.add(PetType(name=name, is_active=True))
        db.session.commit()
        print("Catalog data created")
