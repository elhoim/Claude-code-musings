"""
Authentication and Authorization module
"""

import hashlib
import secrets
from functools import wraps
from flask import request, jsonify
from database import get_db_connection_simple


def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == password_hash


def get_user_by_api_key(api_key: str):
    """Get user information by API key"""
    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT u.id, u.username, u.is_admin, u.is_active,
               ak.permissions, ak.is_active as key_active
        FROM users u
        JOIN api_keys ak ON u.id = ak.user_id
        WHERE ak.key_value = ?
    """, (api_key,))

    result = cursor.fetchone()
    conn.close()

    if result and result['is_active'] and result['key_active']:
        return {
            'user_id': result['id'],
            'username': result['username'],
            'is_admin': result['is_admin'],
            'permissions': result['permissions']
        }
    return None


def require_api_key(permissions_required=None):
    """Decorator to require API key authentication"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            api_key = request.headers.get('X-API-Key')

            if not api_key:
                return jsonify({'error': 'API key required'}), 401

            user = get_user_by_api_key(api_key)

            if not user:
                return jsonify({'error': 'Invalid or inactive API key'}), 401

            # Check permissions if required
            if permissions_required == 'write' and user['permissions'] != 'read_write':
                return jsonify({'error': 'Insufficient permissions'}), 403

            # Add user info to request context
            request.user = user

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def require_admin():
    """Decorator to require admin privileges"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            api_key = request.headers.get('X-API-Key')

            if not api_key:
                return jsonify({'error': 'API key required'}), 401

            user = get_user_by_api_key(api_key)

            if not user:
                return jsonify({'error': 'Invalid or inactive API key'}), 401

            if not user['is_admin']:
                return jsonify({'error': 'Admin privileges required'}), 403

            request.user = user

            return f(*args, **kwargs)
        return decorated_function
    return decorator
