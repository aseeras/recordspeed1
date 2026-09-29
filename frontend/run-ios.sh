#!/usr/bin/env bash
# Builds Events Board and runs it in the iOS Simulator, in one step.
#
#   cd frontend && bash run-ios.sh
#
# It uses a Release build, so the JavaScript is bundled into the app and no Metro dev server is
# needed. It also starts the events backend (../backend) if it isn't already running; without it
# the app still opens and shows built-in demo events.
set -euo pipefail

cd "$(dirname "$0")"
FRONTEND="$(pwd)"
BUNDLE_ID="com.aseeras.eventsboard"
BUILD_DIR="$FRONTEND/ios/build"
LOG="$BUILD_DIR/xcodebuild.log"

step() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
fail() { printf '\n\033[31mError:\033[0m %s\n' "$1" >&2; exit 1; }

step "Checking tools"
command -v xcodebuild >/dev/null || fail "Xcode isn't installed. Install it from the Mac App Store."
if xcode-select -p | grep -q CommandLineTools; then
  fail "The command-line tools point at CommandLineTools, not Xcode. Run:
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
fi
command -v node >/dev/null || fail "Node.js isn't installed. Run: brew install node"
command -v pod >/dev/null || fail "CocoaPods isn't installed. Run: brew install cocoapods"
xcodebuild -version | head -n 1

step "Picking an iPhone simulator"
UDID="${SIMULATOR_UDID:-$(xcrun simctl list devices available | grep -E '^\s+iPhone' | grep -m1 -oE '[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}' || true)}"
[ -n "$UDID" ] || fail "No iPhone simulator is installed. Run:
  xcodebuild -downloadPlatform iOS
then run this script again."
xcrun simctl list devices | grep "$UDID"

step "Starting the events backend"
if curl -sf http://localhost:3000/events >/dev/null 2>&1; then
  echo "Already running on http://localhost:3000"
elif [ -d ../backend ]; then
  (cd ../backend && { [ -d node_modules ] || npm install --no-audit --no-fund; } \
    && nohup node app/index.js > "${TMPDIR:-/tmp}/eventsboard-backend.log" 2>&1 &)
  for _ in $(seq 1 20); do curl -sf http://localhost:3000/events >/dev/null 2>&1 && break; sleep 0.5; done
  if curl -sf http://localhost:3000/events >/dev/null 2>&1; then
    echo "Started on http://localhost:3000 (log: ${TMPDIR:-/tmp}/eventsboard-backend.log)"
  else
    echo "Couldn't start it; the app will show demo events instead."
  fi
fi

step "Installing JavaScript dependencies"
npm install --no-audit --no-fund

step "Installing iOS libraries (CocoaPods)"
(cd ios && pod install)
# Xcode runs Node to bundle the JavaScript; tell it where Node is (Homebrew paths aren't on Xcode's PATH).
echo "export NODE_BINARY=$(command -v node)" > ios/.xcode.env.local

step "Booting the simulator"
# Simulator.app lives inside Xcode; open it by path (it isn't always registered by name).
SIM_APP="$(xcode-select -p)/Applications/Simulator.app"
xcrun simctl boot "$UDID" 2>/dev/null || true
open "$SIM_APP" --args -CurrentDeviceUDID "$UDID" 2>/dev/null \
  || open -a Simulator 2>/dev/null \
  || echo "Couldn't open the Simulator window; the app will still be installed and launched."
xcrun simctl bootstatus "$UDID" -b > /dev/null

step "Building the app (first build takes 5-15 minutes)"
mkdir -p "$BUILD_DIR"
if ! xcodebuild \
  -workspace ios/EventsBoard.xcworkspace \
  -scheme EventsBoard \
  -configuration Release \
  -sdk iphonesimulator \
  -destination "id=$UDID" \
  -derivedDataPath "$BUILD_DIR" \
  CODE_SIGNING_ALLOWED=NO \
  build > "$LOG" 2>&1; then
  grep -E "error:|BUILD FAILED" "$LOG" | head -n 20 || tail -n 40 "$LOG"
  fail "The build failed. Full log: $LOG"
fi
echo "Build succeeded."

step "Installing and launching Events Board"
APP="$BUILD_DIR/Build/Products/Release-iphonesimulator/EventsBoard.app"
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" "$BUNDLE_ID"

printf '\n\033[32mEvents Board is running in the Simulator.\033[0m\n'
