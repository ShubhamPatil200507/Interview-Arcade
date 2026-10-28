"""
Interview Arcade — Security & Authentication Helpers
Modern bcrypt password hashing and PyJWT token generation.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
import jwt

from backend.core.config import settings


def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt with automatic salt generation."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against an existing bcrypt hash."""
    try:
      password_bytes = plain_password.encode("utf-8")
      hashed_bytes = hashed_password.encode("utf-8")
      return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
      return False


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token for a user subject."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    payload: Dict[str, Any] = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    }
    
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and cryptographically verifies a signed JWT token."""
    try:
        decoded = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return decoded
    except (jwt.PyJWTError, Exception):
        return None
