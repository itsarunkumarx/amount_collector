import uvicorn
import traceback

if __name__ == "__main__":
    try:
        print("Starting server via python script...")
        uvicorn.run("main:app", host="127.0.0.1", port=8080, log_level="debug", reload=False)
    except BaseException as e:
        print(f"CRASH DETECTED: {e}")
        traceback.print_exc()
