# Side Effects Analysis - Pomo Codebase

## Overview

This document catalogs all side effects found in the Pomo codebase, categorized by type, location, and impact. Side effects are operations that interact with the outside world beyond pure computation (I/O, mutations, time-based operations, etc.).

## Side Effect Categories

```d2
Side Effects: {
  Browser APIs: {
    DOM Manipulation
    Audio Playback
    Service Workers
    Media Queries
    Local Storage (potential)
  }

  Time-Based: {
    setInterval
    setTimeout
    Date.now()
  }

  State Mutations: {
    React State Updates
    Ref Mutations
  }

  Network: {
    Service Worker Registration
    Audio File Loading
  }
}
```

## Detailed Analysis by File

### 1. App.tsx

**Location**: [src/App.tsx](src/App.tsx)

#### State Management Side Effects

All `useState` calls create side effects through React's state management:

| Line  | Effect                                            | Type                 | Scope                      |
| ----- | ------------------------------------------------- | -------------------- | -------------------------- |
| 21    | `useState(true)`                                  | State initialization | alarmEnabled               |
| 22    | `useState(50)`                                    | State initialization | alarmVolume                |
| 23-25 | `useState(DEFAULT_WORK_SESSION_DURATION_MINUTES)` | State initialization | workSessionDurationMinutes |
| 26    | `useState(0)`                                     | State initialization | totalDuration              |
| 27    | `useState<Date \| null>(null)`                    | State initialization | endTime                    |
| 44    | `useState(true)`                                  | State initialization | hasBeenDismissed           |
| 45    | `useState(0)`                                     | State initialization | completedWorkSessions      |
| 46    | `useState(false)`                                 | State initialization | isTestingAlarm             |

#### Hook-Based Side Effects

**useAppTheme Hook** (line 20)

- Triggers DOM mutation (setting body attribute)
- Registers event listener for system theme changes
- Reads from `window.matchMedia` API

**useAlarm Hook** (line 28-31)

- Audio playback side effect
- Audio object creation/mutation
- Volume control

**useTimer Hook** (line 32-43)

- Interval-based timing side effect
- Continuous Date.now() calls
- Callback invocation (onFinish)

#### Event Handler Side Effects

**onStartWorkSession** (line 48-55)

```typescript
- Date.now() call → reads system time
- new Date() → creates time-based object
- dismissAlarm() → triggers audio side effect
- startTimer() → starts interval-based side effect
- Multiple state updates → React re-renders
```

**onDismissAlarm** (line 56-60)

```typescript
- dismissAlarm() → audio manipulation
- State updates → React re-renders
```

**onResumeTimer** (line 72-79)

```typescript
- Date.now() call → reads system time
- new Date() → time-based computation
- resumeTimer() → restarts interval
```

**onToggleAlarmTest** (line 81-89)

```typescript
- Conditional audio playback
- Audio dismissal
```

### 2. useTimer.ts

**Location**: [src/hooks/useTimer.ts](src/hooks/useTimer.ts)

#### Time-Based Side Effects

**Main useEffect** (line 25-64)

```typescript
Effect Type: Interval-based polling
Trigger: Changes to isPaused, endTime, timeRemaining
Frequency: Every 100ms
Side Effects:
  - window.setInterval() → creates repeated timer
  - Date.now() → system time reading (every 100ms)
  - window.clearInterval() → cleanup on unmount/deps change
  - onFinish() callback → triggers external effects
  - Multiple setState calls → React re-renders
```

**Diagram**:

```d2
direction: right

Timer Active: {
  shape: rectangle
  style.fill: "#e8f5e9"
}

Every 100ms: {
  shape: diamond
  "Read System Time: Date.now()"
  "Calculate Remaining: endTime - now"
  "Update State: setTimeRemaining()"
  "If remainingSeconds > 0: continue"
}

Timer Finished: {
  shape: rectangle
  style.fill: "#ffebee"
  "onFinish() callback"
  "Clear interval"
  "Set timerFinished = true"
}

Timer Active -> Every 100ms: "setInterval"
Every 100ms -> Timer Finished: "remainingSeconds <= 0"
```

**Cleanup Function** (line 59-63)

```typescript
Effect: Clears interval on unmount or dependency change
Side Effect: window.clearInterval()
```

#### State Mutations

| Function      | Line  | Side Effects                 |
| ------------- | ----- | ---------------------------- |
| `startTimer`  | 66-72 | Date.now(), 5 setState calls |
| `pauseTimer`  | 74-80 | 3 setState calls             |
| `resumeTimer` | 82-90 | Date.now(), 3 setState calls |
| `cancelTimer` | 92-98 | 5 setState calls             |

### 3. useAlarm.ts

**Location**: [src/hooks/useAlarm.ts](src/hooks/useAlarm.ts)

#### Audio API Side Effects

**playAlarm** (line 12-30)

```typescript
Side Effects:
  1. State update: setIsAlarmActive(true)
  2. Audio object creation: new Audio('alarm.mp3')
  3. DOM Audio Element: HTMLAudioElement instantiation
  4. Network request: Loading alarm.mp3 file
  5. Audio property mutation: audio.current.volume = ...
  6. Audio property mutation: audio.current.loop = false
  7. Browser audio playback: audio.current.play()
  8. Error handling side effect: console.error

Dependencies: soundEnabled, volume
```

**dismissAlarm** (line 32-38)

```typescript
Side Effects:
  1. Audio playback stop: audio.current.pause()
  2. State update: setIsAlarmActive(false)
  3. Audio position reset: audio.current.currentTime = 0

Wrapped in: useCallback (memoization side effect)
```

**Cleanup useEffect** (line 40-45)

```typescript
Effect: Ensures alarm is dismissed on component unmount
Trigger: Component unmount
Side Effect: Calls dismissAlarm() cleanup
```

#### Reference Mutations

**audio.current** (line 8, 20-24, 26-29, 33-36)

```typescript
Type: useRef<HTMLAudioElement | null>
Mutations:
  - Assignment: audio.current = new Audio(...)
  - Property mutations: .volume, .loop, .currentTime

Note: Ref mutations don't trigger re-renders but are still side effects
```

### 4. useAppTheme.ts

**Location**: [src/hooks/useAppTheme.ts](src/hooks/useAppTheme.ts)

#### Browser API Side Effects

**Theme Initialization** (line 6-11)

```typescript
Side Effects:
  - window.matchMedia() → reads browser/OS settings
  - Media query evaluation → system preference check

Timing: During state initialization (runs once on mount)
```

**DOM Mutation useEffect** (line 13-15)

```typescript
Effect Type: DOM attribute manipulation
Trigger: theme state changes
Side Effect: document.body.setAttribute('data-theme', theme)
Impact: Changes DOM structure, triggers CSS re-evaluation
```

**Media Query Listener useEffect** (line 17-25)

```typescript
Side Effects:
  1. window.matchMedia() → Browser API call
  2. mediaQuery.addEventListener() → Event listener registration
  3. System event subscription → OS-level theme change detection
  4. Cleanup: mediaQuery.removeEventListener() → Unregister listener

Event Handler:
  - Reads OS theme preference: e.matches
  - Updates React state: setTheme()
```

**Diagram**:

```d2
direction: down

Component Mount: {
  shape: oval
  style.fill: "#e3f2fd"
}

Read OS Theme: {
  shape: rectangle
  "window.matchMedia()"
}

Set Initial Theme: {
  shape: rectangle
  "useState(getOsCurrentTheme)"
}

Setup Listener: {
  shape: rectangle
  "addEventListener('change')"
}

Update DOM: {
  shape: rectangle
  "document.body.setAttribute()"
  "On theme changes: update DOM"
}

OS Theme Changes: {
  shape: diamond
  style.fill: "#fff3e0"
}

Handle Change: {
  shape: rectangle
  "setTheme(newTheme)"
}

Unmount: {
  shape: oval
  style.fill: "#ffebee"
}

Cleanup: {
  shape: rectangle
  "removeEventListener()"
}

Component Mount -> Read OS Theme
Read OS Theme -> Set Initial Theme
Set Initial Theme -> Setup Listener
Set Initial Theme -> Update DOM
OS Theme Changes -> Handle Change
Handle Change -> Update DOM
Unmount -> Cleanup
```

### 5. main.tsx

**Location**: [src/main.tsx](src/main.tsx)

#### Application Bootstrap Side Effects

**Service Worker Registration** (line 6-13)

```typescript
Side Effects:
  1. Browser API check: 'serviceWorker' in navigator
  2. Event listener registration: window.addEventListener('load', ...)
  3. Service Worker API call: navigator.serviceWorker.getRegistrations()
  4. Promise resolution → async side effect

Impact:
  - Registers background worker
  - Enables offline functionality
  - Caching layer for PWA
```

**React DOM Manipulation** (line 15-19)

```typescript
Side Effects:
  1. DOM query: document.getElementById('root')
  2. React root creation: ReactDOM.createRoot()
  3. DOM tree rendering: render(<App />)
  4. React.StrictMode effects:
     - Double-invokes effects in development
     - Additional checks and warnings

Impact:
  - Mounts entire React application
  - Initializes all component effects
  - Triggers cascade of child side effects
```

### 6. components/NumberInput.tsx

**Location**: [src/components/NumberInput.tsx](src/components/NumberInput.tsx)

#### Event Handler Side Effects

**handleKeyDown** (line 16-20)

```typescript
Effect Type: Conditional callback invocation
Trigger: Keyboard event (Enter key)
Side Effect: args.onEnter() → delegates to parent handler
Scope: Triggered by user interaction
```

**onChange Handler** (line 30)

```typescript
Effect: args.onChange(Number(e.target.value))
Impact:
  - Type coercion side effect
  - Parent state update via callback
```

## Side Effect Summary by Type

### Time-Based Operations

```d2
Time Operations: {
  shape: rectangle

  setInterval: {
    Location: useTimer.ts:53
    Frequency: "Every 100ms"
    Purpose: "Timer countdown"
    Cleanup: "window.clearInterval"
  }

  Date.now(): {
    Locations: "useTimer.ts (multiple)\nApp.tsx:52, 75"
    Purpose: "System time reading"
    Impact: "Non-deterministic output"
  }

  new Date(): {
    Locations: "App.tsx:52, 75"
    Purpose: "End time calculation"
    Impact: "Time-dependent objects"
  }
}
```

### Browser API Interactions

| API                          | Location            | Purpose             | Cleanup Required          |
| ---------------------------- | ------------------- | ------------------- | ------------------------- |
| `HTMLAudioElement`           | useAlarm.ts:22      | Audio playback      | Yes (pause/reset)         |
| `window.matchMedia`          | useAppTheme.ts:7,18 | OS theme detection  | Yes (removeEventListener) |
| `document.body.setAttribute` | useAppTheme.ts:14   | Theme styling       | No (replaced on change)   |
| `navigator.serviceWorker`    | main.tsx:9          | PWA offline support | No                        |
| `ReactDOM.createRoot`        | main.tsx:15         | React mounting      | No (unmount on close)     |
| `window.addEventListener`    | main.tsx:8          | Load event          | No (one-time)             |
| `window.setInterval`         | useTimer.ts:53      | Timer updates       | Yes (clearInterval)       |

### State Mutation Effects

**React State Updates**

- Total useState hooks: 13 across App.tsx, useTimer.ts, useAlarm.ts, useAppTheme.ts
- All trigger re-renders
- Batched by React for performance

**Ref Mutations**

- `audio.current` in useAlarm.ts
- Does not trigger re-renders
- Persists across renders

### Network/I/O Effects

```d2
Network Effects: {
  Audio File Loading: {
    File: "alarm.mp3"
    Location: "useAlarm.ts:22"
    Type: "Network request"
    Error Handling: "console.error"
  }

  Service Worker: {
    Location: "main.tsx:6-13"
    Type: "Background registration"
    Purpose: "PWA caching"
  }
}
```

## Side Effect Dependencies

```d2
direction: down

App Component: {
  style.fill: "#e3f2fd"
}

useAppTheme: {
  style.fill: "#f3e5f5"
  "DOM mutation"
  "Media query listener"
}

useTimer: {
  style.fill: "#fff3e0"
  "setInterval (100ms)"
  "Date.now() calls"
  "onFinish callback"
}

useAlarm: {
  style.fill: "#ffebee"
  "Audio playback"
  "Network (mp3 load)"
}

App Component -> useAppTheme: "theme effects"
App Component -> useTimer: "timing effects"
App Component -> useAlarm: "audio effects"
useTimer -> useAlarm: "onFinish triggers playAlarm"
```

## Side Effect Lifecycle

```d2
direction: right

Mount: {
  shape: oval
  style.fill: "#e8f5e9"
}

Initialize State: {
  "13 useState hooks"
  "3 useRef hooks"
}

Register Effects: {
  "DOM attribute updates"
  "Event listeners"
  "Service worker"
}

Running: {
  shape: rectangle
  style.fill: "#e3f2fd"

  "setInterval (100ms)"
  "User interactions"
  "State updates"
  "Audio playback"
  "normal operation: loop until cleanup"
}

Cleanup: {
  shape: rectangle
  style.fill: "#fff3e0"

  "clearInterval"
  "removeEventListener"
  "pause audio"
}

Unmount: {
  shape: oval
  style.fill: "#ffebee"
}

Mount -> Initialize State
Initialize State -> Register Effects
Register Effects -> Running
Running -> Cleanup: "effect cleanup"
Cleanup -> Unmount
```

## Problematic Side Effects

### 1. Uncontrolled Time Polling

**Issue**: useTimer polls every 100ms regardless of necessity

```typescript
// useTimer.ts:53
interval = window.setInterval(updateTimeRemaining, 100);
```

**Impact**:

- Constant battery drain
- Unnecessary re-renders
- CPU usage even when tab inactive

**Better Approach**: Use requestAnimationFrame or reduce frequency

### 2. Audio Object Mutation

**Issue**: Direct mutation of audio.current ref

```typescript
// useAlarm.ts:26-27
audio.current.volume = volume / 100;
audio.current.play().catch(console.error);
```

**Impact**:

- Hard to test
- Potential race conditions
- Error swallowing via console.error

**Better Approach**: Wrap in service interface with proper error handling

### 3. Scattered State Updates

**Issue**: Multiple setState calls in single handler

```typescript
// App.tsx:48-55
const onStartWorkSession = () => {
  setHasBeenDismissed(false);
  setTotalDuration(totalSeconds);
  setEndTime(new Date(...));
  dismissAlarm();
  startTimer(totalSeconds);
};
```

**Impact**:

- Multiple re-renders (mitigated by React batching)
- Hard to track state consistency
- Difficult to test atomically

**Better Approach**: Use reducer for atomic state transitions

### 4. Date.now() Non-Determinism

**Issue**: Direct Date.now() calls throughout codebase

```typescript
// useTimer.ts:32, App.tsx:52, 75
const now = Date.now();
```

**Impact**:

- Non-deterministic tests
- Hard to mock
- Time-dependent bugs

**Better Approach**: Inject time service with mockable interface

### 5. DOM Attribute Mutation

**Issue**: Direct DOM manipulation outside React

```typescript
// useAppTheme.ts:14
document.body.setAttribute('data-theme', theme);
```

**Impact**:

- Circumvents React's declarative model
- Potential hydration mismatches
- Hard to track in React DevTools

**Better Approach**: Use CSS-in-JS or className at root level

## Testing Challenges

```d2
direction: down

Side Effects: {
  shape: rectangle
  style.fill: "#ffebee"
}

Testing Problems: {
  Time Mocking: {
    "Date.now() calls"
    "setInterval management"
    "Async timing issues"
  }

  Browser APIs: {
    "window.matchMedia"
    "HTMLAudioElement"
    "navigator.serviceWorker"
  }

  External Dependencies: {
    "alarm.mp3 loading"
    "Network requests"
    "File system access"
  }

  State Complexity: {
    "13 useState hooks"
    "Inter-hook dependencies"
    "Effect timing"
  }
}

Required Mocks: {
  jsdom: "DOM APIs"
  jest.useFakeTimers: "Time operations"
  jest.mock: "Audio/Service Worker"
  Custom fixtures: "Audio files"
}

Side Effects -> Testing Problems
Testing Problems -> Required Mocks: "requires"
```

## Recommendations

### 1. Isolate Side Effects

Move all side effects to dedicated service layer:

```typescript
interface ITimeService {
  now(): number;
  setInterval(fn: () => void, ms: number): number;
  clearInterval(id: number): void;
}

interface IAudioService {
  play(file: string, volume: number): Promise<void>;
  stop(): void;
}
```

### 2. Use Effect Isolation Pattern

```typescript
// Separate pure logic from effects
const calculateTimeRemaining = (endTime: number, now: number): number => {
  return Math.ceil((endTime - now) / 1000);
};

// Effects only handle I/O
useEffect(() => {
  const interval = setInterval(() => {
    const remaining = calculateTimeRemaining(endTime, Date.now());
    setTimeRemaining(remaining);
  }, 100);

  return () => clearInterval(interval);
}, [endTime]);
```

### 3. Centralize State Management

Replace scattered useState with single reducer:

```typescript
const [state, dispatch] = useReducer(appReducer, initialState);
// All state transitions become pure functions
```

### 4. Inject Dependencies

```typescript
function App({ timeService = defaultTimeService, audioService = defaultAudioService }) {
  // Now testable with mock services
}
```

## Side Effect Metrics

| Category           | Count   | Cleanup Required | Testability    |
| ------------------ | ------- | ---------------- | -------------- |
| State Mutations    | 13      | No               | Medium         |
| Timer Operations   | 1       | Yes              | Low            |
| Audio Effects      | 3       | Yes              | Low            |
| DOM Mutations      | 1       | No               | Medium         |
| Event Listeners    | 2       | Yes              | Medium         |
| Network Requests   | 2       | No               | Low            |
| Time Reads         | 6+      | No               | Low            |
| Total Side Effects | **28+** | **5 types**      | **Low-Medium** |

## Conclusion

The codebase has **28+ distinct side effects** spread across **6 files**. The most impactful are:

1. **Time-based polling** (100ms intervals) - continuous CPU usage
2. **Audio playback** - browser API, network, mutations
3. **DOM manipulation** - outside React's control
4. **System time reads** - non-deterministic behavior

**Key Issues**:

- Side effects mixed with business logic
- Hard to test due to browser API dependencies
- Non-deterministic behavior from time operations
- State management scattered across 13 useState hooks

**Recommended Refactoring** (see [a.md](a.md)):

- Extract side effects to service interfaces
- Use dependency injection for testability
- Centralize state with reducer pattern
- Isolate pure logic from effects
