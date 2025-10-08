import json
# Ability name
ability_name = "Explosion"
# Tab-separated data as a multi-line string
data_text = """
3.6	4.6P	1.9S	4.6T	1R	1.9D
3.7	4.8P	1.9S	4.8T	1R	1.9D
3.8	4.9P	2.0S	4.9T	1R	2.0D
3.9	5.1P	2.0S	5.1T	1R	2.0D
4.0	5.3P	2.1S	5.3T	1R	2.1D
4.1	5.5P	2.1S	5.5T	1R	2.1D
4.5	6.3P	2.3S	6.3T	1R	2.3D
4.9	7.1P	2.5S	7.1T	1R	2.5D
5.0	7.3P	2.6S	7.3T	1R	2.6D
5.1	7.5P	2.6S	7.5T	1R	2.6D
5.2	7.7P	2.7S	7.7T	1R	2.7D
5.3	7.9P	2.7S	7.9T	1R	2.7D
5.4	8.1P	2.8S	8.1T	1R	2.8D
5.5	8.3P	2.8S	8.3T	1R	2.8D
5.6	8.5P	2.9S	8.5T	1R	2.9D
5.7	8.7P	2.9S	8.7T	1R	2.9D
5.8	9.0P	3.0S	9.0T	1R	3.0D
5.9	9.2P	3.0S	9.2T	1R	3.0D
6.0	9.4P	3.1S	9.4T	1R	3.1D
6.1	9.6P	3.2S	9.6T	1R	3.2D
6.2	9.8P	3.2S	9.8T	1R	3.2D
6.3	10P	3.3S	10T	1R	3.3D
6.4	10P	3.6S	10T	1R	3.6D
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