import json

def store_keystrokes(data):
    with open("keystrokes.json", "a") as file:
        json.dump([d.dict() for d in data], file)
