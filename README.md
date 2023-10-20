# Bounty

A tool to calculate flex balance for time tracker programs that does not
have flex balance tracking 🙃

Features:

- Holiday handling!
  - Some workplaces may want you to register hours on holidays, some don't,
    bounty has you covered! It is configurable.
  - Best suited for countries with holidays similar to Norway at the moment
    (Christian holidays mostly), but
    more can be implemented if desired.
- Provider agnostic core logic!
  - Bounty's architechture is separeated into a "core" module and integration
    modules. It makes it easy to integrate multiple time tracking providers. As
    of now Bounty supports:
    - Harvest
    - Clockify
  - Send PR or create an issue if you want integration to something else.
- Plan to make into a npm package that you can actually use with your own code!
  - Not really a feature!
  - It is already a npm package, but you can't really easily import it
    conventionally as of now, but I think it would be cool to make it easily
    importable. TODO: Ditch JSDoc and setup Typescript.

# Requirements

- Node v15 or higher
- npm

# Install

1. `npm install -g @napam/bounty`
1. Assuming you have npm installed properly, you should now be able to run `bounty`
   in the terminal.

# Info

The first `bounty` invocation will prompt for user info. The core bounty info is then
stored in `~/.bounty/config.json`, which you can alter manually in case you want
to change or fix something. The core config is for example

TODO: Add definition for workdays

```json
{
  "version": "1",
  "integration": "clockify",
  "referenceDate": "2023-08-14",
  "referenceBalance": 2,
  "hoursOnWorkdays": 7.5,
  "hoursOnHolidays": 0,
  "hoursOnSpecificHolidays": {
    "holyWednesday": 3.75,
    "christmasEve": 3.75
  }
}
```

#### referenceDate and referenceBalance

The properties `referenceDate` and `referenceBalance` are used to accomodate for
your previous flex balance. That is, for the property `referenceDate` enter
an earlier date (`YYYY-MM-DD`) of which you knew your flextime, and for
property `referenceBalance` enter said flextime.

#### hoursOnWorkdays and hoursOnHolidays

The amount of hours you are expected to register on workdays and holidays
respectively. With holidays I mean christmas and such. The `hoursOnHolidays` will
define the amount of hours that is expected to be registered for _all_ holidays.
If you need more granular control, see the next section.

#### hoursOnSpecificHolidays

In `hoursOnSpecificHolidays` you can define how many hours it is expected to
register for specific holidays. The available holidays are:

```
palmSunday
holyWednesday
maundyThursday
goodFriday
easterSunday
easterMonday
ascensionDay
whitsun
whitMonday
newYear
workersDay
independenceDay
christmasEve
christmasDay
boxingDay
newYearsEve
```

## Providers

There has been implemented integrations for two providers so far: Clockify and
Harvest.

### Harvest

The config file for Harvest is `~/.bounty/harvest.json`, here is an example:

```json
{
  "version": "4",
  "headers": {
    "Harvest-Account-ID": "123123",
    "Authorization": "Bearer gucci.flipflops123123"
  },
  "entriesToIgnore": [
    {
      "project": "Absence",
      "task": "Time off"
    }
  ]
}
```

You can get your Harvest info at https://id.getharvest.com/developers. Bounty
should prompt you for it in your first bounty invocation.

### Clockify

The config file for Clockify is `~/.bounty/clockify.json`, here is an example:

```json
{
  "version": "1",
  "apiKey": "GucciGangGucciGang",
  "userId": "420",
  "workspaceId": "69",
  "entriesToIgnore": [
    {
      "projectName": "Vacation"
    }
  ]
}
```

You can get your Clockify info at https://app.clockify.me/user/settings. The
properties `referenceDate` and `referenceBalance` are used to accomodate for
your previous flex balance. That is, for the property `referenceDate` enter
an earlier date (`YYYY-MM-DD`) of which you knew your flextime, and for
property `referenceBalance` enter said flextime. The values for userId will
get inferred from your API key, but you will have to select / obtain a
workspaceId.
