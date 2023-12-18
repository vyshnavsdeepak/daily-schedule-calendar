const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

// Replace with your own client ID and client secret from the Google Cloud Console, create a desktop app
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = 'http://localhost';

// Replace with your own calendar ID
const calendarId = 'primary';

// Replace with the path to your token file
const TOKEN_PATH = 'token.json';

// Create an OAuth2 client with the given credentials
const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

// Check if we have previously stored a token
fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) {
    return getAccessToken(oAuth2Client);
  }
  oAuth2Client.setCredentials(JSON.parse(token));
  addEvents(oAuth2Client);
});

// Get and store new token after prompting for user authorization
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      addEvents(oAuth2Client);
    });
  });
}

// List the next 10 events on the user's calendar
// Add events to the user's calendar
function addEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });

  const today = new Date().toISOString().split('T')[0];

  // Define your events here, following the structure you provided
  const events = [
    {
      summary: 'Wake up and get ready',
      start: { dateTime: `${today}T06:30:00+05:30`},
      end: { dateTime: `${today}T07:00:00+05:30`},
    },
    {
      summary: 'Cycling',
      start: { dateTime: `${today}T07:00:00+05:30`},
      end: { dateTime: `${today}T08:00:00+05:30`},
    },
    {
      summary: 'Breakfast',
      start: { dateTime: `${today}T08:00:00+05:30`},
      end: { dateTime: `${today}T09:00:00+05:30`},
    },
    {
      summary: 'Work',
      start: { dateTime: `${today}T09:00:00+05:30`},
      end: { dateTime: `${today}T12:00:00+05:30`},
    },
    {
      summary: 'Lunch',
      start: { dateTime: `${today}T12:00:00+05:30`},
      end: { dateTime: `${today}T13:00:00+05:30`},
    },
    {
      summary: 'Work',
      start: { dateTime: `${today}T13:00:00+05:30`},
      end: { dateTime: `${today}T15:00:00+05:30`},
    },
    {
      summary: 'Afternoon break',
      start: { dateTime: `${today}T15:00:00+05:30`},
      end: { dateTime: `${today}T15:30:00+05:30`},
    },
    {
      summary: 'Work',
      start: { dateTime: `${today}T15:30:00+05:30`},
      end: { dateTime: `${today}T17:00:00+05:30`},
    },
    {
      summary: 'Cooking',
      start: { dateTime: `${today}T17:00:00+05:30`},
      end: { dateTime: `${today}T18:00:00+05:30`},
    },
    {
      summary: 'Dinner',
      start: { dateTime: `${today}T18:00:00+05:30`},
      end: { dateTime: `${today}T19:00:00+05:30`},
    },
    {
      summary: 'Free time/Relaxation',
      start: { dateTime: `${today}T19:00:00+05:30`},
      end: { dateTime: `${today}T20:00:00+05:30`},
    },
    {
      summary: 'Leisure activities (reading, entertainment)',
      start: { dateTime: `${today}T20:00:00+05:30`},
      end: { dateTime: `${today}T21:00:00+05:30`},
    },
    {
      summary: 'Prepare for bed and wind down',
      start: { dateTime: `${today}T21:00:00+05:30`},
      end: { dateTime: `${today}T22:00:00+05:30`},
    },
  ];

  // Loop through the events and add each to the calendar
  events.forEach((event) => {
    calendar.events.insert(
      {
        calendarId,
        resource: event,
      },
      (err, res) => {
        if (err) return console.error('Error adding event:', err.message);

        console.log('Event added:', res.data);
      }
    );
  });
}

function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  calendar.events.list(
    {
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    },
    (err, res) => {
      if (err) return console.error('The API returned an error:', err.message);

      const events = res.data.items;
      if (events.length) {
        console.log('Upcoming events:');
        events.forEach((event) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
        });
      } else {
        console.log('No upcoming events found.');
      }
    }
  );
}