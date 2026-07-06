import os
import psycopg2
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "todolist_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_PORT = os.getenv("DB_PORT", "5432")


def get_connection():
    try:
        return psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
        )
    except psycopg2.OperationalError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Không thể kết nối tới database. Kiểm tra lại file .env. Chi tiết: {e}",
        )
