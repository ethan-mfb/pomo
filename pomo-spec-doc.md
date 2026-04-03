# Pomo — Product Specification

**Version:** 0.2.0
**Live App:** [https://ethan-mfb.github.io/pomo/](https://ethan-mfb.github.io/pomo/)

Pomo is a minimalist Pomodoro-style productivity timer PWA. Users run timed work sessions, get an audio alert when done, and track how many sessions they complete.

---

## User Stories

### Timer

- As a user, I can set a work session duration in minutes so I can customize how long I focus.
- As a user, I can start a countdown timer so I know when my work session ends.
- As a user, I can see the remaining time in MM:SS format so I can track my progress.
- As a user, I can see the projected end time (wall clock) so I know when to wrap up.
- As a user, I can see a progress bar filling as time elapses so I have a visual sense of progress.
- As a user, I can pause and resume the timer so I can handle interruptions without losing my session.
- As a user, I can cancel the timer at any time to return to setup.

### Alarm

- As a user, I can enable or disable an audio alarm so I choose whether I get an audible alert.
- As a user, I can adjust the alarm volume so the alert isn't too loud or too quiet.
- As a user, I can test the alarm before starting a session so I know what it sounds like.
- As a user, I hear the alarm automatically when my session ends (if enabled) so I know to take a break.
- As a user, I can dismiss the alarm so I can silence it and move on.

### Session Tracking

- As a user, I can see how many work sessions I have completed so I can track my productivity.
- As a user, my session count increments when I dismiss the alarm after a completed session.

### Theme

- As a user, I can toggle between dark and light mode so the app suits my environment.
- As a user, the app respects my OS theme preference on first load so I don't have to configure it.

### PWA / Offline

- As a user, I can install Pomo to my home screen so I can access it like a native app.
- As a user, the app works offline after first load so I can use it without an internet connection.

---

## Features

| Feature | Description |
| --- | --- |
| Configurable session duration | Number input, default 25 minutes |
| Countdown timer | MM:SS display, 100ms update interval, drift-resistant |
| Wall-clock end time | Shows the time of day when session will end |
| Progress bar | Visual fill indicator across session duration |
| Pause / Resume / Cancel | Full timer flow control |
| Audio alarm | Plays on session completion if enabled |
| Alarm toggle | Enable or disable alarm |
| Volume control | Slider 0–100%, adjustable before starting |
| Test alarm | Preview alarm sound from the setup screen |
| Dismiss alarm | Button to stop audio after session ends |
| Session counter | In-memory count of completed sessions |
| Dark / light theme | Toggle with OS preference detection |
| PWA | Installable, offline-capable, auto-updating service worker |

---

## Out of Scope (v0.2.0)

- Break sessions (short break, long break)
- Full Pomodoro cycle automation (work → short break × 4 → long break)
- Persistent settings across page refreshes
- Session history or logs
- Browser push notifications
