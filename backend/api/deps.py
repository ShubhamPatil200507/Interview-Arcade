"""
Interview Arcade — API Dependencies & Authentication Resolvers
Enforces JWT verification, token extraction, and user ownership.
"""

from typing import Optional, Generator
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.core.database import SessionLocal
from backend.core.security import decode_access_token
from backend.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_db() -> Generator[Session, None, None]:
    """Provides a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_token_from_request(request: Request, bearer_token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """Extracts JWT token from either the Authorization header or an HTTP cookie."""
    if bearer_token:
        return bearer_token
    # Fallback to cookie
    cookie_token = request.cookies.get("ia_auth_token")
    if cookie_token:
        return cookie_token
    return None


def get_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> User:
    """
    Validates token and returns authenticated user instance.
    Raises HTTP 401 if token is missing, expired, or invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication credentials could not be validated or have expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception

    return user


def get_optional_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Returns the authenticated user if valid credentials exist, or None if anonymous."""
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    try:
        user_id = int(payload.get("sub", ""))
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None
