import requests
import os

API_BASE = "http://127.0.0.1:8000/api/v1"

def test_health():
    response = requests.get("http://127.0.0.1:8000/")
    print(f"Health Check: {response.json()}")

def test_upload():
    # Create a dummy text file
    with open("test.txt", "w") as f:
        f.write("This is a test document about the AI Knowledge Platform. It uses RAG and FastAPI.")
    
    with open("test.txt", "rb") as f:
        files = {"file": f}
        response = requests.post(f"{API_BASE}/upload", files=files)
        print(f"Upload Response: {response.json()}")
    
    os.remove("test.txt")

def test_get_documents():
    response = requests.get(f"{API_BASE}/documents")
    print(f"Documents: {response.json()}")

def test_chat():
    data = {"query": "What is the test document about?"}
    response = requests.post(f"{API_BASE}/chat", data=data)
    print(f"Chat Response: {response.json().get('answer')}")

def test_delete(filename):
    response = requests.delete(f"{API_BASE}/documents/{filename}")
    print(f"Delete Response: {response.json()}")

if __name__ == "__main__":
    try:
        test_health()
        test_upload()
        test_get_documents()
        test_chat()
        # test_delete("test.txt") # Uncomment to test deletion
    except Exception as e:
        print(f"Error during testing: {e}")
        print("Make sure the backend is running at http://localhost:8000")
