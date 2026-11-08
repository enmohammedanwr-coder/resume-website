"""Generate tech-themed project cover images + a placeholder profile photo."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os

BASE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(BASE, "assets", "img")
os.makedirs(IMG, exist_ok=True)

W, H = 1280, 800
FONT_B = os.path.join(BASE, "assets", "fonts", "Tajawal-Bold.ttf")

def grad(c1, c2):
    img = Image.new("RGB", (W, H), c1)
    top = Image.new("RGB", (W, H), c2)
    mask = Image.new("L", (W, H))
    md = mask.load()
    for y in range(H):
        for x in range(W):
            md[x, y] = int(255 * (x * 0.35 + y * 0.65) / (W * 0.35 + H * 0.65))
    img.paste(top, (0, 0), mask)
    return img

def add_grid(img, step=54, color=(120, 170, 255, 22)):
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for x in range(0, W, step):
        d.line([(x, 0), (x, H)], fill=color, width=1)
    for y in range(0, H, step):
        d.line([(0, y), (W, y)], fill=color, width=1)
    img.alpha_composite(ov)
    return img

def add_glow(img, cx, cy, r, color, alpha=120):
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (alpha,))
    ov = ov.filter(ImageFilter.GaussianBlur(120))
    img.alpha_composite(ov)
    return img

def label_badge(img, text, anchor="mm"):
    try:
        f = ImageFont.truetype(FONT_B, 46)
    except Exception:
        f = ImageFont.load_default()
    d = ImageDraw.Draw(img)
    d.text((W // 2, H - 90), text, font=f, fill=(230, 240, 255, 235), anchor=anchor)

def circular_icon(img, draw_fn, cx, cy, r, color):
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color + (200,), width=4)
    draw_fn(d, cx, cy, r, color)

def save(img, name):
    img.convert("RGB").save(os.path.join(IMG, name), quality=90)
    print("wrote", name)

# ---------- 1. Airport (C#) ----------
img = grad((6, 12, 30), (10, 30, 70)).convert("RGBA")
img = add_glow(img, 900, 250, 320, (47, 124, 246), 130)
img = add_glow(img, 300, 600, 280, (34, 211, 238), 90)
img = add_grid(img)
d = ImageDraw.Draw(img)
# runway perspective
d.polygon([(420, 800), (860, 800), (700, 380), (580, 380)], fill=(20, 40, 80, 180), outline=(120, 180, 255, 200))
for i in range(6):
    y = 780 - i * 66
    w = 4 + i * 2
    d.line([(640 - w, y), (640 + w, y)], fill=(230, 245, 255, 220), width=6)
# simple plane
d.polygon([(640, 180), (760, 250), (700, 250), (700, 300), (640, 300), (640, 250), (580, 250)],
          fill=(120, 190, 255, 230))
label_badge(img, "Amran International Airport  •  C#")
save(img, "project-airport.jpg")

# ---------- 2. Traffic (Python) ----------
img = grad((6, 16, 28), (10, 40, 55)).convert("RGBA")
img = add_glow(img, 640, 300, 360, (34, 211, 238), 120)
img = add_grid(img)
d = ImageDraw.Draw(img)
# roads crossing
d.line([(0, 420), (1280, 420)], fill=(150, 210, 255, 120), width=10)
d.line([(640, 60), (640, 760)], fill=(150, 210, 255, 120), width=10)
# detection boxes
for (x, y, w, h) in [(380, 330, 150, 90), (760, 340, 170, 86), (540, 520, 160, 92)]:
    d.rectangle([x, y, x + w, y + h], outline=(56, 189, 248, 235), width=4)
    d.rectangle([x, y - 26, x + 96, y], fill=(56, 189, 248, 235))
label_badge(img, "Traffic Movement Detection  •  Python")
save(img, "project-traffic.jpg")

# ---------- 3. Smart Guardian (Android) ----------
img = grad((8, 10, 28), (18, 24, 60)).convert("RGBA")
img = add_glow(img, 640, 400, 340, (47, 124, 246), 130)
img = add_grid(img)
d = ImageDraw.Draw(img)
# shield
cx, cy = 640, 380
d.polygon([(cx, cy - 200), (cx + 170, cy - 120), (cx + 170, cy + 60),
           (cx, cy + 210), (cx - 170, cy + 60), (cx - 170, cy - 120)],
          fill=(30, 60, 110, 200), outline=(120, 190, 255, 235))
d.polygon([(cx, cy - 150), (cx + 120, cy - 85), (cx + 120, cy + 40),
           (cx, cy + 155), (cx - 120, cy + 40), (cx - 120, cy - 85)],
          outline=(56, 189, 248, 220))
# check mark
d.line([(cx - 55, cy), (cx - 12, cy + 45), (cx + 62, cy - 45)], fill=(34, 211, 238, 255), width=16)
label_badge(img, "Smart Guardian App  •  Android")
save(img, "project-guardian.jpg")

# ---------- 4. Training Center (PHP) ----------
img = grad((8, 14, 26), (12, 34, 62)).convert("RGBA")
img = add_glow(img, 400, 260, 300, (47, 124, 246), 120)
img = add_glow(img, 950, 560, 300, (34, 211, 238), 90)
img = add_grid(img)
d = ImageDraw.Draw(img)
# certificate frame
d.rounded_rectangle([340, 220, 940, 620], radius=22, fill=(18, 34, 66, 210),
                    outline=(120, 190, 255, 220), width=5)
d.rounded_rectangle([380, 260, 900, 580], radius=16, outline=(56, 189, 248, 200), width=3)
# seal
d.ellipse([790, 470, 880, 560], fill=(34, 211, 238, 210), outline=(200, 240, 255, 235), width=4)
# text lines
for i, wd in enumerate([300, 380, 260, 340]):
    d.line([(430, 320 + i * 52), (430 + wd, 320 + i * 52)], fill=(190, 220, 255, 150), width=10)
label_badge(img, "Training & Rehabilitation Center  •  PHP")
save(img, "project-training.jpg")

# ---------- Profile placeholder ----------
W, H = 900, 900
img = grad((8, 14, 30), (16, 30, 66)).convert("RGBA")
img = add_glow(img, 450, 320, 320, (47, 124, 246), 130)
img = add_grid(img, 60)
d = ImageDraw.Draw(img)
# avatar silhouette
d.ellipse([330, 300, 570, 540], fill=(90, 140, 210, 220))
d.ellipse([210, 560, 690, 1000], fill=(90, 140, 210, 220))
try:
    f = ImageFont.truetype(FONT_B, 40)
    f2 = ImageFont.truetype(FONT_B, 30)
except Exception:
    f = f2 = ImageFont.load_default()
d.text((450, 800), "ضع صورتك هنا", font=f, fill=(230, 240, 255, 235), anchor="mm")
d.text((450, 850), "Replace with your photo", font=f2, fill=(180, 200, 230, 220), anchor="mm")
img.convert("RGB").save(os.path.join(IMG, "profile.jpg"), quality=90)
print("wrote profile.jpg")
