# iPhone Web Simulator

A web project that recreates the look and basic interaction of an iPhone interface.

The project simulates a phone with a lock screen, home screen and several working apps.

## Run locally

This is a static website, so it does not need `npm install` or a build step.

1. Start a static server from the repository folder, for example: `python -m http.server 8000`
2. Open `http://localhost:8000/` to start the phone flow.
3. On the first visit, choose a player name and avatar. The profile is stored only in the current browser.
4. Continue to the lock screen and unlock the phone.

On the lock screen, press `CTRL` or the black side button to wake the display. Then click the white bar, press `ArrowUp`, or swipe upward to open the iOS-style passcode screen. The demo passcode is `0130`.

## Features

- iPhone-style lock screen
- Interactive four-digit passcode screen with keyboard support
- Separate custom wallpapers for the lock screen and home screen
- Player setup before the first lock screen, with a shared local name and avatar
- Chinese KakaoTalk simulation with no login page and one chat: 金道勋
- KakaoTalk reads the same player name and avatar as future social apps
- Screen turns on by pressing a button or `CTRL`
- Realistic homepage interface with time display
- Swipe bar to access the home screen
- Four working apps:
  - Messages
  - Phone
  - Calculator
  - KakaoTalk

## Apps

### Messages
- Custom on-screen keyboard
- Keyboard can be opened and closed
- Send messages
- Delete messages
- Switch between letters and numbers
- Uppercase support

### Phone
- Dial phone numbers
- Automatic formatting for numbers like `+381`
- Recognizes Serbian mobile numbers starting with `06`

### Calculator
- iPhone-style calculator interface
- Basic arithmetic operations

### KakaoTalk
- Opens directly from the home-screen KakaoTalk icon
- Chinese friends, chat and profile screens
- Only one conversation, with 金道勋
- Uses the selected player name and avatar from `localStorage`
- Supports sending and locally saving demo messages

## System Behavior

- Navigation happens dynamically without reloading pages
- Elements are shown and hidden using JavaScript
- Turning the phone off always returns to the lock screen

## Technologies

- HTML
- CSS
- JavaScript

## What I Learned

- Advanced DOM manipulation
- Showing and hiding UI components dynamically
- Handling keyboard and button events
- Creating interactive UI components
- Managing application state without page reload
- Building more complex JavaScript logic

## Author

Software engineering student at ITS

## Screenshots

<img width="1000" height="1000" alt="Screenshot from 2026-03-08 17-10-02" src="https://github.com/user-attachments/assets/2ba5cf02-c274-49ed-897a-ccfb26a17763" />
<img width="1000" height="1000" alt="Screenshot from 2026-03-08 17-10-24" src="https://github.com/user-attachments/assets/0157994a-d739-41af-88c6-2bf25dfeb73d" />
<img width="1000" height="1000" alt="Screenshot from 2026-03-08 17-11-17" src="https://github.com/user-attachments/assets/7900a417-a408-4322-9c0c-7757b7b3abcb" />
<img width="1000" height="1000" alt="Screenshot from 2026-03-08 17-11-28" src="https://github.com/user-attachments/assets/4cf0fe28-3edd-4187-90ce-4d8d232783d5" />
<img width="1000" height="1000" alt="Screenshot from 2026-03-08 17-11-50" src="https://github.com/user-attachments/assets/4e4c2f37-6c37-4891-80f3-121077e2ca95" />




