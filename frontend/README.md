# Events Board — iOS app

An iOS app (Expo / React Native, TypeScript) for the events board described in the
[user stories](../instructions). It consumes the API in [`../backend`](../backend).

| Story | Where |
| --- | --- |
| Event list, sorted by date | `src/app/index.tsx` — ordered by each event's earliest date |
| Share event on Twitter | `src/components/ShareButton.tsx` — on every list card and on the detail screen |
| Event detail | `src/app/events/[id].tsx` |
| Highlighted events | `src/components/FeaturedEvents.tsx` — carousel at the top of the home screen |
| Create event | `src/app/events/new.tsx` — modal opened from the **New** button |

## Requirements

- Node.js 22.18 or newer, and npm
- To run on an iPhone: the **Expo Go** app from the App Store
- To run in the iOS Simulator: a Mac with Xcode

## Run it

1. Start the backend (in another terminal):

   ```bash
   cd ../backend
   npm install
   npm start          # http://localhost:3000
   ```

2. Install and start the app:

   ```bash
   cd frontend
   npm install
   npm start
   ```

   - **iOS Simulator (Mac):** press `i`. `localhost:3000` reaches the backend directly.
   - **Your iPhone:** scan the QR code with the Camera app to open it in Expo Go. The phone
     can't see your computer's `localhost`, so point the app at your computer's LAN IP:

     ```bash
     EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npm start
     ```

## Build an installable iOS app

Builds run in the cloud with [EAS](https://docs.expo.dev/build/introduction/), so no Mac is
needed. You need a free Expo account; installing on a real device or publishing to TestFlight
also needs an Apple Developer account.

```bash
npx eas-cli@latest login
npx eas-cli@latest init                                        # links the project to your Expo account
npx eas-cli@latest build -p ios --profile simulator            # .app for the iOS Simulator
npx eas-cli@latest build -p ios --profile preview              # ad-hoc build for registered iPhones
npx eas-cli@latest build -p ios --profile production --auto-submit  # TestFlight / App Store
```

Set `EXPO_PUBLIC_API_URL` to a publicly reachable backend URL for device builds (add it under
`env` in the profile in `eas.json`, or as an EAS environment variable). The bundle identifier is
`com.aseeras.eventsboard` in `app.json`; change it if that ID is taken in your Apple account.

## Checks

```bash
npm run typecheck   # TypeScript
npm test            # date parsing, ordering, share message and form validation (node --test)
```

## Decisions and assumptions

- **Platform.** The stories describe a web SPA; this is the iOS take on it, built with a JS
  framework (React Native) as the non-functional requirements ask. Expo Router gives the
  list → detail navigation and a modal for "create".
- **Featured events** are shown as a horizontal carousel above the list, since a phone has no
  room for the right-hand sidebar from the mockup.
- **Sorting.** Events have several dates, so the list is ordered by each event's earliest date.
  Events without a valid date go last.
- **Share message.** It uses the English story wording — `I'm going to EVENT_NAME @ EVENT_DATE.` —
  with the event's earliest date, and opens Twitter/X's compose page (the app if installed).
- **Picture.** The backend stores `eventImage` as a URL and its JSON body limit is 100 KB, so the
  form asks for an image URL (with a live preview) rather than uploading a photo.
- **Dates** are picked with the native iOS date/time picker and sent in the backend's
  `MM/DD/YYYY HH:mm` format. Duplicates are ignored.
- **HTTP.** The sample images and local backend are plain `http://`, so App Transport Security
  allows arbitrary loads in `app.json`. Remove that once everything is served over HTTPS.
- **Backend fix.** `lastId()` in `backend/app/db/index.js` sorted with a boolean comparator,
  which modern Node ignores, so every new event got id 2 and overwrote an existing one (the
  backend's own `npm test` failed for the same reason). It now sorts numerically.
