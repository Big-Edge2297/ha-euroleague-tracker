"""Constants for EuroLeague Tracker."""

from __future__ import annotations

from datetime import timedelta
from typing import Final

DOMAIN: Final = "euroleague_tracker"
NAME: Final = "EuroLeague Tracker"
ATTRIBUTION: Final = "Data provided by the EuroLeague API (unofficial integration)"

API_BASE: Final = "https://api-live.euroleague.net"
LIVE_BASE: Final = "https://live.euroleague.net/api"

CONF_COMPETITION: Final = "competition"
CONF_TEAM_CODE: Final = "team_code"
CONF_TEAM_NAME: Final = "team_name"
CONF_LIVE_INTERVAL: Final = "live_interval"
CONF_FETCH_LEADERS: Final = "fetch_leaders"
CONF_POST_GAME_HOURS: Final = "post_game_hours"
CONF_EVENT_DELAY: Final = "event_delay"

COMPETITIONS: Final = {"E": "EuroLeague", "U": "EuroCup"}

DEFAULT_LIVE_INTERVAL: Final = 15  # seconds
DEFAULT_POST_GAME_HOURS: Final = 24
DEFAULT_FETCH_LEADERS: Final = True
DEFAULT_EVENT_DELAY: Final = 0  # seconds; raise it to match a TV stream that runs behind

# Polling cadence outside live games.
INTERVAL_IDLE: Final = timedelta(minutes=15)
INTERVAL_GAME_DAY: Final = timedelta(minutes=5)
INTERVAL_PRE_GAME: Final = timedelta(minutes=1)  # within an hour of tip-off
INTERVAL_POST_GAME: Final = timedelta(minutes=5)  # shortly after the final buzzer

# Cache lifetimes for the large/slow-changing endpoints.
CACHE_SEASONS: Final = timedelta(hours=24)
CACHE_CLUBS: Final = timedelta(hours=24)
CACHE_GAMES: Final = timedelta(hours=3)
CACHE_ROUNDS: Final = timedelta(hours=12)
CACHE_STANDINGS: Final = timedelta(minutes=30)
CACHE_TEAM_STATS: Final = timedelta(hours=2)
CACHE_LEADERS: Final = timedelta(hours=12)

# Season shot zones: finished games' shots fetched per update (once each).
ZONE_FETCHES_PER_UPDATE: Final = 10
# While some are still to read, the next update comes this soon.
ZONE_CATCH_UP: Final = timedelta(minutes=1)


def zone_store_key(entry_id: str) -> str:
    """Where an entry's season shot zones are saved (.storage/)."""
    return f"{DOMAIN}.zones.{entry_id}"


# Head to head looks this many seasons back (plus the current one).
H2H_PAST_SEASONS: Final = 2

# Minimum spacing between calls to the rate-limited live host.
LIVE_MIN_SPACING: Final = 0.25  # seconds

EVENT_NAME: Final = "euroleague_tracker_event"

STATE_PRE: Final = "PRE"
STATE_IN: Final = "IN"
STATE_POST: Final = "POST"
STATE_NOT_FOUND: Final = "NOT_FOUND"

PLAYOFF_SPOTS: Final = 6
PLAY_IN_SPOTS: Final = 10

FRONTEND_URL_BASE: Final = "/euroleague_tracker"
CARD_FILENAME: Final = "euroleague-tracker-card.js"

# Approximate primary club colours, used for the card's "team" theme.
# Users can override these with `team_color` in the card config.
TEAM_COLORS: Final = {
    "ASV": "#00843D",
    "BAR": "#A50044",
    "BAS": "#003C82",
    "BES": "#1A1A1A",
    "DUB": "#0B2545",
    "HTA": "#C8102E",
    "IST": "#002D72",
    "MAD": "#3D2B7A",
    "MIL": "#D50032",
    "MUN": "#DC052D",
    "OLY": "#C62828",
    "PAM": "#E5641E",
    "PAN": "#007A33",
    "PAR": "#1C1C1C",
    "PRS": "#101820",
    "RED": "#C8102E",
    "TEL": "#F2C200",
    "ULK": "#13245E",
    "VIR": "#222222",
    "ZAL": "#006A44",
}
