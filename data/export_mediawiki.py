#!/usr/bin/env python3
"""
Export ability levels dictionary to MediaWiki table format.
"""

import json


def levels_to_mediawiki(levels_dict):
    """
    Convert a levels dictionary to MediaWiki table format.
    
    Args:
        levels_dict: Dictionary mapping level strings to stat dictionaries
                    e.g., {"2.0": {"Pow": 1.7, "Spd": 1.7, ...}, ...}
    
    Returns:
        str: MediaWiki table markup
    """
    # Header row
    output = "! Level !! Pow !! Spd !! Trick !! Recv !! Def\n"
    
    # Sort levels numerically (convert string to float for sorting)
    sorted_levels = sorted(levels_dict.keys(), key=lambda x: float(x))
    
    # Data rows
    for level in sorted_levels:
        stats = levels_dict[level]
        output += "|-\n"
        output += f"| {level} || {stats['Pow']} || {stats['Spd']} || {stats['Trick']} || {stats['Recv']} || {stats['Def']}\n"
    
    return output


def nested_levels_to_mediawiki(nested_dict):
    """
    Convert nested levels dictionary (like Phase Shift) to MediaWiki tables.
    
    Args:
        nested_dict: Dictionary with forms containing levels
                    e.g., {"Teleportation Form": {"1.0": {...}, ...}, ...}
    
    Returns:
        str: MediaWiki tables for all forms
    """
    output = ""
    
    for form_name, levels in nested_dict.items():
        output += f"=== {form_name} ===\n"
        output += levels_to_mediawiki(levels)
        output += "\n"
    
    return output


def main():
    """Example usage: load from abilities.json and export an ability."""
    
    # Example 1: Direct dictionary input
    example_levels = {
        "2.0": {"Pow": 1.7, "Spd": 1.7, "Trick": 1.0, "Recv": 1.0, "Def": 2.1},
        "2.1": {"Pow": 1.8, "Spd": 1.8, "Trick": 1.0, "Recv": 1.0, "Def": 2.3},
        "2.2": {"Pow": 1.9, "Spd": 1.9, "Trick": 1.0, "Recv": 1.0, "Def": 2.4},
        "2.3": {"Pow": 2.0, "Spd": 2.0, "Trick": 1.0, "Recv": 1.0, "Def": 2.6},
        "2.4": {"Pow": 2.1, "Spd": 2.1, "Trick": 1.0, "Recv": 1.0, "Def": 2.7},
        "2.5": {"Pow": 2.3, "Spd": 2.3, "Trick": 1.0, "Recv": 1.0, "Def": 2.9},
        "2.6": {"Pow": 2.4, "Spd": 2.4, "Trick": 1.0, "Recv": 1.0, "Def": 3.0},
        "2.7": {"Pow": 2.5, "Spd": 2.5, "Trick": 1.0, "Recv": 1.0, "Def": 3.2},
        "2.8": {"Pow": 2.6, "Spd": 2.6, "Trick": 1.0, "Recv": 1.0, "Def": 3.4},
        "2.9": {"Pow": 2.7, "Spd": 2.7, "Trick": 1.0, "Recv": 1.0, "Def": 3.6},
        "3.0": {"Pow": 2.8, "Spd": 2.8, "Trick": 1.0, "Recv": 1.0, "Def": 3.7},
    }
    
    print("Example 1: Simple levels dictionary")
    print("=" * 50)
    print(levels_to_mediawiki(example_levels))
    print()
    
    # Example 2: Load from abilities.json
    try:
        with open('../abilities.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Example: Export Strong Punch from Mid-Tier
        if "Mid-Tier" in data and "Strong Punch" in data["Mid-Tier"]:
            print("Example 2: Strong Punch from abilities.json")
            print("=" * 50)
            strong_punch_levels = data["Mid-Tier"]["Strong Punch"]["levels"]
            print(levels_to_mediawiki(strong_punch_levels))
            print()
        
        # Example 3: Nested levels (Phase Shift)
        if "Elite-Tier" in data and "Phase Shift" in data["Elite-Tier"]:
            phase_shift_levels = data["Elite-Tier"]["Phase Shift"]["levels"]
            print("Example 3: Phase Shift (nested forms)")
            print("=" * 50)
            print(nested_levels_to_mediawiki(phase_shift_levels))
    
    except FileNotFoundError:
        print("abilities.json not found. Run this script from the data/ directory.")
    except Exception as e:
        print(f"Error loading abilities.json: {e}")


if __name__ == "__main__":
    main()
