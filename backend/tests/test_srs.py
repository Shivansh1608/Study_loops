import datetime
import pytest
from app.services.srs import calculate_sm2

def test_sm2_first_successful_review():
    now = datetime.datetime(2026, 1, 1, 12, 0, 0, tzinfo=datetime.timezone.utc)
    ease, interval, reps, due_date = calculate_sm2(quality=4, repetitions=0, interval=0, ease=2.5, now=now)
    assert reps == 1
    assert interval == 1
    assert due_date == now + datetime.timedelta(days=1)
    # ease should remain approx 2.5
    assert ease >= 2.4

def test_sm2_second_successful_review():
    now = datetime.datetime(2026, 1, 2, 12, 0, 0, tzinfo=datetime.timezone.utc)
    ease, interval, reps, due_date = calculate_sm2(quality=5, repetitions=1, interval=1, ease=2.5, now=now)
    assert reps == 2
    assert interval == 6
    assert due_date == now + datetime.timedelta(days=6)
    # perfect rating increases ease
    assert ease > 2.5

def test_sm2_subsequent_reviews_multiplier():
    now = datetime.datetime(2026, 1, 8, 12, 0, 0, tzinfo=datetime.timezone.utc)
    ease, interval, reps, due_date = calculate_sm2(quality=4, repetitions=2, interval=6, ease=2.6, now=now)
    assert reps == 3
    expected_interval = round(6 * ease)
    assert interval == expected_interval
    assert due_date == now + datetime.timedelta(days=expected_interval)

def test_sm2_failed_review_resets():
    now = datetime.datetime(2026, 1, 10, 12, 0, 0, tzinfo=datetime.timezone.utc)
    # user forgot (quality 1)
    ease, interval, reps, due_date = calculate_sm2(quality=1, repetitions=4, interval=15, ease=2.5, now=now)
    assert reps == 0
    assert interval == 1
    assert due_date == now + datetime.timedelta(days=1)
    assert ease < 2.5

def test_sm2_minimum_ease_floor():
    now = datetime.datetime(2026, 1, 1, 12, 0, 0, tzinfo=datetime.timezone.utc)
    # repeatedly bad quality
    ease = 1.3
    for _ in range(10):
        ease, _, _, _ = calculate_sm2(quality=0, repetitions=0, interval=1, ease=ease, now=now)
    assert ease == 1.3

def test_sm2_invalid_quality():
    with pytest.raises(ValueError):
        calculate_sm2(quality=6)
    with pytest.raises(ValueError):
        calculate_sm2(quality=-1)
