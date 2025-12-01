# AI Chats Archive

A comprehensive Python REST API application for storing and managing archives of AI agent conversations.

## Features

- Multi-user support with authentication via API keys
- Support for multiple AI agents (ChatGPT, Gemini, Claude, Perplexity, Manus)
- Store complete chat conversations with user messages and AI responses
- Artifact management (images, files) with versioning support
- Role-based permissions (read-only, read-write)
- Admin functionality for user management
- SQLite database with transactions and WAL mode
- Comprehensive REST API
- Web interface for user management
- Complete unit test coverage

## Quick Start

### 1. Initialize the Environment

```bash
cd ai-chats-archive
source init.sh
```

This will:
- Create a Python virtual environment
- Install all dependencies
- Activate the environment

### 2. Run the Application

```bash
python app.py
```

The server will start on `http://localhost:5000`

### 3. Run Tests

```bash
source init.sh  # Make sure venv is active
pytest test_app.py -v
```

## API Documentation

### Authentication

All API endpoints (except user registration) require an API key in the header:

```
X-API-Key: aica_your_api_key_here
```

### User Management

#### Register a User
```bash
POST /api/users/register
Content-Type: application/json

{
    "username": "john",
    "email": "john@example.com",
    "password": "securepassword"
}
```

**Note:** The first user registered automatically becomes an administrator.

#### Login
```bash
POST /api/users/login
Content-Type: application/json

{
    "username": "john",
    "password": "securepassword"
}
```

### API Key Management

#### Create API Key
```bash
POST /api/keys
X-API-Key: your_api_key
Content-Type: application/json

{
    "key_name": "My API Key",
    "permissions": "read_write"  # or "read"
}
```

#### List API Keys
```bash
GET /api/keys
X-API-Key: your_api_key
```

#### Delete API Key
```bash
DELETE /api/keys/{key_id}
X-API-Key: your_api_key
```

### AI Agents

#### List Available AI Agents
```bash
GET /api/agents
X-API-Key: your_api_key
```

### Chat Management

#### Create a Chat
```bash
POST /api/chats
X-API-Key: your_api_key
Content-Type: application/json

{
    "ai_agent_id": 1,
    "external_chat_id": "chat-12345",
    "chat_start_time": "2024-01-01T10:00:00",
    "chat_end_time": "2024-01-01T11:00:00"
}
```

#### List Chats
```bash
GET /api/chats
X-API-Key: your_api_key
```

#### Get Specific Chat
```bash
GET /api/chats/{chat_uuid}
X-API-Key: your_api_key
```

#### Update Chat
```bash
PUT /api/chats/{chat_uuid}
X-API-Key: your_api_key
Content-Type: application/json

{
    "chat_end_time": "2024-01-01T12:00:00"
}
```

### Messages

#### Add Message to Chat
```bash
POST /api/chats/{chat_uuid}/messages
X-API-Key: your_api_key
Content-Type: application/json

{
    "message_type": "user",  # or "ai"
    "content": "Hello, AI!",
    "timestamp": "2024-01-01T10:01:00",
    "sequence_number": 1
}
```

#### Get Messages
```bash
GET /api/chats/{chat_uuid}/messages
X-API-Key: your_api_key
```

### Artifacts

#### Add Artifact
```bash
POST /api/chats/{chat_uuid}/artifacts
X-API-Key: your_api_key
Content-Type: application/json

{
    "artifact_name": "image.png",
    "artifact_type": "image/png",
    "artifact_data": "base64_encoded_data_here",
    "timestamp": "2024-01-01T10:05:00",
    "message_id": 1  # optional
}
```

#### List Artifacts
```bash
GET /api/chats/{chat_uuid}/artifacts
X-API-Key: your_api_key
```

#### Download Artifact
```bash
GET /api/artifacts/{artifact_id}/download
X-API-Key: your_api_key
```

### Conversation Rendering

#### Get Complete Conversation
```bash
GET /api/chats/{chat_uuid}/conversation
X-API-Key: your_api_key
```

Returns messages and artifacts in chronological order with type indicators.

### Admin Endpoints

Admin users have access to additional endpoints:

#### List All Users
```bash
GET /api/admin/users
X-API-Key: admin_api_key
```

#### Update User Status
```bash
PUT /api/admin/users/{user_id}
X-API-Key: admin_api_key
Content-Type: application/json

{
    "is_active": false
}
```

#### Delete User
```bash
DELETE /api/admin/users/{user_id}
X-API-Key: admin_api_key
```

#### View User's Chats
```bash
GET /api/admin/users/{user_id}/chats
X-API-Key: admin_api_key
```

#### View User's API Keys
```bash
GET /api/admin/users/{user_id}/keys
X-API-Key: admin_api_key
```

#### Disable API Key
```bash
PUT /api/admin/keys/{key_id}/disable
X-API-Key: admin_api_key
```

## Web Interface

Access the web interface at `http://localhost:5000` to:

- Register new accounts
- Login and manage API keys
- View and manage users (admin only)

## Database Schema

The application uses SQLite with the following tables:

- **users**: User accounts and authentication
- **api_keys**: API keys with permissions
- **ai_agents**: Predefined list of AI agents
- **chats**: Chat archives with metadata
- **messages**: Individual messages (user and AI)
- **artifacts**: Files and images with versioning

## Security Features

- Password hashing (SHA-256)
- API key authentication
- Role-based access control (read vs read-write)
- Admin privileges for the first user
- User data isolation
- Foreign key constraints
- Transaction support

## Development

### Running Tests

```bash
source init.sh
pytest test_app.py -v --cov=app --cov=database --cov=auth
```

### Test Coverage

The test suite includes:
- User registration and authentication
- API key management
- Chat creation and retrieval
- Message handling
- Artifact storage and versioning
- Conversation rendering
- Admin functionality
- Data isolation and security

## Database Configuration

The SQLite database is configured with:
- Foreign keys enabled
- WAL (Write-Ahead Logging) mode for better concurrency
- Synchronous mode set to NORMAL for balance of safety and performance
- Proper indexing for performance

## Requirements

- Python 3.7+
- Flask 3.0.0
- pytest 7.4.3
- pytest-cov 4.1.0

## License

This is a demonstration project for educational purposes.
