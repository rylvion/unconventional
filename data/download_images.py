import os
import requests

urls = [
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/arachnid.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/aura.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/barrier-new.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/blade-master.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/botanist.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/candycleave.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/command.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/dupe.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/energy-discharge.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/needles.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/explosion.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/festive.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/fireclaw.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/flashbang.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/healing.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/hunter.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/hydrofreeze.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/image.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/lightning.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/minefield.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/nightmare.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/particles.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/phase-shift.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/pumpkins.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/specclaw.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/regeneration.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/speed.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/stone-skin.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/strong-kick.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/strong-punch.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/telek.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/teleportation.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/time.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/varrier.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/vines.png",
    "https://tiermaker.com/images/media/template_images/2024/17763548/unconventional-tierlist-17763548/zzzzz-1746505839hypnosis.png"
]

urls = list(set(urls))

parent_dir = os.path.join("..", "abilities")
os.makedirs(parent_dir, exist_ok=True)

for url in urls:
    filename = os.path.join(parent_dir, url.split("/")[-1])

    if os.path.exists(filename):
        print(f"✅ {filename} already exists, skipping download.")
        continue

    print(f"Downloading {filename} ...")
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, "wb") as f:
            f.write(response.content)
    else:
        print(f"⚠️ Failed to download {url} (status {response.status_code})")

print("✅ All downloads complete!")