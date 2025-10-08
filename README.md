# Unconventional

**Unconventional** is a **Roblox game** inspired by *UnOrdinary*, featuring characters with unique abilities and complex stat systems.
This project is a **web-based visualizer** that displays a radar (pentagram) chart of ability stats from the game.

It uses data from a [Google Spreadsheet](https://docs.google.com/spreadsheets/d/1cCXSA-Qvz8-iB6VP6q1-0MHTFir2HCQrm80RGscqDGk/edit?gid=1996824132#gid=1996824132) to generate `.json` files containing ability data
> ⚠️ Note: The spreadsheet may not be complete or fully accurate.

---

## Overview

* Based on the **Roblox game *Unconventional***, which is inspired by the webcomic *UnOrdinary*
* The website visualizes **ability stats** using an interactive **radar chart (pentagram chart)**
* Shows stats such as: Power, Speed, Trick, Recovery, and Defense
* Data is pulled from a spreadsheet and converted into `.json` format for use by the site

---

## How It Works

### 1. Python Data Conversion

To generate `abilities.json` for the visualizer:

1. Copy the relevant spreadsheet data for an ability.
2. Paste it into the Python script (`pydump.py`) in the `data_text` variable.
3. Run the script to create `pydump.json`.
4. Copy the contents of `pydump.json` into `abilities.json`.

**Example Python workflow:**

```python
import json

# Ability name
ability_name = "Phase Shift (ATK)"

# Tab-separated spreadsheet data
data_text = """
3.5	3.3P	3.3S	4.9T	1R	1D
3.6	3.4P	3.4S	5.1T	1R	1D
3.8	3.7P	3.7S	5.5T	1R	1D
3.9	3.8P	3.8S	5.7T	1R	1D
4.0	3.9P	3.9S	5.9T	1R	1D
4.1	4.1P	4.1S	6.1T	1R	1D
4.2	4.2P	4.2S	6.3T	1R	1D
...
7.5	10P	10S	10T	2.2R	2.2D
"""

abilities = {}

for line in data_text.strip().splitlines():
    parts = line.split('\t')
    if len(parts) != 6:
        continue
    level = parts[0]
    stats = {
        "Pow": float(parts[1].replace('P','')),
        "Spd": float(parts[2].replace('S','')),
        "Trick": float(parts[3].replace('T','')),
        "Recv": float(parts[4].replace('R','')),
        "Def": float(parts[5].replace('D','')),
    }
    abilities[level] = stats

output_json = json.dumps({ability_name: abilities}, indent=2)

with open('pydump.json', 'w') as f:
    f.write(output_json)

print(output_json)
```

> **Note:**
>
> * `data_text` should be **tab-separated**: Level, Power (P), Speed (S), Trick (T), Recovery (R), Defense (D).
> * After running, copy `pydump.json` into `abilities.json` for the web visualizer.

---

### 2. Abilities JSON

* `abilities.json` contains all abilities and stats for the web interface.
* Example snippet:

```json
{
  "Illumination": {
    "1.5": {"Pow": 1.1,"Spd": 1.0,"Trick": 2.0,"Recv": 1.0,"Def": 1.0},
    "1.6": {"Pow": 1.1,"Spd": 1.0,"Trick": 2.2,"Recv": 1.0,"Def": 1.0}
  },
  "Strong Punch": {
    "2.0": {"Pow": 3.0,"Spd": 1.0,"Trick": 1.6,"Recv": 1.0,"Def": 1.0}
  }
}
```

---

### 3. Web Visualization

* Open `index.html` (or the main HTML file) in a web browser.
* Users select an ability and level from dropdowns.
* Stats are displayed as text and in a **radar chart** using Chart.js:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

* The chart dynamically updates when a different ability or level is selected.

---

## Getting Started

1. **Clone the repository:**

```bash
git clone https://github.com/rylvion/unconventional.git
```

2. **Open the project in a browser:**

* Open `index.html` to view the radar chart and interact with abilities.

3. **Generate abilities JSON:**

* Copy spreadsheet data and use the Python script to produce `pydump.json`.
* Paste the results into `abilities.json`.

---

## Technologies Used

* Python (for converting spreadsheet data to JSON)
* JavaScript/HTML/CSS (for web interface)
* Chart.js for radar chart visualization
* JSON for storing abilities and stats

---

## Contributing

Contributions are welcome! You can help by:

* Adding new abilities or correcting stats
* Improving the Python conversion script
* Enhancing the web interface or radar chart visualization

Please fork the repository, create a branch, and submit a pull request.

---

## License

This project is licensed under the MIT License.