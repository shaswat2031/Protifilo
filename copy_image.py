import shutil
try:
    shutil.copy(
        r"C:\Users\prasa\.gemini\antigravity-ide\brain\4f73e833-102d-44f1-b290-9f86734a0bfa\philosophy_image_1780041728800.png",
        r"e:\protiflo\public\philosophy_image.png"
    )
    print("Successfully copied!")
except Exception as e:
    print("Failed to copy:", e)
