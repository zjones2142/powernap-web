// PowerNap site config — edit these, nothing else needs to change.
//
// HOW TO HOOK UP GOOGLE CALENDAR
// 1. In Google Calendar, make the band calendar public
//    (Settings → <calendar> → Access permissions → "Make available to public").
// 2. Copy its Calendar ID from Settings → "Integrate calendar".
// 3. In Google Cloud Console, create a project, enable "Google Calendar API",
//    and create an API key. Restrict the key:
//      - Application restriction: HTTP referrers → your site's domain(s) (+ localhost for dev)
//      - API restriction: Google Calendar API only
//    A public calendar + a referrer-restricted key is safe to ship in client-side JS.
// 4. Paste both values below. Leave them empty to see sample data while designing.
window.POWERNAP_CONFIG = {
  calendarId: "",      // e.g. "abc123xyz@group.calendar.google.com"
  apiKey: "",          // e.g. "AIzaSy..."
  maxResults: 8,       // how many upcoming shows to list
};
