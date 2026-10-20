# How each area's layout is shaped: which tile forms its features (and the bridge
# the path uses to cross them), feature style, map size and density.
SHAPES = {
    # Brightport City
    'park': {'strip': 'φ', 'bridge': 'α', 'gen': {'feature': 'blobs', 'blobs': 2, 'w': (22, 26), 'h': (18, 22), 'patches': (6, 8), 'density': 0.025}},
    'rooftops': {'strip': 'ι', 'bridge': 'α', 'gen': {'feature': 'blobs', 'blobs': 3, 'w': (20, 24), 'h': (20, 24), 'patches': (4, 6), 'density': 0.045}},
    'subway': {'strip': 'ο', 'bridge': 'σ', 'gen': {'feature': 'band', 'bands': 2, 'w': (24, 28), 'h': (18, 20), 'patches': (4, 6), 'density': 0.02}},
    'harbor': {'strip': 'φ', 'bridge': 'α', 'gen': {'feature': 'band', 'bands': 2, 'w': (20, 24), 'h': (20, 24), 'patches': (4, 6), 'density': 0.035}},
    'clocktower': {'strip': 'Δ', 'bridge': 'α', 'gen': {'feature': 'blobs', 'blobs': 3, 'w': (22, 26), 'h': (20, 22), 'patches': (3, 5), 'density': 0.04, 'min_wild': 18}},
    # Coral Deep
    'reef': {'strip': '¤', 'bridge': 'ð', 'gen': {'feature': 'blobs', 'blobs': 4, 'w': (22, 26), 'h': (18, 22), 'patches': (5, 7), 'density': 0.03}},
    'kelp': {'strip': '¥', 'bridge': 'ð', 'gen': {'feature': 'blobs', 'blobs': 4, 'w': (20, 24), 'h': (20, 24), 'patches': (6, 8), 'density': 0.02}},
    'wreck': {'strip': '®', 'bridge': 'ð', 'gen': {'feature': 'band', 'bands': 2, 'w': (24, 28), 'h': (18, 20), 'patches': (4, 6), 'density': 0.04}},
    'trench': {'strip': 'ß', 'bridge': 'ð', 'gen': {'feature': 'blobs', 'blobs': 3, 'w': (18, 20), 'h': (22, 26), 'patches': (4, 6), 'density': 0.03}},
    'temple': {'strip': 'Ð', 'bridge': 'ð', 'gen': {'feature': 'band', 'bands': 1, 'w': (22, 26), 'h': (20, 24), 'patches': (4, 6), 'density': 0.035}},
    # Sky Isles
    'meadow2': {'strip': 'Õ', 'bridge': 'Ê', 'gen': {'feature': 'blobs', 'blobs': 3, 'w': (22, 26), 'h': (18, 22), 'patches': (5, 7), 'density': 0.02}},
    'windmill': {'gen': {'feature': 'none', 'w': (24, 28), 'h': (18, 20), 'patches': (6, 9), 'density': 0.04, 'clusters': (0, 1)}},
    'rainbow': {'strip': 'Õ', 'bridge': 'Ë', 'gen': {'feature': 'band', 'bands': 2, 'w': (20, 24), 'h': (20, 24), 'patches': (4, 6), 'density': 0.02}},
    'storm': {'strip': 'Á', 'bridge': 'Ê', 'gen': {'feature': 'blobs', 'blobs': 3, 'w': (18, 22), 'h': (22, 26), 'patches': (4, 6), 'density': 0.03}},
    'castle': {'strip': 'Ò', 'bridge': 'Ê', 'gen': {'feature': 'band', 'bands': 2, 'w': (22, 26), 'h': (20, 24), 'patches': (4, 6), 'density': 0.03}},
}
