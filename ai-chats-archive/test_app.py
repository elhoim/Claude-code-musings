"""
Comprehensive Unit Test Suite for AI Chats Archive
Tests all API endpoints and database functionality
"""

import pytest
import json
import base64
import os
from datetime import datetime
from app import app
from database import init_database, DATABASE_FILE


@pytest.fixture
def client():
    """Create a test client"""
    # Use a test database
    global DATABASE_FILE
    test_db = 'test_ai_chats_archive.db'

    # Remove old test database if exists
    if os.path.exists(test_db):
        os.remove(test_db)

    # Update database file path
    import database
    database.DATABASE_FILE = test_db
    import app as app_module
    app_module.DATABASE_FILE = test_db

    # Initialize test database
    init_database()

    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

    # Cleanup
    if os.path.exists(test_db):
        os.remove(test_db)
    if os.path.exists(test_db + '-wal'):
        os.remove(test_db + '-wal')
    if os.path.exists(test_db + '-shm'):
        os.remove(test_db + '-shm')


class TestUserManagement:
    """Test user registration and login"""

    def test_register_first_user_becomes_admin(self, client):
        """First user should become admin"""
        response = client.post('/api/users/register', json={
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'password123'
        })

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['is_admin'] is True
        assert 'api_key' in data
        assert data['api_key'].startswith('aica_')

    def test_register_second_user_not_admin(self, client):
        """Second user should not be admin"""
        # Register first user
        client.post('/api/users/register', json={
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'password123'
        })

        # Register second user
        response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['is_admin'] is False

    def test_register_duplicate_username(self, client):
        """Cannot register duplicate username"""
        client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })

        response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'different@example.com',
            'password': 'password123'
        })

        assert response.status_code == 400

    def test_register_missing_fields(self, client):
        """Registration should fail with missing fields"""
        response = client.post('/api/users/register', json={
            'username': 'user1'
        })

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_login_success(self, client):
        """Successful login"""
        # Register user
        client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })

        # Login
        response = client.post('/api/users/login', json={
            'username': 'user1',
            'password': 'password123'
        })

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['username'] == 'user1'
        assert 'api_keys' in data
        assert len(data['api_keys']) > 0

    def test_login_wrong_password(self, client):
        """Login should fail with wrong password"""
        client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })

        response = client.post('/api/users/login', json={
            'username': 'user1',
            'password': 'wrongpassword'
        })

        assert response.status_code == 401


class TestAPIKeyManagement:
    """Test API key operations"""

    def test_create_api_key(self, client):
        """Create a new API key"""
        # Register and get initial API key
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        # Create new API key
        response = client.post('/api/keys',
            headers={'X-API-Key': api_key},
            json={
                'key_name': 'Test Key',
                'permissions': 'read'
            })

        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'api_key' in data
        assert data['permissions'] == 'read'

    def test_list_api_keys(self, client):
        """List user's API keys"""
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        response = client.get('/api/keys', headers={'X-API-Key': api_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'api_keys' in data
        assert len(data['api_keys']) >= 1

    def test_delete_api_key(self, client):
        """Delete an API key"""
        # Register user
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        # Create another key
        create_response = client.post('/api/keys',
            headers={'X-API-Key': api_key},
            json={'key_name': 'To Delete', 'permissions': 'read'})

        # Get key ID
        list_response = client.get('/api/keys', headers={'X-API-Key': api_key})
        keys = json.loads(list_response.data)['api_keys']
        key_to_delete = [k for k in keys if k['key_name'] == 'To Delete'][0]

        # Delete key
        response = client.delete(f'/api/keys/{key_to_delete["id"]}',
            headers={'X-API-Key': api_key})

        assert response.status_code == 200

    def test_api_key_required(self, client):
        """Endpoints should require API key"""
        response = client.get('/api/keys')
        assert response.status_code == 401


class TestAIAgents:
    """Test AI agents endpoints"""

    def test_list_ai_agents(self, client):
        """List predefined AI agents"""
        # Register user and get API key
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        response = client.get('/api/agents', headers={'X-API-Key': api_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'ai_agents' in data
        agent_names = [a['name'] for a in data['ai_agents']]
        assert 'ChatGPT' in agent_names
        assert 'Claude' in agent_names
        assert 'Gemini' in agent_names


class TestChatManagement:
    """Test chat operations"""

    def test_create_chat(self, client):
        """Create a new chat"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        # Get AI agent ID
        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agents = json.loads(agents_response.data)['ai_agents']
        claude_agent = [a for a in agents if a['name'] == 'Claude'][0]

        # Create chat
        response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': claude_agent['id'],
                'external_chat_id': 'chat-12345',
                'chat_start_time': '2024-01-01T10:00:00',
                'chat_end_time': '2024-01-01T11:00:00'
            })

        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'internal_uuid' in data
        assert 'chat_id' in data

    def test_list_chats(self, client):
        """List user's chats"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agents = json.loads(agents_response.data)['ai_agents']
        agent_id = agents[0]['id']

        # Create a chat
        client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })

        # List chats
        response = client.get('/api/chats', headers={'X-API-Key': api_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'chats' in data
        assert len(data['chats']) > 0

    def test_get_chat_by_uuid(self, client):
        """Get specific chat by UUID"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        # Create chat
        create_response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # Get chat
        response = client.get(f'/api/chats/{chat_uuid}', headers={'X-API-Key': api_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['internal_uuid'] == chat_uuid

    def test_update_chat(self, client):
        """Update chat end time"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        create_response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # Update chat
        response = client.put(f'/api/chats/{chat_uuid}',
            headers={'X-API-Key': api_key},
            json={'chat_end_time': '2024-01-01T12:00:00'})

        assert response.status_code == 200

    def test_read_only_key_cannot_create_chat(self, client):
        """Read-only API key should not be able to create chats"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        write_key = json.loads(reg_response.data)['api_key']

        # Create read-only key
        read_key_response = client.post('/api/keys',
            headers={'X-API-Key': write_key},
            json={'key_name': 'Read Only', 'permissions': 'read'})
        read_key = json.loads(read_key_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': write_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        # Try to create chat with read-only key
        response = client.post('/api/chats',
            headers={'X-API-Key': read_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })

        assert response.status_code == 403


class TestMessages:
    """Test message operations"""

    def test_add_message_to_chat(self, client):
        """Add a message to a chat"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        create_response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # Add message
        response = client.post(f'/api/chats/{chat_uuid}/messages',
            headers={'X-API-Key': api_key},
            json={
                'message_type': 'user',
                'content': 'Hello, AI!',
                'timestamp': '2024-01-01T10:01:00',
                'sequence_number': 1
            })

        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'message_id' in data

    def test_get_messages(self, client):
        """Get all messages for a chat"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        create_response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # Add messages
        client.post(f'/api/chats/{chat_uuid}/messages',
            headers={'X-API-Key': api_key},
            json={
                'message_type': 'user',
                'content': 'Hello!',
                'timestamp': '2024-01-01T10:01:00',
                'sequence_number': 1
            })

        client.post(f'/api/chats/{chat_uuid}/messages',
            headers={'X-API-Key': api_key},
            json={
                'message_type': 'ai',
                'content': 'Hi there!',
                'timestamp': '2024-01-01T10:01:30',
                'sequence_number': 2
            })

        # Get messages
        response = client.get(f'/api/chats/{chat_uuid}/messages',
            headers={'X-API-Key': api_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'messages' in data
        assert len(data['messages']) == 2
        assert data['messages'][0]['message_type'] == 'user'
        assert data['messages'][1]['message_type'] == 'ai'


class TestArtifacts:
    """Test artifact operations"""

    def test_add_artifact(self, client):
        """Add an artifact to a chat"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        create_response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # Create test artifact data
        test_data = b"Hello, this is a test file!"
        encoded_data = base64.b64encode(test_data).decode('utf-8')

        # Add artifact
        response = client.post(f'/api/chats/{chat_uuid}/artifacts',
            headers={'X-API-Key': api_key},
            json={
                'artifact_name': 'test.txt',
                'artifact_type': 'text/plain',
                'artifact_data': encoded_data,
                'timestamp': '2024-01-01T10:05:00'
            })

        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'artifact_id' in data
        assert data['version'] == 1

    def test_artifact_versioning(self, client):
        """Test artifact versioning"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        create_response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # Add first version
        data1 = base64.b64encode(b"Version 1").decode('utf-8')
        response1 = client.post(f'/api/chats/{chat_uuid}/artifacts',
            headers={'X-API-Key': api_key},
            json={
                'artifact_name': 'file.txt',
                'artifact_type': 'text/plain',
                'artifact_data': data1,
                'timestamp': '2024-01-01T10:05:00'
            })
        assert json.loads(response1.data)['version'] == 1

        # Add second version
        data2 = base64.b64encode(b"Version 2").decode('utf-8')
        response2 = client.post(f'/api/chats/{chat_uuid}/artifacts',
            headers={'X-API-Key': api_key},
            json={
                'artifact_name': 'file.txt',
                'artifact_type': 'text/plain',
                'artifact_data': data2,
                'timestamp': '2024-01-01T10:06:00'
            })
        assert json.loads(response2.data)['version'] == 2

    def test_list_artifacts(self, client):
        """List all artifacts for a chat"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        create_response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # Add artifact
        data = base64.b64encode(b"Test data").decode('utf-8')
        client.post(f'/api/chats/{chat_uuid}/artifacts',
            headers={'X-API-Key': api_key},
            json={
                'artifact_name': 'test.txt',
                'artifact_type': 'text/plain',
                'artifact_data': data,
                'timestamp': '2024-01-01T10:05:00'
            })

        # List artifacts
        response = client.get(f'/api/chats/{chat_uuid}/artifacts',
            headers={'X-API-Key': api_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'artifacts' in data
        assert len(data['artifacts']) > 0


class TestConversationRendering:
    """Test conversation rendering endpoint"""

    def test_get_full_conversation(self, client):
        """Get complete conversation with messages and artifacts"""
        # Setup
        reg_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        api_key = json.loads(reg_response.data)['api_key']

        agents_response = client.get('/api/agents', headers={'X-API-Key': api_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        create_response = client.post('/api/chats',
            headers={'X-API-Key': api_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # Add messages
        client.post(f'/api/chats/{chat_uuid}/messages',
            headers={'X-API-Key': api_key},
            json={
                'message_type': 'user',
                'content': 'Create a file',
                'timestamp': '2024-01-01T10:01:00',
                'sequence_number': 1
            })

        client.post(f'/api/chats/{chat_uuid}/messages',
            headers={'X-API-Key': api_key},
            json={
                'message_type': 'ai',
                'content': 'Sure, here is your file',
                'timestamp': '2024-01-01T10:02:00',
                'sequence_number': 2
            })

        # Add artifact
        artifact_data = base64.b64encode(b"File content").decode('utf-8')
        client.post(f'/api/chats/{chat_uuid}/artifacts',
            headers={'X-API-Key': api_key},
            json={
                'artifact_name': 'output.txt',
                'artifact_type': 'text/plain',
                'artifact_data': artifact_data,
                'timestamp': '2024-01-01T10:02:30'
            })

        # Get conversation
        response = client.get(f'/api/chats/{chat_uuid}/conversation',
            headers={'X-API-Key': api_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'chat' in data
        assert 'conversation' in data
        assert len(data['conversation']) == 3  # 2 messages + 1 artifact

        # Check chronological order
        timestamps = [item['timestamp'] for item in data['conversation']]
        assert timestamps == sorted(timestamps)

        # Check types
        types = [item['type'] for item in data['conversation']]
        assert 'message' in types
        assert 'artifact' in types


class TestAdminFunctionality:
    """Test admin endpoints"""

    def test_admin_list_users(self, client):
        """Admin can list all users"""
        # Register admin (first user)
        admin_response = client.post('/api/users/register', json={
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'password123'
        })
        admin_key = json.loads(admin_response.data)['api_key']

        # Register another user
        client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })

        # Admin lists users
        response = client.get('/api/admin/users', headers={'X-API-Key': admin_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'users' in data
        assert len(data['users']) == 2

    def test_non_admin_cannot_access_admin_endpoints(self, client):
        """Non-admin users cannot access admin endpoints"""
        # Register admin
        client.post('/api/users/register', json={
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'password123'
        })

        # Register regular user
        user_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        user_key = json.loads(user_response.data)['api_key']

        # Try to access admin endpoint
        response = client.get('/api/admin/users', headers={'X-API-Key': user_key})

        assert response.status_code == 403

    def test_admin_disable_user(self, client):
        """Admin can disable users"""
        # Register admin
        admin_response = client.post('/api/users/register', json={
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'password123'
        })
        admin_key = json.loads(admin_response.data)['api_key']

        # Register user
        user_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        user_data = json.loads(user_response.data)

        # Disable user
        response = client.put(f'/api/admin/users/{user_data["user_id"]}',
            headers={'X-API-Key': admin_key},
            json={'is_active': False})

        assert response.status_code == 200

    def test_admin_view_user_chats(self, client):
        """Admin can view other users' chats"""
        # Register admin
        admin_response = client.post('/api/users/register', json={
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'password123'
        })
        admin_key = json.loads(admin_response.data)['api_key']

        # Register user and create chat
        user_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        user_key = json.loads(user_response.data)['api_key']
        user_id = json.loads(user_response.data)['user_id']

        agents_response = client.get('/api/agents', headers={'X-API-Key': user_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        client.post('/api/chats',
            headers={'X-API-Key': user_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })

        # Admin views user's chats
        response = client.get(f'/api/admin/users/{user_id}/chats',
            headers={'X-API-Key': admin_key})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'chats' in data
        assert len(data['chats']) > 0


class TestDataIsolation:
    """Test that users can only access their own data"""

    def test_user_cannot_access_other_user_chats(self, client):
        """Users cannot access other users' chats"""
        # Register two users
        user1_response = client.post('/api/users/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'password123'
        })
        user1_key = json.loads(user1_response.data)['api_key']

        user2_response = client.post('/api/users/register', json={
            'username': 'user2',
            'email': 'user2@example.com',
            'password': 'password123'
        })
        user2_key = json.loads(user2_response.data)['api_key']

        # User1 creates a chat
        agents_response = client.get('/api/agents', headers={'X-API-Key': user1_key})
        agent_id = json.loads(agents_response.data)['ai_agents'][0]['id']

        create_response = client.post('/api/chats',
            headers={'X-API-Key': user1_key},
            json={
                'ai_agent_id': agent_id,
                'external_chat_id': 'chat-1',
                'chat_start_time': '2024-01-01T10:00:00'
            })
        chat_uuid = json.loads(create_response.data)['internal_uuid']

        # User2 tries to access User1's chat
        response = client.get(f'/api/chats/{chat_uuid}',
            headers={'X-API-Key': user2_key})

        assert response.status_code == 403


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
