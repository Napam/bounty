# Requirements
- Node v15 or higher
- npm

# Install
1. `npm install -g @napam/bounty`

# Info
The first `bounty` call will prompt for user info. The info is then stored in `~/.bounty/config.json`, which you can alter manually in case you want to change something, or maybe the prompt failed. The config is for example
```json
{
    "version": "3",
    "headers": {
        "Harvest-Account-ID": "123123",
        "Authorization": "Bearer gucci.flipflops123123"
    },
    "referenceDate": "2022-10-31",
    "referenceBalance": 36.75,
    "entriesToIgnore": [
        {
            "project": "Absence",
            "task": "Time off"
        }
    ],
    "expectedRegisteredHoursOnWorkdays": 7.5,
    "expectedRegisteredHoursOnHolidays": 7.5
}
```
**It is possible to manually edit the config file**. You can get your Harvest info at https://id.getharvest.com/developers. The properties `referenceDate` and `referenceBalance` are used to accomodate for your previous flex balance. That is, for the property `referenceDate` enter an earlier date (`YYYY-MM-DD`) of which you knew your flextime, and for propery `referenceBalance` enter said flextime.
