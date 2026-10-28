"""
Interview Arcade — Authentication Endpoints
Handles user registration, login with bcrypt verification, and token issuance.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.api.deps import get_db, get_current_user
from backend.core.security import hash_password, verify_password, create_access_token
from backend.models.user import User
from backend.schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserRegisterRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Registers a new student account, hashes the password, and returns an access token."""
    username = payload.username.strip()
    email = payload.email.strip().lower()

    # Check if username or email is already registered
    existing_user = db.query(User).filter(
        (func.lower(User.email) == email) | (func.lower(User.username) == username.lower())
    ).first()

    if existing_user:
        if existing_user.email.lower() == email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A student account with this email address already exists."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken. Please choose another."
            )

    # Hash password with bcrypt
    hashed_pwd = hash_password(payload.password)

    new_user = User(
        username=username,
        email=email,
        hashed_password=hashed_pwd,
        target_role=payload.target_role or "backend"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate access token
    token = create_access_token(subject=str(new_user.id))

    # Set secure HTTP cookie
    response.set_cookie(
        key="ia_auth_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False  # Allow local development HTTP
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=TokenResponse)
def login(
    payload: UserLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Authenticates credentials using bcrypt and returns an access token."""
    login_id = (payload.email or payload.username or payload.identifier or "").strip().lower()

    if not login_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide your username or email address."
        )

    user = db.query(User).filter(
        (func.lower(User.email) == login_id) | (func.lower(User.username) == login_id)
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password combination."
        )

    token = create_access_token(subject=str(user.id))

    response.set_cookie(
        key="ia_auth_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated student's profile."""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout(response: Response):
    """Clears the authentication session cookie."""
    response.delete_cookie(key="ia_auth_token")
    return {"message": "Successfully logged out."}
