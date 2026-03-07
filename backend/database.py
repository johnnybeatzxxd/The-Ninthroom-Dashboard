import os
from peewee import PostgresqlDatabase
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL", "")

if db_url:
    # Basic parsing for peewee if using connection string, or rely on individual env variables
    # We will use individual vars for robustness
    db_name = os.getenv("POSTGRES_DB", "ninthroom")
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_password = os.getenv("POSTGRES_PASSWORD", "postgres")
    db_host = "db" if "db" in db_url else "localhost"
    db_port = 5432
else:
    # Default local dev fallbacks
    db_name = os.getenv("POSTGRES_DB", "ninthroom")
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_password = os.getenv("POSTGRES_PASSWORD", "postgres")
    db_host = "localhost" # Assume local if not in docker network explicitly early on
    db_port = 5432

db = PostgresqlDatabase(
    db_name,
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port,
    autorollback=True
)
