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

Config values

- **referenceDate**: A date of which you knew the flex balance at _the end of
  the day_.

- **referenceBalance**: The flex balance you had at the _end_ of the
  referenceDate

- **hoursOnWorkdays**: The amount of hours you are expected to register on
  working days.

- **hoursOnHolidays**: The amount of hours you are expected to register on
  holidays. This is mostly relevant if you workplace expects you to register
  "Holiday" or something for all holidays. See information about
  `hoursOnSpecificHolidays` for more information about holidays.

- **hoursOnSpecificHolidays**: Defines the amount of hours that is expected to
  on each holiday. Bounty should ask you to specifiy some of the common holidays
  on the first invocation. See section below for more information.

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
independenceDay (17. may, Norwegian independence day)
christmasEve
christmasDay
boxingDay
newYearsEve
```

If you were to specify the same number for all holidays:

```javascript
{
  .
  .
  .
  "hoursOnHolidays": 0,
  "hoursOnSpecificHolidays": {
    "palmSunday": 7.5,
    "holyWednesday": 7.5,
    "maundyThursday": 7.5
    .
    .
    .
  }
}
```

then that would be equivalent to just setting `hoursOnHolidays` to `7.5`. And
leaving `hoursOnSpecificHolidays` empty like this:

```javascript
{
  .
  .
  .
  "hoursOnHolidays": 7.5,
  "hoursOnSpecificHolidays": {}
}
```

`hoursOnSpecificHolidays` are for exceptions. For example in the following
config you specify that you won't register any hours (zero hours) on holidays in general, but
you want to register `3.75` hours just on holy wednesday and christmas eve.

```javascript
{
  .
  .
  .
  "hoursOnHolidays": 0,
  "hoursOnSpecificHolidays": {
    "holyWednesday": 3.75,
    "christmasEve": 3.75
  }
}
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

Config values

- **version**: The `version` is just for tracking which version the harvest config is in. For
  example over time one may want more configuration options and such. What has
  been generally done is to implmenent "migrations" that automatically updates the
  config as needed.

- **headers**: The values in `headers` are used for authentication with Harvest. You can get
  your Harvest info at https://id.getharvest.com/developers. Bounty should prompt
  you for it in your first bounty invocation.

- **entriesToIgnore**: One can specify what type of time entries one wants to ignore. This may
  be relevant in the case of overtime work. If one registers hours that represents overtime work,
  then one may not wan't to count those in the flex time balance.
  You have to specify both the `project` and `task` values in order to ignore
  entires, and they have to match exactly by string with the entries.

### Clockify

NOTE: The Clockify integration only works for single workspaces.

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

Config values:

- **version**: Has the same role as in the Harvest config.

- **apiKey**: Clockify authorization key. You can find your API key at
  https://app.clockify.me/user/settings. Bounty should help find your userIds and
  workspaceIds on your first invocation.

- **userId**: Clockify user id. Bounty should figure it out for you in the first
  invocation.

- **workspaceId**: The Clockify workspace relevant for you. Bounty will guide
  you through the process in the first invocation.

- **entriesToIgnore**: Same purpose as in Harvest config, but has a little bit
  different behavior. In the clockify config you can specify `projectName`,
  `clientName` and `label`. The more you specify, the more specific the "query"
  will become. For example if you only specify `{"projectName": "Test"}`, then you
  will everything that goes under the project named "Test". If you specify more,
  such as `{"projectName": "Test", "label": "Meeting"}`, then everything that is
  under the project "Test" AND that has the label "Meeting" will be ignored.
