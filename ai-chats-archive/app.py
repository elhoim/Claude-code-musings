"""
AI Chats Archive - Main Flask Application
REST API for managing AI agent chat archives
"""

from flask import Flask, request, jsonify, render_template_string, send_file
from datetime import datetime
import base64
import io
from database import (
    init_database, get_db_connection, get_db_connection_simple,
    generate_api_key, generate_internal_uuid
)
from auth import (
    hash_password, verify_password, require_api_key, require_admin
)

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False


# ============================================================================
# USER MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/users/register', methods=['POST'])
def register_user():
    """Register a new user (first user becomes admin)"""
    data = request.json

    if not all(k in data for k in ['username', 'password', 'email']):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Check if this is the first user
            cursor.execute("SELECT COUNT(*) as count FROM users")
            user_count = cursor.fetchone()['count']
            is_admin = 1 if user_count == 0 else 0

            # Insert new user
            password_hash = hash_password(data['password'])
            cursor.execute("""
                INSERT INTO users (username, password_hash, email, is_admin)
                VALUES (?, ?, ?, ?)
            """, (data['username'], password_hash, data['email'], is_admin))

            user_id = cursor.lastrowid

            # Create a default API key
            api_key = generate_api_key()
            cursor.execute("""
                INSERT INTO api_keys (user_id, key_value, key_name, permissions)
                VALUES (?, ?, ?, ?)
            """, (user_id, api_key, 'Default Key', 'read_write'))

            return jsonify({
                'message': 'User registered successfully',
                'user_id': user_id,
                'is_admin': bool(is_admin),
                'api_key': api_key
            }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/users/login', methods=['POST'])
def login_user():
    """Login user and return their API keys"""
    data = request.json

    if not all(k in data for k in ['username', 'password']):
        return jsonify({'error': 'Missing username or password'}), 400

    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, username, password_hash, is_admin, is_active
        FROM users WHERE username = ?
    """, (data['username'],))

    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(data['password'], user['password_hash']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user['is_active']:
        return jsonify({'error': 'User account is disabled'}), 403

    # Get user's API keys
    conn = get_db_connection_simple()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, key_value, key_name, permissions, is_active, created_at
        FROM api_keys WHERE user_id = ?
    """, (user['id'],))

    api_keys = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({
        'user_id': user['id'],
        'username': user['username'],
        'is_admin': bool(user['is_admin']),
        'api_keys': api_keys
    }), 200


# ============================================================================
# API KEY MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/keys', methods=['POST'])
@require_api_key()
def create_api_key():
    """Create a new API key for the current user"""
    data = request.json
    user = request.user

    if not all(k in data for k in ['key_name', 'permissions']):
        return jsonify({'error': 'Missing required fields'}), 400

    if data['permissions'] not in ['read', 'read_write']:
        return jsonify({'error': 'Invalid permissions value'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            api_key = generate_api_key()

            cursor.execute("""
                INSERT INTO api_keys (user_id, key_value, key_name, permissions)
                VALUES (?, ?, ?, ?)
            """, (user['user_id'], api_key, data['key_name'], data['permissions']))

            return jsonify({
                'message': 'API key created successfully',
                'api_key': api_key,
                'key_name': data['key_name'],
                'permissions': data['permissions']
            }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/keys', methods=['GET'])
@require_api_key()
def list_api_keys():
    """List all API keys for the current user"""
    user = request.user

    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, key_value, key_name, permissions, is_active, created_at
        FROM api_keys WHERE user_id = ?
    """, (user['user_id'],))

    keys = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'api_keys': keys}), 200


@app.route('/api/keys/<int:key_id>', methods=['DELETE'])
@require_api_key()
def delete_api_key(key_id):
    """Delete an API key"""
    user = request.user

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Check ownership
            cursor.execute("""
                SELECT user_id FROM api_keys WHERE id = ?
            """, (key_id,))

            key = cursor.fetchone()
            if not key:
                return jsonify({'error': 'API key not found'}), 404

            if key['user_id'] != user['user_id'] and not user['is_admin']:
                return jsonify({'error': 'Unauthorized'}), 403

            cursor.execute("DELETE FROM api_keys WHERE id = ?", (key_id,))

            return jsonify({'message': 'API key deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# AI AGENTS ENDPOINTS
# ============================================================================

@app.route('/api/agents', methods=['GET'])
@require_api_key()
def list_ai_agents():
    """List all available AI agents"""
    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, description FROM ai_agents")
    agents = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'ai_agents': agents}), 200


# ============================================================================
# CHAT MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/chats', methods=['POST'])
@require_api_key(permissions_required='write')
def create_chat():
    """Create a new chat archive"""
    data = request.json
    user = request.user

    required_fields = ['ai_agent_id', 'external_chat_id', 'chat_start_time']
    if not all(k in data for k in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Verify AI agent exists
            cursor.execute("SELECT id FROM ai_agents WHERE id = ?", (data['ai_agent_id'],))
            if not cursor.fetchone():
                return jsonify({'error': 'Invalid AI agent ID'}), 400

            internal_uuid = generate_internal_uuid()
            chat_end_time = data.get('chat_end_time')

            cursor.execute("""
                INSERT INTO chats (user_id, ai_agent_id, external_chat_id,
                                   internal_uuid, chat_start_time, chat_end_time)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user['user_id'], data['ai_agent_id'], data['external_chat_id'],
                  internal_uuid, data['chat_start_time'], chat_end_time))

            chat_id = cursor.lastrowid

            return jsonify({
                'message': 'Chat created successfully',
                'chat_id': chat_id,
                'internal_uuid': internal_uuid
            }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/chats', methods=['GET'])
@require_api_key()
def list_chats():
    """List all chats for the current user"""
    user = request.user

    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.id, c.internal_uuid, c.external_chat_id, c.chat_start_time,
               c.chat_end_time, c.created_at, a.name as ai_agent_name
        FROM chats c
        JOIN ai_agents a ON c.ai_agent_id = a.id
        WHERE c.user_id = ?
        ORDER BY c.chat_start_time DESC
    """, (user['user_id'],))

    chats = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'chats': chats}), 200


@app.route('/api/chats/<chat_uuid>', methods=['GET'])
@require_api_key()
def get_chat(chat_uuid):
    """Get a specific chat by UUID"""
    user = request.user

    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.id, c.user_id, c.internal_uuid, c.external_chat_id,
               c.chat_start_time, c.chat_end_time, c.created_at,
               a.name as ai_agent_name
        FROM chats c
        JOIN ai_agents a ON c.ai_agent_id = a.id
        WHERE c.internal_uuid = ?
    """, (chat_uuid,))

    chat = cursor.fetchone()
    conn.close()

    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    # Check access permissions
    if chat['user_id'] != user['user_id'] and not user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify(dict(chat)), 200


@app.route('/api/chats/<chat_uuid>', methods=['PUT'])
@require_api_key(permissions_required='write')
def update_chat(chat_uuid):
    """Update a chat (e.g., set end time)"""
    data = request.json
    user = request.user

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Check ownership
            cursor.execute("SELECT id, user_id FROM chats WHERE internal_uuid = ?", (chat_uuid,))
            chat = cursor.fetchone()

            if not chat:
                return jsonify({'error': 'Chat not found'}), 404

            if chat['user_id'] != user['user_id'] and not user['is_admin']:
                return jsonify({'error': 'Unauthorized'}), 403

            # Update chat_end_time if provided
            if 'chat_end_time' in data:
                cursor.execute("""
                    UPDATE chats SET chat_end_time = ? WHERE id = ?
                """, (data['chat_end_time'], chat['id']))

            return jsonify({'message': 'Chat updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# MESSAGE ENDPOINTS
# ============================================================================

@app.route('/api/chats/<chat_uuid>/messages', methods=['POST'])
@require_api_key(permissions_required='write')
def add_message(chat_uuid):
    """Add a message to a chat"""
    data = request.json
    user = request.user

    required_fields = ['message_type', 'content', 'timestamp', 'sequence_number']
    if not all(k in data for k in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    if data['message_type'] not in ['user', 'ai']:
        return jsonify({'error': 'Invalid message_type'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Get chat and verify ownership
            cursor.execute("SELECT id, user_id FROM chats WHERE internal_uuid = ?", (chat_uuid,))
            chat = cursor.fetchone()

            if not chat:
                return jsonify({'error': 'Chat not found'}), 404

            if chat['user_id'] != user['user_id'] and not user['is_admin']:
                return jsonify({'error': 'Unauthorized'}), 403

            cursor.execute("""
                INSERT INTO messages (chat_id, message_type, content, timestamp, sequence_number)
                VALUES (?, ?, ?, ?, ?)
            """, (chat['id'], data['message_type'], data['content'],
                  data['timestamp'], data['sequence_number']))

            message_id = cursor.lastrowid

            return jsonify({
                'message': 'Message added successfully',
                'message_id': message_id
            }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/chats/<chat_uuid>/messages', methods=['GET'])
@require_api_key()
def get_messages(chat_uuid):
    """Get all messages for a chat"""
    user = request.user

    conn = get_db_connection_simple()
    cursor = conn.cursor()

    # Get chat and verify access
    cursor.execute("SELECT id, user_id FROM chats WHERE internal_uuid = ?", (chat_uuid,))
    chat = cursor.fetchone()

    if not chat:
        conn.close()
        return jsonify({'error': 'Chat not found'}), 404

    if chat['user_id'] != user['user_id'] and not user['is_admin']:
        conn.close()
        return jsonify({'error': 'Unauthorized'}), 403

    cursor.execute("""
        SELECT id, message_type, content, timestamp, sequence_number, created_at
        FROM messages
        WHERE chat_id = ?
        ORDER BY sequence_number ASC
    """, (chat['id'],))

    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'messages': messages}), 200


# ============================================================================
# ARTIFACT ENDPOINTS
# ============================================================================

@app.route('/api/chats/<chat_uuid>/artifacts', methods=['POST'])
@require_api_key(permissions_required='write')
def add_artifact(chat_uuid):
    """Add an artifact to a chat"""
    data = request.json
    user = request.user

    required_fields = ['artifact_name', 'artifact_type', 'artifact_data', 'timestamp']
    if not all(k in data for k in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Get chat and verify ownership
            cursor.execute("SELECT id, user_id FROM chats WHERE internal_uuid = ?", (chat_uuid,))
            chat = cursor.fetchone()

            if not chat:
                return jsonify({'error': 'Chat not found'}), 404

            if chat['user_id'] != user['user_id'] and not user['is_admin']:
                return jsonify({'error': 'Unauthorized'}), 403

            # Check if artifact already exists (for versioning)
            cursor.execute("""
                SELECT MAX(version) as max_version FROM artifacts
                WHERE chat_id = ? AND artifact_name = ?
            """, (chat['id'], data['artifact_name']))

            result = cursor.fetchone()
            version = (result['max_version'] or 0) + 1

            # Decode base64 artifact data
            artifact_data = base64.b64decode(data['artifact_data'])

            cursor.execute("""
                INSERT INTO artifacts (chat_id, message_id, artifact_name, artifact_type,
                                       artifact_data, version, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (chat['id'], data.get('message_id'), data['artifact_name'],
                  data['artifact_type'], artifact_data, version, data['timestamp']))

            artifact_id = cursor.lastrowid

            return jsonify({
                'message': 'Artifact added successfully',
                'artifact_id': artifact_id,
                'version': version
            }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/chats/<chat_uuid>/artifacts', methods=['GET'])
@require_api_key()
def get_artifacts(chat_uuid):
    """Get all artifacts for a chat"""
    user = request.user

    conn = get_db_connection_simple()
    cursor = conn.cursor()

    # Get chat and verify access
    cursor.execute("SELECT id, user_id FROM chats WHERE internal_uuid = ?", (chat_uuid,))
    chat = cursor.fetchone()

    if not chat:
        conn.close()
        return jsonify({'error': 'Chat not found'}), 404

    if chat['user_id'] != user['user_id'] and not user['is_admin']:
        conn.close()
        return jsonify({'error': 'Unauthorized'}), 403

    cursor.execute("""
        SELECT id, message_id, artifact_name, artifact_type, version, timestamp, created_at
        FROM artifacts
        WHERE chat_id = ?
        ORDER BY timestamp ASC, version ASC
    """, (chat['id'],))

    artifacts = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'artifacts': artifacts}), 200


@app.route('/api/artifacts/<int:artifact_id>/download', methods=['GET'])
@require_api_key()
def download_artifact(artifact_id):
    """Download an artifact"""
    user = request.user

    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT a.artifact_name, a.artifact_type, a.artifact_data, c.user_id
        FROM artifacts a
        JOIN chats c ON a.chat_id = c.id
        WHERE a.id = ?
    """, (artifact_id,))

    artifact = cursor.fetchone()
    conn.close()

    if not artifact:
        return jsonify({'error': 'Artifact not found'}), 404

    if artifact['user_id'] != user['user_id'] and not user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403

    return send_file(
        io.BytesIO(artifact['artifact_data']),
        mimetype=artifact['artifact_type'],
        as_attachment=True,
        download_name=artifact['artifact_name']
    )


# ============================================================================
# CONVERSATION RENDERING ENDPOINT
# ============================================================================

@app.route('/api/chats/<chat_uuid>/conversation', methods=['GET'])
@require_api_key()
def get_conversation(chat_uuid):
    """Get complete conversation with messages and artifacts in chronological order"""
    user = request.user

    conn = get_db_connection_simple()
    cursor = conn.cursor()

    # Get chat and verify access
    cursor.execute("""
        SELECT c.id, c.user_id, c.internal_uuid, c.external_chat_id,
               c.chat_start_time, c.chat_end_time, a.name as ai_agent_name
        FROM chats c
        JOIN ai_agents a ON c.ai_agent_id = a.id
        WHERE c.internal_uuid = ?
    """, (chat_uuid,))

    chat = cursor.fetchone()

    if not chat:
        conn.close()
        return jsonify({'error': 'Chat not found'}), 404

    if chat['user_id'] != user['user_id'] and not user['is_admin']:
        conn.close()
        return jsonify({'error': 'Unauthorized'}), 403

    # Get messages
    cursor.execute("""
        SELECT id, message_type, content, timestamp, sequence_number
        FROM messages
        WHERE chat_id = ?
        ORDER BY sequence_number ASC
    """, (chat['id'],))

    messages = [dict(row) for row in cursor.fetchall()]

    # Get artifacts
    cursor.execute("""
        SELECT id, message_id, artifact_name, artifact_type, version, timestamp
        FROM artifacts
        WHERE chat_id = ?
        ORDER BY timestamp ASC, version ASC
    """, (chat['id'],))

    artifacts = [dict(row) for row in cursor.fetchall()]
    conn.close()

    # Combine and sort by timestamp
    conversation_items = []

    for msg in messages:
        conversation_items.append({
            'type': 'message',
            'message_type': msg['message_type'],
            'content': msg['content'],
            'timestamp': msg['timestamp'],
            'sequence_number': msg['sequence_number'],
            'message_id': msg['id']
        })

    for artifact in artifacts:
        conversation_items.append({
            'type': 'artifact',
            'artifact_id': artifact['id'],
            'artifact_name': artifact['artifact_name'],
            'artifact_type': artifact['artifact_type'],
            'version': artifact['version'],
            'timestamp': artifact['timestamp'],
            'message_id': artifact['message_id']
        })

    # Sort by timestamp
    conversation_items.sort(key=lambda x: x['timestamp'])

    return jsonify({
        'chat': dict(chat),
        'conversation': conversation_items
    }), 200


# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.route('/api/admin/users', methods=['GET'])
@require_admin()
def admin_list_users():
    """Admin: List all users"""
    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, username, email, is_admin, is_active, created_at
        FROM users
        ORDER BY created_at DESC
    """)

    users = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'users': users}), 200


@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@require_admin()
def admin_update_user(user_id):
    """Admin: Update user status"""
    data = request.json

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            if 'is_active' in data:
                cursor.execute("""
                    UPDATE users SET is_active = ? WHERE id = ?
                """, (1 if data['is_active'] else 0, user_id))

            return jsonify({'message': 'User updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@require_admin()
def admin_delete_user(user_id):
    """Admin: Delete a user"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Prevent deleting the last admin
            cursor.execute("SELECT is_admin FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()

            if user and user['is_admin']:
                cursor.execute("SELECT COUNT(*) as count FROM users WHERE is_admin = 1")
                admin_count = cursor.fetchone()['count']
                if admin_count <= 1:
                    return jsonify({'error': 'Cannot delete the last admin user'}), 400

            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

            return jsonify({'message': 'User deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/admin/users/<int:user_id>/chats', methods=['GET'])
@require_admin()
def admin_get_user_chats(user_id):
    """Admin: Get all chats for a specific user"""
    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.id, c.internal_uuid, c.external_chat_id, c.chat_start_time,
               c.chat_end_time, c.created_at, a.name as ai_agent_name
        FROM chats c
        JOIN ai_agents a ON c.ai_agent_id = a.id
        WHERE c.user_id = ?
        ORDER BY c.chat_start_time DESC
    """, (user_id,))

    chats = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'chats': chats}), 200


@app.route('/api/admin/users/<int:user_id>/keys', methods=['GET'])
@require_admin()
def admin_get_user_keys(user_id):
    """Admin: Get all API keys for a specific user"""
    conn = get_db_connection_simple()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, key_value, key_name, permissions, is_active, created_at
        FROM api_keys WHERE user_id = ?
    """, (user_id,))

    keys = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'api_keys': keys}), 200


@app.route('/api/admin/keys/<int:key_id>/disable', methods=['PUT'])
@require_admin()
def admin_disable_key(key_id):
    """Admin: Disable an API key"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE api_keys SET is_active = 0 WHERE id = ?", (key_id,))
            return jsonify({'message': 'API key disabled successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# WEB INTERFACE
# ============================================================================

@app.route('/')
def index():
    """Main web interface"""
    html = """
<!DOCTYPE html>
<html>
<head>
    <title>AI Chats Archive</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background-color: #0056b3;
        }
        .section {
            display: none;
        }
        .section.active {
            display: block;
        }
        .nav {
            margin-bottom: 20px;
        }
        .nav button {
            margin-right: 10px;
            background-color: #6c757d;
        }
        .nav button.active {
            background-color: #007bff;
        }
        .success {
            color: green;
            margin-top: 10px;
        }
        .error {
            color: red;
            margin-top: 10px;
        }
        .api-key-display {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-top: 10px;
            word-break: break-all;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .action-btn {
            background-color: #dc3545;
            padding: 5px 10px;
            font-size: 12px;
        }
        .action-btn:hover {
            background-color: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Chats Archive</h1>

        <div class="nav">
            <button onclick="showSection('register')" id="nav-register">Register</button>
            <button onclick="showSection('login')" id="nav-login">Login</button>
            <button onclick="showSection('keys')" id="nav-keys" style="display:none;">API Keys</button>
            <button onclick="showSection('admin')" id="nav-admin" style="display:none;">Admin</button>
        </div>

        <!-- Register Section -->
        <div id="register-section" class="section active">
            <h2>Register New User</h2>
            <div class="form-group">
                <label>Username:</label>
                <input type="text" id="reg-username">
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="reg-email">
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" id="reg-password">
            </div>
            <button onclick="register()">Register</button>
            <div id="reg-message"></div>
        </div>

        <!-- Login Section -->
        <div id="login-section" class="section">
            <h2>Login</h2>
            <div class="form-group">
                <label>Username:</label>
                <input type="text" id="login-username">
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" id="login-password">
            </div>
            <button onclick="login()">Login</button>
            <div id="login-message"></div>
        </div>

        <!-- API Keys Section -->
        <div id="keys-section" class="section">
            <h2>API Key Management</h2>
            <p>Current User: <strong id="current-user"></strong></p>

            <h3>Create New API Key</h3>
            <div class="form-group">
                <label>Key Name:</label>
                <input type="text" id="key-name">
            </div>
            <div class="form-group">
                <label>Permissions:</label>
                <select id="key-permissions">
                    <option value="read">Read Only</option>
                    <option value="read_write">Read/Write</option>
                </select>
            </div>
            <button onclick="createApiKey()">Create API Key</button>
            <div id="key-message"></div>

            <h3>Your API Keys</h3>
            <div id="keys-list"></div>
        </div>

        <!-- Admin Section -->
        <div id="admin-section" class="section">
            <h2>Admin Panel</h2>
            <h3>All Users</h3>
            <div id="users-list"></div>
        </div>
    </div>

    <script>
        let currentApiKey = null;
        let currentUser = null;

        function showSection(section) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));

            document.getElementById(section + '-section').classList.add('active');
            document.getElementById('nav-' + section).classList.add('active');
        }

        async function register() {
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            try {
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    document.getElementById('reg-message').innerHTML = `
                        <div class="success">
                            <p>Registration successful!</p>
                            <div class="api-key-display">
                                <strong>Your API Key:</strong><br>
                                ${data.api_key}
                            </div>
                            <p>Save this key! You'll need it to access the API.</p>
                            ${data.is_admin ? '<p><strong>You are the first user and have admin privileges.</strong></p>' : ''}
                        </div>
                    `;
                } else {
                    document.getElementById('reg-message').innerHTML = `<div class="error">Error: ${data.error}</div>`;
                }
            } catch (error) {
                document.getElementById('reg-message').innerHTML = `<div class="error">Error: ${error.message}</div>`;
            }
        }

        async function login() {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    currentUser = data;
                    if (data.api_keys.length > 0) {
                        currentApiKey = data.api_keys[0].key_value;
                    }

                    document.getElementById('login-message').innerHTML = '<div class="success">Login successful!</div>';
                    document.getElementById('current-user').textContent = data.username;

                    // Show appropriate navigation
                    document.getElementById('nav-keys').style.display = 'inline-block';
                    if (data.is_admin) {
                        document.getElementById('nav-admin').style.display = 'inline-block';
                    }

                    showSection('keys');
                    loadApiKeys();

                    if (data.is_admin) {
                        loadUsers();
                    }
                } else {
                    document.getElementById('login-message').innerHTML = `<div class="error">Error: ${data.error}</div>`;
                }
            } catch (error) {
                document.getElementById('login-message').innerHTML = `<div class="error">Error: ${error.message}</div>`;
            }
        }

        async function createApiKey() {
            const keyName = document.getElementById('key-name').value;
            const permissions = document.getElementById('key-permissions').value;

            try {
                const response = await fetch('/api/keys', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': currentApiKey
                    },
                    body: JSON.stringify({ key_name: keyName, permissions })
                });

                const data = await response.json();

                if (response.ok) {
                    document.getElementById('key-message').innerHTML = `
                        <div class="success">
                            <p>API Key created successfully!</p>
                            <div class="api-key-display">
                                <strong>New API Key:</strong><br>
                                ${data.api_key}
                            </div>
                        </div>
                    `;
                    loadApiKeys();
                } else {
                    document.getElementById('key-message').innerHTML = `<div class="error">Error: ${data.error}</div>`;
                }
            } catch (error) {
                document.getElementById('key-message').innerHTML = `<div class="error">Error: ${error.message}</div>`;
            }
        }

        async function loadApiKeys() {
            try {
                const response = await fetch('/api/keys', {
                    headers: { 'X-API-Key': currentApiKey }
                });

                const data = await response.json();

                if (response.ok) {
                    let html = '<table><tr><th>Name</th><th>Permissions</th><th>Active</th><th>Created</th><th>Actions</th></tr>';
                    data.api_keys.forEach(key => {
                        html += `<tr>
                            <td>${key.key_name}</td>
                            <td>${key.permissions}</td>
                            <td>${key.is_active ? 'Yes' : 'No'}</td>
                            <td>${key.created_at}</td>
                            <td><button class="action-btn" onclick="deleteApiKey(${key.id})">Delete</button></td>
                        </tr>`;
                    });
                    html += '</table>';
                    document.getElementById('keys-list').innerHTML = html;
                }
            } catch (error) {
                console.error('Error loading API keys:', error);
            }
        }

        async function deleteApiKey(keyId) {
            if (!confirm('Are you sure you want to delete this API key?')) return;

            try {
                const response = await fetch(`/api/keys/${keyId}`, {
                    method: 'DELETE',
                    headers: { 'X-API-Key': currentApiKey }
                });

                if (response.ok) {
                    loadApiKeys();
                }
            } catch (error) {
                console.error('Error deleting API key:', error);
            }
        }

        async function loadUsers() {
            try {
                const response = await fetch('/api/admin/users', {
                    headers: { 'X-API-Key': currentApiKey }
                });

                const data = await response.json();

                if (response.ok) {
                    let html = '<table><tr><th>Username</th><th>Email</th><th>Admin</th><th>Active</th><th>Created</th><th>Actions</th></tr>';
                    data.users.forEach(user => {
                        html += `<tr>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.is_admin ? 'Yes' : 'No'}</td>
                            <td>${user.is_active ? 'Yes' : 'No'}</td>
                            <td>${user.created_at}</td>
                            <td>
                                ${user.is_active ?
                                    `<button class="action-btn" onclick="toggleUserStatus(${user.id}, false)">Disable</button>` :
                                    `<button class="action-btn" onclick="toggleUserStatus(${user.id}, true)">Enable</button>`
                                }
                                <button class="action-btn" onclick="deleteUser(${user.id})">Delete</button>
                            </td>
                        </tr>`;
                    });
                    html += '</table>';
                    document.getElementById('users-list').innerHTML = html;
                }
            } catch (error) {
                console.error('Error loading users:', error);
            }
        }

        async function toggleUserStatus(userId, active) {
            try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': currentApiKey
                    },
                    body: JSON.stringify({ is_active: active })
                });

                if (response.ok) {
                    loadUsers();
                }
            } catch (error) {
                console.error('Error updating user:', error);
            }
        }

        async function deleteUser(userId) {
            if (!confirm('Are you sure you want to delete this user? All their data will be removed.')) return;

            try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'X-API-Key': currentApiKey }
                });

                if (response.ok) {
                    loadUsers();
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    </script>
</body>
</html>
    """
    return render_template_string(html)


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    # Initialize database
    init_database()
    print("Database initialized successfully!")
    print("Starting AI Chats Archive server...")
    print("Access the web interface at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
