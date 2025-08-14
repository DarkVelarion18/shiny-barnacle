from PIL import Image, ImageDraw
from pathlib import Path
# Carica lo sfondo fornito
sfondo = Image.open("image1.jpg").convert("RGBA")  # Usa "image1.png" se il file è PNG

# Imposta la dimensione del logo a 48x48 pixel, per la fedeltà storica
icon_size = (48, 48)
sfondo = sfondo.resize(icon_size, Image.LANCZOS)
draw = ImageDraw.Draw(sfondo)

# Parametri della cornice bianca interna (spessore stimato)
border_thickness = 10  # Adatta se la cornice è più spessa o sottile
inner_rect = (
    border_thickness,
    border_thickness,
    icon_size[0] - border_thickness - 1,
    icon_size[1] - border_thickness - 1,
)

# Parametri pale dentro la cornice
paddle_width = 4
paddle_height = 20
paddle_offset = inner_rect[0] + 2
paddle_top = inner_rect[1] + (inner_rect[3] - inner_rect[1] - paddle_height) // 2

# Pale sinistra
draw.rectangle([
    (paddle_offset, paddle_top),
    (paddle_offset + paddle_width - 1, paddle_top + paddle_height - 1)
], fill=(255,255,255,255), outline=(80,80,80,255))

# Pale destra
draw.rectangle([
    (inner_rect[2] - paddle_width + 1, paddle_top),
    (inner_rect[2], paddle_top + paddle_height - 1)
], fill=(255,255,255,255), outline=(80,80,80,255))

# Pallina dentro la cornice
ball_radius = 4
ball_center = (
    (inner_rect[0] + inner_rect[2]) // 2,
    (inner_rect[1] + inner_rect[3]) // 2
)

# Ombra pallina
shadow_offset = (1, 2)
draw.ellipse([
    (ball_center[0] - ball_radius + shadow_offset[0], ball_center[1] - ball_radius + shadow_offset[1]),
    (ball_center[0] + ball_radius + shadow_offset[0], ball_center[1] + ball_radius + shadow_offset[1])
], fill=(100,100,100,120))

# Pallina bianca
draw.ellipse([
    (ball_center[0] - ball_radius, ball_center[1] - ball_radius),
    (ball_center[0] + ball_radius, ball_center[1] + ball_radius)
], fill=(255,255,255,255), outline=(80,80,80,255))

# Salva il risultato
sfondo.save("pong_logo_mac9_historic.png")
print("Logo salvato come pong_logo_mac9_historic.png")