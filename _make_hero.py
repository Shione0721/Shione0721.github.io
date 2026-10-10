# -*- coding: utf-8 -*-
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H = 1920, 1080
# 135 度对角三色渐变（粉 -> 紫 -> 蓝），与站点主色一致
stops = [(0.0, (247, 184, 216)), (0.48, (201, 163, 236)), (1.0, (157, 196, 245))]
xs = np.linspace(0, 1, W)[None, :]
ys = np.linspace(0, 1, H)[:, None]
t = np.clip((xs * 0.65 + ys * 0.35), 0, 1)
img = np.zeros((H, W, 3), dtype=np.float32)
for i in range(len(stops) - 1):
    a, ca = stops[i]; b, cb = stops[i + 1]
    m = (t >= a) & (t <= b)
    f = np.clip((t - a) / (b - a), 0, 1)[..., None]
    for c in range(3):
        img[..., c] = np.where(m, ca[c] * (1 - f[..., 0]) + cb[c] * f[..., 0], img[..., c])
base = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGB")
# 柔光光斑，做出梦幻感
glow = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(glow)
for (cx, cy, r, v) in [(320, 250, 340, 120), (1560, 300, 420, 100), (900, 880, 380, 70), (1700, 900, 300, 60)]:
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=v)
glow = glow.filter(ImageFilter.GaussianBlur(160))
white = Image.new("RGB", (W, H), (255, 255, 255))
out = Image.composite(white, base, glow.point(lambda p: int(p * 0.75)))
out.save(r"C:\\Users\\29245\\Documents\\shione-blog\\source\img\hero-bg.png", "PNG", optimize=True)
print("saved", out.size)
