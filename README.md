# Requirements

- Node v15 or higher
- npm

# Install

1. `npm install -g @napam/bounty`

# Info

The first `bounty` call will prompt for user info. The core bounty info is then
stored in `~/.bounty/config.json`, which you can alter manually in case you want
to change something, or maybe the prompt failed. The core config is for example

```json
{
  "version": "1",
  "integration": "clockify"
}
```

Bounty is implemented to be "provider agnostic", such that one can implement
support for different providers. The config is used to specify which provider one
wants to use. Each provider has their own config files in `~/.bounty/`.

## Providers
There has been implemented integrations for two providers so for: Clockify and
Harvest. Note that bounty can significantly differ in usage based on one
provider from another. For instance, Clockify usees HH:MM as time format, while
Harvest uses decimal values.

### Harvest

The config file for Harvest is `~/.bounty/harvest.json`, here is an example:

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

You can get your Harvest info at https://id.getharvest.com/developers. The
properties `referenceDate` and `referenceBalance` are used to accomodate for 
your previous flex balance. That is, for the property `referenceDate` enter
an earlier date (`YYYY-MM-DD`) of which you knew your flextime, and for 
property `referenceBalance` enter said flextime.

### Clockify

The config file for Clockify is `~/.bounty/clockify.json`, here is an example:

```json
{
  "version": "1",
  "apiKey": "Gucci.flippyfloppy",
  "referenceDate": "2023-08-14",
  "referenceBalance": "00:00",
  "expectedRegisteredHoursOnWorkdays": "07:30",
  "expectedRegisteredHoursOnHolidays": "00:00",
  "userId": "userid42069",
  "workspaceId": "workspaceid4206969696969696969"
}
```

You can get your Clockify info at https://app.clockify.me/user/settings. The
properties `referenceDate` and `referenceBalance` are used to accomodate for 
your previous flex balance. That is, for the property `referenceDate` enter
an earlier date (`YYYY-MM-DD`) of which you knew your flextime, and for 
property `referenceBalance` enter said flextime. The values for userId will
get inferred from your API key, but you will have to select / obtain a
workspaceId.
