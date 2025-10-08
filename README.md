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

**Updated Python workflow (reflecting your latest script):**

```python
import json

ability_name = "Barrier"  # Change to the ability you are converting

data_text = """
6.0	7.2P	1S	5.2T	2.6R	10.0D
6.1	7.5P	1S	5.3T	2.6R	10.0D
6.2	7.8P	1S	5.5T	2.7R	10.0D
6.3	8.1P	1S	5.7T	2.8R	10.0D
6.4	8.4P	1S	5.9T	2.8R	10.0D
6.5	8.7P	1S	6.1T	2.9R	10.0D
6.6	9.0P	1S	6.3T	3.0R	10.0D
6.7	9.3P	1S	6.5T	3.1R	10.0D
6.8	9.6P	1S	6.7T	3.1R	10.0D
6.9	9.9P	1S	6.9T	3.2R	10.0D
7.0	10.0P	1S	7.2T	3.3R	10.0D
7.1	10.0P	1S	7.6T	3.5R	10.0D
7.2	10.0P	1S	8.1T	3.7R	10.0D
7.3	10.0P	1S	8.5T	3.8R	10.0D
7.4	10.0P	1S	8.9T	4.0R	10.0D
7.5	10.0P	1S	9.3T	4.1R	10.0D
7.6	10.0P	1S	9.8T	4.3R	10.0D
7.7	10.0P	1S	10.0T	4.7R	10.0D
7.8	10.0P	1S	10.0T	5.3R	10.0D
7.9	10.0P	1S	10.0T	5.9R	10.0D
8.0	10.0P	1S	10.0T	6.5R	10.0D
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

output_lines = ['{', f'  "{ability_name}": {{']
for i, (level, stats) in enumerate(abilities.items()):
    comma = ',' if i < len(abilities) - 1 else ''
    stats_str = json.dumps(stats, separators=(',', ': '))
    output_lines.append(f'    "{level}": {stats_str}{comma}')
output_lines.append('  }')
output_lines.append('}')

output_json = '\n'.join(output_lines)

with open('pydump.json', 'w') as f:
    f.write(output_json)

print(output_json)
```

> ⚠️ **Notes:**
>
> * Ensure `data_text` is **tab-separated**: Level, Power (P), Speed (S), Trick (T), Recovery (R), Defense (D).
> * The script will generate a properly formatted `pydump.json`.
> * Copy its content into `abilities.json` to be used by the web visualizer.

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