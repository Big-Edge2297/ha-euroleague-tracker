"""Config and options flow: pick a competition, then a team."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)
import voluptuous as vol

from .api import EuroLeagueApi, EuroLeagueApiError
from .const import (
    COMPETITIONS,
    CONF_COMPETITION,
    CONF_EVENT_DELAY,
    CONF_FETCH_LEADERS,
    CONF_LIVE_INTERVAL,
    CONF_POST_GAME_HOURS,
    CONF_TEAM_CODE,
    CONF_TEAM_NAME,
    DEFAULT_EVENT_DELAY,
    DEFAULT_FETCH_LEADERS,
    DEFAULT_LIVE_INTERVAL,
    DEFAULT_POST_GAME_HOURS,
    DOMAIN,
)


class EuroLeagueTrackerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Two steps: competition, then team."""

    VERSION = 1

    def __init__(self) -> None:
        self._competition = "E"
        self._clubs: dict[str, str] = {}

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            self._competition = user_input[CONF_COMPETITION]
            api = EuroLeagueApi(async_get_clientsession(self.hass), self._competition)
            try:
                season = await api.current_season()
                clubs = await api.clubs(season["code"])
            except EuroLeagueApiError:
                errors["base"] = "cannot_connect"
            else:
                self._clubs = {
                    c["code"]: c.get("name") or c["code"]
                    for c in clubs
                    if c.get("code") and not c.get("isVirtual")
                }
                if not self._clubs:
                    errors["base"] = "no_teams"
                else:
                    return await self.async_step_team()

        schema = vol.Schema(
            {
                vol.Required(CONF_COMPETITION, default=self._competition): SelectSelector(
                    SelectSelectorConfig(
                        options=[SelectOptionDict(value=k, label=v) for k, v in COMPETITIONS.items()],
                        mode=SelectSelectorMode.LIST,
                    )
                )
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    async def async_step_team(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None and CONF_TEAM_CODE in user_input:
            code = user_input[CONF_TEAM_CODE]
            await self.async_set_unique_id(f"{self._competition}_{code}")
            self._abort_if_unique_id_configured()
            name = self._clubs.get(code, code)
            return self.async_create_entry(
                title=f"{name} ({COMPETITIONS[self._competition]})",
                data={
                    CONF_COMPETITION: self._competition,
                    CONF_TEAM_CODE: code,
                    CONF_TEAM_NAME: name,
                },
            )

        options = [
            SelectOptionDict(value=code, label=name)
            for code, name in sorted(self._clubs.items(), key=lambda kv: kv[1])
        ]
        schema = vol.Schema(
            {
                vol.Required(CONF_TEAM_CODE): SelectSelector(
                    SelectSelectorConfig(options=options, mode=SelectSelectorMode.DROPDOWN)
                )
            }
        )
        return self.async_show_form(step_id="team", data_schema=schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry) -> OptionsFlow:
        return EuroLeagueTrackerOptionsFlow()


class EuroLeagueTrackerOptionsFlow(OptionsFlow):
    """Polling and data options."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        opts = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_LIVE_INTERVAL, default=opts.get(CONF_LIVE_INTERVAL, DEFAULT_LIVE_INTERVAL)
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=5, max=120, step=1, unit_of_measurement="s", mode=NumberSelectorMode.BOX
                    )
                ),
                vol.Required(
                    CONF_POST_GAME_HOURS,
                    default=opts.get(CONF_POST_GAME_HOURS, DEFAULT_POST_GAME_HOURS),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=1, max=96, step=1, unit_of_measurement="h", mode=NumberSelectorMode.BOX
                    )
                ),
                vol.Required(
                    CONF_EVENT_DELAY, default=opts.get(CONF_EVENT_DELAY, DEFAULT_EVENT_DELAY)
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=0, max=180, step=1, unit_of_measurement="s", mode=NumberSelectorMode.BOX
                    )
                ),
                vol.Required(
                    CONF_FETCH_LEADERS, default=opts.get(CONF_FETCH_LEADERS, DEFAULT_FETCH_LEADERS)
                ): BooleanSelector(),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
