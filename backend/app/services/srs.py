import datetime
from typing import Tuple

def calculate_sm2(
    quality: int,
    repetitions: int = 0,
    interval: int = 0,
    ease: float = 2.5,
    now: datetime.datetime = None
) -> Tuple[float, int, int, datetime.datetime]:
    """
    SuperMemo SM-2 Spaced Repetition Algorithm.
    
    Args:
        quality: User recall quality rating from 0 (blackout) to 5 (perfect).
        repetitions: Number of successful reviews so far.
        interval: Current interval in days.
        ease: Easiness factor (minimum 1.3, default 2.5).
        now: Current timestamp (defaults to UTC now).

    Returns:
        (new_ease, new_interval, new_repetitions, due_date)
    """
    if quality < 0 or quality > 5:
        raise ValueError(f"Quality must be between 0 and 5, got {quality}")

    if now is None:
        now = datetime.datetime.now(datetime.timezone.utc)

    # 1. Update ease factor
    # Formula: ease' = ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
    new_ease = ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    new_ease = max(1.3, round(new_ease, 3))

    # 2. Check quality rating
    if quality < 3:
        # Failure: reset repetition streak, interval resets to 1 day
        new_repetitions = 0
        new_interval = 1
    else:
        # Success: advance interval
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval * new_ease)
            new_interval = max(1, new_interval)
            
        new_repetitions = repetitions + 1

    # 3. Compute next due date
    due_date = now + datetime.timedelta(days=new_interval)

    return new_ease, new_interval, new_repetitions, due_date
