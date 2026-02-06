from PIL import Image
import sys
import os

def remove_black_background(input_path, output_path):
    print(f"Processing: {input_path}")
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        # Method 2: Global replacement of dark pixels (Better for neon on black)
        # Iterate over all pixels
        count_removed = 0
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                # Check brightness (simple average or luminance)
                # If it's very dark, make it transparent
                # Loose threshold: if all channels are low
                if r < 40 and g < 40 and b < 40:
                    pixels[x, y] = (0, 0, 0, 0)
                    count_removed += 1
                    
        print(f"Removed {count_removed} dark pixels.")

        # Crop to content to remove surrounding space
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print(f"Saved transparent logo to: {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Input: The current logo file (we will overwrite it)
    # We use a temporary file principle: Read from the file, process in memory, overwrite the file.
    # The script loads into PIL image object, so we can overwrite safety if we save at the end.
    
    target_file = r"C:\Users\Fritzhoff\Desktop\Ric\Programmieren\Apps\Pitmaster\src\assets\pitmaster_logo.png"
    
    # Just to be safe, let's verify it exists
    if os.path.exists(target_file):
        remove_black_background(target_file, target_file)
    else:
        print(f"File not found: {target_file}")
