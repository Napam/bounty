# Requirements
- Node v15 or higher
- yarn

# Install
1. `yarn` &rarr; *install required modules*
2. `yarn link` &rarr; *makes bounty available everywhere*
3. `bounty` &rarr; *run bounty*

# Info
The first `bounty` call will prompt for user info. The info is then stored in `~/.bounty/config.json`, which you can alter manually in case you want to change something, or maybe the prompt failed. The config is for example
```json
{
    "headers": {
        "Harvest-Account-ID": "123456",
        "Authorization": "Bearer bingbongdingdong"
    },
    "referenceDate": "2022-01-12",
    "referenceBalance": 12.75
}
```
You can get your Harvest info at https://id.getharvest.com/developers. The properties `referenceDate` and `referenceBalance` are used to accomodate for your previous flex balance. That is, for the property `referenceDate` enter an earlier date (`YYYY-MM-DD`) of which you knew your flextime, and for propery `referenceBalance` enter said flextime.
