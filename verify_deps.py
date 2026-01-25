import pyotp
import qrcode
import io

try:
    print("Testing imports...")
    qr = qrcode.QRCode()
    qr.add_data("test")
    qr.make()
    print("Generating image...")
    img = qr.make_image()
    print("Saving image...")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    print("Success")
except Exception as e:
    print(f"Error: {e}")
