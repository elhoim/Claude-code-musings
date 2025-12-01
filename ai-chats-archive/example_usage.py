"""
Example usage script for AI Chats Archive API
Demonstrates how to use the API programmatically
"""

import requests
import base64
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:5000"


def register_user(username, email, password):
    """Register a new user"""
    response = requests.post(f"{BASE_URL}/api/users/register", json={
        "username": username,
        "email": email,
        "password": password
    })
    return response.json()


def login_user(username, password):
    """Login and get API keys"""
    response = requests.post(f"{BASE_URL}/api/users/login", json={
        "username": username,
        "password": password
    })
    return response.json()


def get_ai_agents(api_key):
    """Get list of available AI agents"""
    response = requests.get(f"{BASE_URL}/api/agents",
                           headers={"X-API-Key": api_key})
    return response.json()


def create_chat(api_key, ai_agent_id, external_chat_id, start_time):
    """Create a new chat archive"""
    response = requests.post(f"{BASE_URL}/api/chats",
                            headers={"X-API-Key": api_key},
                            json={
                                "ai_agent_id": ai_agent_id,
                                "external_chat_id": external_chat_id,
                                "chat_start_time": start_time
                            })
    return response.json()


def add_message(api_key, chat_uuid, message_type, content, timestamp, sequence):
    """Add a message to a chat"""
    response = requests.post(f"{BASE_URL}/api/chats/{chat_uuid}/messages",
                            headers={"X-API-Key": api_key},
                            json={
                                "message_type": message_type,
                                "content": content,
                                "timestamp": timestamp,
                                "sequence_number": sequence
                            })
    return response.json()


def add_artifact(api_key, chat_uuid, name, artifact_type, data, timestamp):
    """Add an artifact to a chat"""
    # Encode data as base64
    encoded_data = base64.b64encode(data).decode('utf-8')

    response = requests.post(f"{BASE_URL}/api/chats/{chat_uuid}/artifacts",
                            headers={"X-API-Key": api_key},
                            json={
                                "artifact_name": name,
                                "artifact_type": artifact_type,
                                "artifact_data": encoded_data,
                                "timestamp": timestamp
                            })
    return response.json()


def get_conversation(api_key, chat_uuid):
    """Get complete conversation with messages and artifacts"""
    response = requests.get(f"{BASE_URL}/api/chats/{chat_uuid}/conversation",
                           headers={"X-API-Key": api_key})
    return response.json()


def main():
    """Example usage workflow"""
    print("AI Chats Archive - Example Usage\n")

    # 1. Register a user
    print("1. Registering user...")
    user_data = register_user("demo_user", "demo@example.com", "password123")
    print(f"   User registered: {user_data.get('user_id')}")
    print(f"   Is admin: {user_data.get('is_admin')}")
    print(f"   API Key: {user_data.get('api_key')[:20]}...")

    api_key = user_data['api_key']

    # 2. Get available AI agents
    print("\n2. Getting AI agents...")
    agents = get_ai_agents(api_key)
    claude_agent = next(a for a in agents['ai_agents'] if a['name'] == 'Claude')
    print(f"   Using agent: {claude_agent['name']} (ID: {claude_agent['id']})")

    # 3. Create a chat
    print("\n3. Creating a chat archive...")
    chat_data = create_chat(
        api_key,
        claude_agent['id'],
        "external-chat-789",
        "2024-01-01T14:30:00"
    )
    chat_uuid = chat_data['internal_uuid']
    print(f"   Chat created with UUID: {chat_uuid}")

    # 4. Add messages
    print("\n4. Adding messages to the chat...")

    add_message(
        api_key, chat_uuid, "user",
        "Can you help me write a Python function to calculate fibonacci numbers?",
        "2024-01-01T14:30:15", 1
    )
    print("   - Added user message")

    add_message(
        api_key, chat_uuid, "ai",
        "Sure! Here's a Python function to calculate Fibonacci numbers:",
        "2024-01-01T14:30:30", 2
    )
    print("   - Added AI message")

    # 5. Add an artifact (simulating code file)
    print("\n5. Adding artifact (code file)...")
    code_content = b"""def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
print(fibonacci(10))
"""
    artifact_data = add_artifact(
        api_key, chat_uuid,
        "fibonacci.py", "text/x-python",
        code_content, "2024-01-01T14:30:35"
    )
    print(f"   - Artifact added (ID: {artifact_data['artifact_id']}, Version: {artifact_data['version']})")

    add_message(
        api_key, chat_uuid, "user",
        "Thanks! Can you make it more efficient?",
        "2024-01-01T14:31:00", 3
    )
    print("   - Added user message")

    add_message(
        api_key, chat_uuid, "ai",
        "Sure! Here's an optimized version using memoization:",
        "2024-01-01T14:31:15", 4
    )
    print("   - Added AI message")

    # 6. Add updated artifact (version 2)
    print("\n6. Adding updated artifact (version 2)...")
    code_content_v2 = b"""def fibonacci(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)
    return memo[n]

# Example usage
print(fibonacci(100))
"""
    artifact_data_v2 = add_artifact(
        api_key, chat_uuid,
        "fibonacci.py", "text/x-python",
        code_content_v2, "2024-01-01T14:31:20"
    )
    print(f"   - Updated artifact (ID: {artifact_data_v2['artifact_id']}, Version: {artifact_data_v2['version']})")

    # 7. Get complete conversation
    print("\n7. Retrieving complete conversation...")
    conversation = get_conversation(api_key, chat_uuid)

    print(f"\n   Chat: {conversation['chat']['ai_agent_name']}")
    print(f"   Start: {conversation['chat']['chat_start_time']}")
    print(f"   Total items: {len(conversation['conversation'])}\n")

    print("   Conversation timeline:")
    for i, item in enumerate(conversation['conversation'], 1):
        if item['type'] == 'message':
            sender = "USER" if item['message_type'] == 'user' else "AI  "
            print(f"   {i}. [{item['timestamp']}] {sender}: {item['content'][:60]}...")
        elif item['type'] == 'artifact':
            print(f"   {i}. [{item['timestamp']}] ARTIFACT: {item['artifact_name']} (v{item['version']})")

    print("\n✓ Example completed successfully!")
    print(f"\nYou can view this chat in the web interface at:")
    print(f"http://localhost:5000")
    print(f"\nOr access it via API with chat UUID: {chat_uuid}")


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server.")
        print("Make sure the server is running: python app.py")
    except Exception as e:
        print(f"Error: {e}")
