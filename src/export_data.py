import json
################################## EDITABLE SECTION BELOW ##################################
ability_name = "e.g. Time Manipulation" # Define the ability name
# Copy and paste the excel data between the triple quotes below with the site below
# https://docs.google.com/spreadsheets/d/1cCXSA-Qvz8-iB6VP6q1-0MHTFir2HCQrm80RGscqDGk/edit?gid=968418214#gid=968418214
# data_text = """
# 6.5	7.7P	9.5S	6.6T	3.8R	1.2D
# 6.6	7.7P	9.7S	6.8T	3.9R	1.2D
# 6.7	7.9P	9.9S	6.9T	4R	1.2D
# 6.8	8.1P	10S	7.1T	4R	1.3D
# 6.9	8.3P	10S	7.3T	4.1R	1.3D
# 7.0	8.6P	10S	7.5T	4.2R	1.3D
# 7.1	8.8P	10S	7.7T	4.3R	1.3D
# 7.2	9.1P	10S	7.9T	4.5R	1.3D
# 7.3	9.3P	10S	8.1T	4.6R	1.3D
# 7.4	9.6P	10S	8.3T	4.7R	1.3D
# 7.5	9.8P	10S	8.6T	4.8R	1.3D
# 7.6	10P	10S	8.8T	4.9R	1.3D
# 7.7	10P	10S	9.2T	5.1R	1.3D
# 7.8	10P	10S	9.6T	5.3R	1.4D
# 7.9	10P	10S	10T	5.5R	1.4D
# 8.0	10P	10S	10T	6R	1.4D
# 8.1	10P	10S	10T	6.6R	1.5D
# 8.2	10P	10S	10T	7.2R	1.6D
# 8.3	10P	10S	10T	7.7R	1.6D
# 8.4	10P	10S	10T	8.3R	1.7D
# 8.5	10P	10S	10T	8.8R	1.7D
# 8.6	10P	10S	10T	9.4R	1.7D
# 8.7	10P	10S	10T	10R	1.7D
# 8.8	10P	10S	10T	10R	2.4D
# 8.9	10P	10S	10T	10R	3D
# 9.0	10P	10S	10T	10R	3.6D
# 9.1	10P	10S	10T	10R	4.2D
# 9.2	10P	10S	10T	10R	4.9D
# 9.3	10P	10S	10T	10R	5.5D
# 9.4	10P	10S	10T	10R	6.1D
# 9.5	10P	10S	10T	10R	6.8D
# 9.6	10P	10S	10T	10R	7.4D
# 9.7	10P	10S	10T	10R	8.1D
# 9.8	10P	10S	10T	10R	8.7D
# 9.9	10P	10S	10T	10R	9.4D
# 10	10P	10S	10T	10R	10D
# """
######################################## UNCOMMENT AND PASTE EXCEL DATA ABOVE THIS LINE ############################

# uncomment data_text variable copy and paste excel data here the six columns are level, Pow, Spd, Trick, Recv, Def make sure to only copy that and nothing else
# make sure to use tabs to separate the columns but when pasting excel data it should automatically do that
# if there is any missing data just delete the entire row from the data_text variable above or any quesiton marks within the data variable

############################ EXPECTED OUTPUT FROM pydump.json ############################
# (with different numbers of values depending on the data above)
# {
#   "Arachnid": {
#     "5.0": {"Pow": 4.1,"Spd": 4.1,"Trick": 4.1,"Recv": 2.0,"Def": 6.2},
#     "5.1": {"Pow": 4.2,"Spd": 4.2,"Trick": 4.2,"Recv": 2.1,"Def": 6.4},
#     "5.2": {"Pow": 4.3,"Spd": 4.3,"Trick": 4.3,"Recv": 2.1,"Def": 6.6},
#     "5.3": {"Pow": 4.4,"Spd": 4.4,"Trick": 4.4,"Recv": 2.1,"Def": 6.7},
#     "5.4": {"Pow": 4.5,"Spd": 4.5,"Trick": 4.5,"Recv": 2.2,"Def": 6.9},
#     "5.5": {"Pow": 4.7,"Spd": 4.7,"Trick": 4.7,"Recv": 2.2,"Def": 7.1},
#     "5.6": {"Pow": 4.8,"Spd": 4.8,"Trick": 4.8,"Recv": 2.3,"Def": 7.3},
#     "5.7": {"Pow": 4.9,"Spd": 4.9,"Trick": 4.9,"Recv": 2.3,"Def": 7.4},
#     "5.8": {"Pow": 5.0,"Spd": 5.0,"Trick": 5.0,"Recv": 2.3,"Def": 7.6},
#     "5.9": {"Pow": 5.1,"Spd": 5.1,"Trick": 5.1,"Recv": 2.4,"Def": 7.8},
#     "6.0": {"Pow": 5.2,"Spd": 5.2,"Trick": 5.2,"Recv": 2.4,"Def": 8.0},
#     "6.1": {"Pow": 5.3,"Spd": 5.3,"Trick": 5.3,"Recv": 2.4,"Def": 8.2},
#     "6.2": {"Pow": 5.4,"Spd": 5.4,"Trick": 5.4,"Recv": 2.5,"Def": 8.4},
#     "6.3": {"Pow": 5.5,"Spd": 5.5,"Trick": 5.5,"Recv": 2.5,"Def": 8.5},
#     "6.4": {"Pow": 5.6,"Spd": 5.6,"Trick": 5.6,"Recv": 2.5,"Def": 8.7},
#     "6.5": {"Pow": 5.7,"Spd": 5.7,"Trick": 5.7,"Recv": 2.6,"Def": 8.9},
#     "6.6": {"Pow": 5.9,"Spd": 5.9,"Trick": 5.9,"Recv": 2.6,"Def": 9.1},
#     "6.7": {"Pow": 6.0,"Spd": 6.0,"Trick": 6.0,"Recv": 2.7,"Def": 9.3},
#     "6.8": {"Pow": 6.1,"Spd": 6.1,"Trick": 6.1,"Recv": 2.7,"Def": 9.5},
#     "6.9": {"Pow": 6.2,"Spd": 6.2,"Trick": 6.2,"Recv": 2.7,"Def": 9.7},
#     "7.0": {"Pow": 6.3,"Spd": 6.3,"Trick": 6.3,"Recv": 2.8,"Def": 9.9},
#     "7.1": {"Pow": 6.4,"Spd": 6.4,"Trick": 6.4,"Recv": 2.8,"Def": 10.0},
#     "7.2": {"Pow": 6.6,"Spd": 6.6,"Trick": 6.6,"Recv": 2.9,"Def": 10.0},
#     "7.3": {"Pow": 6.8,"Spd": 6.8,"Trick": 6.8,"Recv": 2.9,"Def": 10.0},
#     "7.4": {"Pow": 7.0,"Spd": 7.0,"Trick": 7.0,"Recv": 3.0,"Def": 10.0},
#     "7.5": {"Pow": 7.1,"Spd": 7.1,"Trick": 7.1,"Recv": 3.0,"Def": 10.0},
#     "7.6": {"Pow": 7.3,"Spd": 7.3,"Trick": 7.3,"Recv": 3.1,"Def": 10.0}
#   }
# }

############### IGNORE BELOW THIS LINE UNLESS YOU KNOW EXACTLY WHAT YOU'RE DOING ###############

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