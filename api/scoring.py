def calculate_points(prediction, result):
    """
    prediction: dict/object with user's picks (quali_p1_driver, race_p1_driver, etc.)
    result: dict/object with actual race results (same keys)
    """
    score = 0
    
    # --- QUALIFYING ---
    if prediction['quali_p1_driver'] == result['quali_p1_driver']:
        score += 5
    if prediction['quali_p2_driver'] == result['quali_p2_driver']:
        score += 3
    if prediction['quali_p3_driver'] == result['quali_p3_driver']:
        score += 1

    # --- RACE ---
    # We track hits for the Podium Trio logic later
    race_hits = []
    
    # P1
    if prediction['race_p1_driver'] == result['race_p1_driver']:
        score += 10
        race_hits.append(prediction['race_p1_driver'])
    
    # P2
    if prediction['race_p2_driver'] == result['race_p2_driver']:
        score += 8
        race_hits.append(prediction['race_p2_driver'])
        
    # P3
    if prediction['race_p3_driver'] == result['race_p3_driver']:
        score += 6
        race_hits.append(prediction['race_p3_driver'])

    # --- MULTIPLIERS (Your Custom Rules) ---
    
    # 1. HAT TRICK (Pole + Win)
    # Check if user correctly predicted Pole AND correctly predicted Winner
    # AND if the driver is the same person (e.g. Max Pole & Max Win)
    if (prediction['quali_p1_driver'] == result['quali_p1_driver'] and 
        prediction['race_p1_driver'] == result['race_p1_driver'] and
        prediction['quali_p1_driver'] == prediction['race_p1_driver']):
        score += 2

    # 2. PODIUM TRIO
    # Convert picks and results to sets to check for "Any Order"
    user_podium = {prediction['race_p1_driver'], prediction['race_p2_driver'], prediction['race_p3_driver']}
    actual_podium = {result['race_p1_driver'], result['race_p2_driver'], result['race_p3_driver']}
    
    # Check Exact Order (All 3 matches in specific slots)
    if len(race_hits) == 3:
        score += 5  # Bonus for Exact Order
    
    # Check Any Order (All 3 drivers present, but not necessarily in right slots)
    # Note: If they got Exact Order, they technically also got Any Order. 
    # Usually you award the higher one only. 
    # Logic below: If not exact, check for any order.
    elif user_podium == actual_podium:
        score += 2

    # --- MANUAL GRADING (Added by Admin later) ---
    # These are stored in the DB as boolean flags or points directly
    # We assume 'manual_points' is passed in if this is a re-calculation
    if 'manual_points' in prediction:
        score += prediction['manual_points']

    return score