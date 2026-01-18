import json
import os
import glob

def merge_json(source, target):
    """
    Recursively merge source keys into target if they are missing.
    """
    for key, value in source.items():
        if key not in target:
            target[key] = value
            print(f"Adding missing key: {key}")
        elif isinstance(value, dict) and isinstance(target[key], dict):
            merge_json(value, target[key])

def main():
    base_dir = '/Users/hristo/Development/repos/cider/cider-app/src/assets/i18n'
    en_path = os.path.join(base_dir, 'en.json')
    
    with open(en_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    # Get all json files
    files = glob.glob(os.path.join(base_dir, '*.json'))
    
    for file_path in files:
        if file_path == en_path:
            continue
            
        print(f"Processing {os.path.basename(file_path)}...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                target_data = json.load(f)
            
            # Merge en_data into target_data
            merge_json(en_data, target_data)
            
            # Write back
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(target_data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    main()
