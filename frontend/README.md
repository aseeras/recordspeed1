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
- To run in the iOS Simulator or build with Xcode: a Mac with Xcode (see [Open and run it in Xcode](#open-and-run-it-in-xcode-mac))

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

## Open and run it in Xcode (Mac)

The native Xcode project is committed in `ios/`. Open **`ios/EventsBoard.xcworkspace`** (the
workspace, not the `.xcodeproj`), because it includes the CocoaPods libraries.

One-time setup:

1. Install **Xcode** from the Mac App Store, open it once, and let it install the **iOS** platform
   (simulator).
2. Install [Node.js](https://nodejs.org) 22.18+ and CocoaPods: `brew install cocoapods`
   (or `sudo gem install cocoapods`).
3. Install the dependencies:

   ```bash
   cd frontend
   npm install
   cd ios && pod install && cd ..
   ```

4. Xcode runs Node to bundle the JavaScript. If Xcode can't find it (error mentioning
   `NODE_BINARY` or `node: command not found`), run this once in `frontend/ios`:

   ```bash
   echo "export NODE_BINARY=$(command -v node)" > .xcode.env.local
   ```

Run it:

1. Start the backend in a Terminal: `cd backend && npm install && npm start`.
2. Open the workspace: `open ios/EventsBoard.xcworkspace`.
3. In Xcode's toolbar, choose the **EventsBoard** scheme and an iPhone simulator (for example
   *iPhone 16*), then press **▶ Run** (⌘R).

The **Debug** configuration loads the JavaScript from the Metro dev server, which Xcode starts in a
Terminal window automatically. If it doesn't, run `npm start` in `frontend/` yourself. To run on
your own iPhone, plug it in, select it as the destination, and under **Signing & Capabilities** pick
your Apple ID team. A free Apple ID is enough for your own device.

`npm run ios` does all of the above (pods, build, launch the simulator) in one command.

If you change `app.json` or add a library with native code, regenerate the project with
`npx expo prebuild --platform ios`.

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
