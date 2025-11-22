# Pomo Codebase Architecture Analysis

## Overview

This document provides a comprehensive architectural analysis of the Pomo application, a Pomodoro timer PWA built with React and TypeScript. The architecture is visualized through D2 diagrams, progressing from high-level overview to detailed component interactions.

---

## 1. High-Level System Architecture

```d2
direction: down

User: {
  shape: person
  style.fill: "#e3f2fd"
}

Browser: {
  shape: rectangle
  style.fill: "#fff3e0"

  PWA Layer: {
    Service Worker
    Offline Cache
  }

  React App: {
    main.tsx: "Entry Point"
    App.tsx: "Root Component"
  }
}

External Resources: {
  shape: rectangle
  style.fill: "#f3e5f5"

  alarm.mp3
  CSS/SCSS Files
  Static Assets
}

OS APIs: {
  shape: cylinder
  style.fill: "#e8f5e9"

  Media Queries
  System Theme
  Audio API
}

User -> Browser: "Interacts"
Browser.PWA Layer -> Browser.React App: "Hosts"
Browser.React App -> External Resources: "Loads"
Browser.React App -> OS APIs: "Queries"
```

### Architecture Description

The Pomo application follows a **client-side PWA architecture** with these key characteristics:

- **Single-Page Application (SPA)**: All UI rendered by React in the browser
- **Progressive Web App**: Service Worker enables offline functionality
- **State-Driven UI**: React hooks manage all application state
- **Component-Based**: Modular UI components with clear responsibilities
- **Browser API Integration**: Direct integration with Web Audio, Media Queries, and DOM APIs

**Key Design Patterns**:
- Custom React Hooks for cross-cutting concerns (timer, alarm, theme)
- Component composition for UI reusability
- Props-based component communication
- Effect-based side effect management

---

## 2. Application Module Structure

```d2
direction: right

src: {
  shape: rectangle
  style.fill: "#e3f2fd"

  Entry: {
    main.tsx: "Bootstrap & PWA Setup"
    App.tsx: "Root Component (179 lines)"
    style.fill: "#fff3e0"
  }

  Core Logic: {
    hooks/: {
      useTimer.ts: "Timer Management"
      useAlarm.ts: "Audio Control"
      useAppTheme.ts: "Theme System"
    }
    style.fill: "#f3e5f5"
  }

  Components: {
    components/: {
      Button.tsx: "Button UI"
      NumberInput.tsx: "Number Input + Enter"
      Slider.tsx: "Range Slider"
      Toggle.tsx: "Checkbox Toggle"
      ThemeToggle.tsx: "Theme Switcher"
      ProgressBar.tsx: "Visual Progress"
    }
    style.fill: "#e8f5e9"
  }

  Shared: {
    types.ts: "Type Definitions"
    constants.ts: "App Constants"
    utils.ts: "Pure Functions"
    version.ts: "Version String"
    app.ts: "Unused (TODO)"
    style.fill: "#fff9c4"
  }
}

src.Entry -> src.Core Logic: "uses"
src.Entry -> src.Components: "renders"
src.Entry -> src.Shared: "imports"
src.Core Logic -> src.Shared: "imports"
src.Components -> src.Shared: "imports"
```

### Module Organization

The codebase is organized into **4 logical layers**:

#### **Entry Layer** (Bootstrapping)
- **main.tsx**: React DOM mounting, Service Worker registration
- **App.tsx**: Application root, state orchestration, layout composition

#### **Core Logic Layer** (Business Logic)
- **hooks/useTimer.ts**: Countdown timer with pause/resume functionality
- **hooks/useAlarm.ts**: Audio playback and dismissal logic
- **hooks/useAppTheme.ts**: System theme detection and manual toggle

#### **Components Layer** (UI Primitives)
- Reusable, stateless UI components
- Event delegation via callback props
- Styling via dedicated SCSS files

#### **Shared Layer** (Common Utilities)
- Type definitions (Theme, SessionState)
- Constants (durations, time conversions, theme names)
- Pure utility functions (formatTime)

---

## 3. Component Dependency Graph

```d2
direction: down

main.tsx: {
  shape: rectangle
  style.fill: "#e3f2fd"
}

App.tsx: {
  shape: rectangle
  style.fill: "#fff3e0"
  "Root Component\n13 useState hooks\n10 event handlers"
}

Hooks: {
  useTimer: {
    shape: hexagon
    style.fill: "#f3e5f5"
    "setInterval\nDate.now()\nonFinish callback"
  }
  useAlarm: {
    shape: hexagon
    style.fill: "#f3e5f5"
    "HTMLAudioElement\nplay/pause/dismiss"
  }
  useAppTheme: {
    shape: hexagon
    style.fill: "#f3e5f5"
    "matchMedia\nDOM mutation\nevent listeners"
  }
}

UI Components: {
  ThemeToggle: {
    shape: rectangle
    style.fill: "#e8f5e9"
  }
  Button: {
    shape: rectangle
    style.fill: "#e8f5e9"
  }
  NumberInput: {
    shape: rectangle
    style.fill: "#e8f5e9"
  }
  Slider: {
    shape: rectangle
    style.fill: "#e8f5e9"
  }
  Toggle: {
    shape: rectangle
    style.fill: "#e8f5e9"
  }
  ProgressBar: {
    shape: rectangle
    style.fill: "#e8f5e9"
  }
}

Utilities: {
  constants.ts
  utils.ts
  types.ts
}

main.tsx -> App.tsx: "renders"
App.tsx -> Hooks.useTimer: "calls"
App.tsx -> Hooks.useAlarm: "calls"
App.tsx -> Hooks.useAppTheme: "calls"
App.tsx -> UI Components.ThemeToggle: "renders"
App.tsx -> UI Components.Button: "renders (5x)"
App.tsx -> UI Components.NumberInput: "renders"
App.tsx -> UI Components.Slider: "renders"
App.tsx -> UI Components.Toggle: "renders"
App.tsx -> UI Components.ProgressBar: "renders"
UI Components.ThemeToggle -> UI Components.Button: "composes"
Hooks -> Utilities: "imports"
App.tsx -> Utilities: "imports"
```

### Dependency Characteristics

**Hub-and-Spoke Pattern**: App.tsx acts as central orchestrator
- All hooks called directly from App.tsx
- All components rendered from App.tsx
- No component-to-component dependencies (except ThemeToggle → Button)

**Hook Independence**: Custom hooks are loosely coupled
- useTimer, useAlarm, useAppTheme can be used independently
- Communication happens through App.tsx callbacks

**Utility Layer**: Pure, dependency-free functions
- No imports from other application modules
- Only constants and type definitions

---

## 4. App.tsx Internal Architecture

```d2
direction: down

App Component: {
  shape: rectangle
  style.fill: "#fff3e0"

  State Management: {
    shape: rectangle
    style.fill: "#ffebee"

    Local State: {
      "alarmEnabled: boolean"
      "alarmVolume: number"
      "workSessionDurationMinutes: number"
      "totalDuration: number"
      "endTime: Date | null"
      "hasBeenDismissed: boolean"
      "completedWorkSessions: number"
      "isTestingAlarm: boolean"
    }

    Hook State: {
      "useTimer → timeRemaining, isRunning, etc."
      "useAlarm → isAlarmActive, playAlarm, dismissAlarm"
      "useAppTheme → theme, toggleTheme"
    }
  }

  Event Handlers: {
    shape: rectangle
    style.fill: "#e1f5fe"

    "onStartWorkSession()"
    "onDismissAlarm()"
    "onCancelTimer()"
    "onResumeTimer()"
    "onToggleAlarmTest()"
    "onFinishWorkSessionEarly()"
    "onResetWorkSessionCount()"
    "onAlarmVolumeChange()"
  }

  View Logic: {
    shape: rectangle
    style.fill: "#f3e5f5"

    Conditional Rendering: {
      "!isRunning && hasBeenDismissed → Idle View"
      "timeRemaining !== null → Timer View"
      "timerFinished && isAlarmActive → Alarm View"
    }
  }
}

State Management -> Event Handlers: "update via"
Event Handlers -> View Logic: "trigger re-render"
View Logic -> State Management: "render based on"
```

### App.tsx Architecture Description

App.tsx is a **monolithic orchestrator component** with three main responsibilities:

#### **1. State Management (Lines 20-46)**
Manages 13 pieces of state:
- **8 local useState hooks**: UI settings and session tracking
- **3 custom hooks**: Timer, alarm, and theme functionality
- **Distributed state**: No centralized state management (no reducer/context)

**State Categories**:
- **Session State**: workSessionDurationMinutes, totalDuration, endTime, completedWorkSessions
- **UI State**: hasBeenDismissed, isTestingAlarm
- **Settings State**: alarmEnabled, alarmVolume
- **Derived State**: theme, timeRemaining, isRunning, isAlarmActive

#### **2. Event Handlers (Lines 48-100)**
10 event handler functions managing:
- **Session lifecycle**: start, pause, resume, cancel, finish early
- **Alarm control**: dismiss, test, volume adjustment
- **Session tracking**: reset count

**Handler Characteristics**:
- Mix side effects with state updates
- Coordinate between multiple hooks
- Perform calculations (Date creation, time math)

#### **3. Conditional Rendering (Lines 102-178)**
Three distinct UI states:
- **Alarm View** (lines 114-119): When timer finishes
- **Idle View** (lines 121-156): Ready to start new session
- **Timer View** (lines 158-175): Active countdown display

---

## 5. State Flow Architecture

```d2
direction: right

User Action: {
  shape: oval
  style.fill: "#e3f2fd"
  "Click 'Go!' button"
}

Event Handler: {
  shape: rectangle
  style.fill: "#fff3e0"

  onStartWorkSession: {
    "1. Calculate totalSeconds"
    "2. setTotalDuration()"
    "3. setEndTime(new Date())"
    "4. dismissAlarm()"
    "5. startTimer()"
    "6. setHasBeenDismissed(false)"
  }
}

State Updates: {
  shape: rectangle
  style.fill: "#f3e5f5"

  App State: {
    totalDuration: "updated"
    endTime: "updated"
    hasBeenDismissed: "updated"
  }

  Timer Hook: {
    timeRemaining: "started"
    isRunning: "true"
    endTime: "calculated"
  }

  Alarm Hook: {
    isAlarmActive: "false"
  }
}

React Re-render: {
  shape: rectangle
  style.fill: "#e8f5e9"

  "Conditional rendering triggers"
  "Timer View now visible"
  "ProgressBar receives props"
}

Side Effects: {
  shape: rectangle
  style.fill: "#ffebee"

  "setInterval starts (100ms)"
  "Date.now() polling begins"
  "Audio dismissed (if playing)"
}

User Action -> Event Handler
Event Handler -> State Updates: "triggers"
State Updates -> React Re-render: "causes"
State Updates -> Side Effects: "initiates"
Side Effects -> State Updates: "updates over time"
```

### State Flow Description

**Flow Pattern**: Event-Driven State Machine with Side Effects

1. **User Interaction**: Button clicks, input changes, keyboard events
2. **Event Handler Execution**:
   - Performs calculations (time math, conversions)
   - Updates multiple state variables
   - Triggers hook methods (startTimer, dismissAlarm)
3. **State Propagation**:
   - React batches state updates
   - Hooks update internal state
   - Side effects registered via useEffect
4. **Re-render Cycle**:
   - Component re-renders with new state
   - Conditional logic determines which view to show
   - Components receive updated props
5. **Effect Execution**:
   - setInterval starts/stops
   - DOM mutations occur
   - Event listeners added/removed

**Key Observation**: State updates and side effects are **interleaved**, not separated. This makes the flow harder to reason about and test.

---

## 6. Timer System Architecture

```d2
direction: down

useTimer Hook: {
  shape: rectangle
  style.fill: "#fff3e0"

  Internal State: {
    "timeRemaining: number | null"
    "timerFinished: boolean"
    "isPaused: boolean"
    "endTime: number | null"
    "pausedTimeRemaining: number | null"
  }

  Public API: {
    shape: rectangle
    style.fill: "#e8f5e9"
    "startTimer(durationInSeconds)"
    "pauseTimer()"
    "resumeTimer()"
    "cancelTimer()"
  }

  Effect Loop: {
    shape: hexagon
    style.fill: "#ffebee"

    Every 100ms: {
      "1. Read Date.now()"
      "2. Calculate remaining = endTime - now"
      "3. Update timeRemaining state"
      "4. Check if finished"
      "5. Call onFinish() if done"
    }
  }
}

App Component: {
  shape: rectangle
  style.fill: "#e3f2fd"

  "const { timeRemaining, isRunning, ... } = useTimer({ onFinish })"
}

Browser Timer API: {
  shape: cylinder
  style.fill: "#f3e5f5"
  "window.setInterval()"
  "Date.now()"
}

App Component -> useTimer Hook.Public API: "calls methods"
useTimer Hook.Effect Loop -> Browser Timer API: "uses"
Browser Timer API -> useTimer Hook.Internal State: "updates"
useTimer Hook -> App Component: "returns state"
```

### Timer System Description

**Pattern**: Polling-Based Countdown Timer

#### **State Machine States**:
1. **Idle**: timeRemaining = null, not running
2. **Running**: timeRemaining > 0, isPaused = false, interval active
3. **Paused**: timeRemaining > 0, isPaused = true, interval stopped
4. **Finished**: timeRemaining = 0, timerFinished = true

#### **Core Mechanism** (useTimer.ts:25-64):
```
useEffect(() => {
  if (!isPaused && endTime !== null) {
    setInterval(() => {
      const remainingSeconds = Math.ceil((endTime - Date.now()) / 1000)
      if (remainingSeconds <= 0) {
        onFinish()
        stop()
      } else {
        setTimeRemaining(remainingSeconds)
      }
    }, 100)
  }
}, [isPaused, endTime, timeRemaining])
```

**Key Characteristics**:
- **Polling Frequency**: 100ms (10 times per second)
- **Time Source**: `Date.now()` (system time, not elapsed time)
- **Accuracy**: ±100ms due to polling interval
- **Pause Mechanism**: Saves remaining time, clears interval, recalculates endTime on resume

**Design Trade-offs**:
- ✅ Simple to understand
- ✅ Survives tab sleep/wake
- ❌ Continuous CPU usage
- ❌ Battery drain
- ❌ No animation frame sync

---

## 7. Alarm System Architecture

```d2
direction: down

useAlarm Hook: {
  shape: rectangle
  style.fill: "#fff3e0"

  State: {
    "audio: useRef<HTMLAudioElement | null>"
    "isAlarmActive: boolean"
  }

  Public API: {
    shape: rectangle
    style.fill: "#e8f5e9"

    playAlarm: {
      "1. Check soundEnabled"
      "2. Create Audio if null"
      "3. Set volume (0-100 → 0.0-1.0)"
      "4. Call audio.play()"
      "5. Set isAlarmActive = true"
    }

    dismissAlarm: {
      "1. Pause audio"
      "2. Reset currentTime = 0"
      "3. Set isAlarmActive = false"
    }
  }

  Cleanup: {
    "useEffect(() => dismissAlarm, [])"
  }
}

Audio Resource: {
  shape: cylinder
  style.fill: "#f3e5f5"

  alarm.mp3: {
    "Loaded via network"
    "Cached by browser"
    "Played via Web Audio API"
  }
}

App Component: {
  shape: rectangle
  style.fill: "#e3f2fd"

  Usage: {
    "playAlarm() → onFinish callback"
    "dismissAlarm() → Button click"
    "isAlarmActive → Conditional render"
  }
}

App Component -> useAlarm Hook.Public API: "calls"
useAlarm Hook -> Audio Resource: "loads & plays"
Audio Resource -> Browser Audio API: "Web Audio"
useAlarm Hook.Cleanup -> useAlarm Hook.State: "cleanup on unmount"
```

### Alarm System Description

**Pattern**: Imperative Audio Control with Ref-Based Storage

#### **Audio Lifecycle**:
1. **Lazy Initialization**: Audio object created on first `playAlarm()` call
2. **Persistence**: Stored in `useRef` to survive re-renders
3. **Playback**: Controlled via HTMLAudioElement API
4. **Cleanup**: Dismissed on component unmount

#### **Volume Control** (useAlarm.ts:27):
```typescript
audio.current.volume = volume / 100  // 0-100 range → 0.0-1.0
```

#### **Error Handling** (useAlarm.ts:29):
```typescript
audio.current.play().catch(console.error)  // Swallows errors silently
```

**Key Characteristics**:
- **Lazy Loading**: Network request only on first play
- **Non-Looping**: `audio.current.loop = false`
- **Volume Range**: App uses 0-100, Web Audio uses 0.0-1.0
- **Silent Failures**: Playback errors logged but not surfaced to user

**Integration with Timer**:
```typescript
useTimer({ onFinish: playAlarm })  // Callback invoked at timer completion
```

---

## 8. Theme System Architecture

```d2
direction: down

OS/Browser: {
  shape: cylinder
  style.fill: "#f3e5f5"

  System Preferences: {
    "Light/Dark mode setting"
    "Exposed via Media Queries"
  }
}

useAppTheme Hook: {
  shape: rectangle
  style.fill: "#fff3e0"

  Initialization: {
    "useState(() => getOsCurrentTheme())"
    "window.matchMedia('prefers-color-scheme: light')"
  }

  State: {
    "theme: 'dark' | 'light'"
  }

  Effects: {
    DOM Mutation: {
      "useEffect(() => {"
      "  document.body.setAttribute('data-theme', theme)"
      "}, [theme])"
    }

    System Listener: {
      "useEffect(() => {"
      "  mediaQuery.addEventListener('change', handleChange)"
      "  return () => removeEventListener()"
      "}, [])"
    }
  }

  Public API: {
    "theme: Theme"
    "toggleTheme: () => void"
  }
}

App Component: {
  shape: rectangle
  style.fill: "#e3f2fd"

  "const { theme, toggleTheme } = useAppTheme()"
  "<ThemeToggle theme={theme} onToggle={toggleTheme} />"
}

CSS System: {
  shape: rectangle
  style.fill: "#e8f5e9"

  "body[data-theme='dark'] { ... }"
  "body[data-theme='light'] { ... }"
}

OS/Browser -> useAppTheme Hook.Initialization: "reads on mount"
OS/Browser -> useAppTheme Hook.Effects.System Listener: "emits change events"
useAppTheme Hook.Effects.DOM Mutation -> CSS System: "triggers style changes"
App Component -> useAppTheme Hook.Public API: "uses"
useAppTheme Hook -> App Component: "provides"
```

### Theme System Description

**Pattern**: Reactive Theme Synchronization with OS Integration

#### **Three-Way Binding**:
1. **OS Preference** ↔ **React State** ↔ **DOM Attribute**
2. User can override OS preference via toggle button
3. OS changes automatically update theme (if not manually toggled)

#### **Theme Propagation Flow**:
```
OS Change → Media Query Event → setTheme() → DOM Attribute → CSS Variables
```

#### **DOM Mutation** (useAppTheme.ts:13-15):
```typescript
useEffect(() => {
  document.body.setAttribute('data-theme', theme)
}, [theme])
```

This is a **direct DOM manipulation** outside React's render cycle. While functional, it bypasses React's declarative model.

**Key Characteristics**:
- **Initial Sync**: Reads OS theme on component mount
- **Reactive Sync**: Listens for OS theme changes
- **Manual Override**: Toggle button overrides OS preference
- **CSS-Driven**: Theme styles applied via attribute selector

**Design Note**: This could be React-ified by managing theme at the root `<div className={theme}>` level instead of mutating `document.body`.

---

## 9. Component Communication Architecture

```d2
direction: down

App (Parent): {
  shape: rectangle
  style.fill: "#e3f2fd"

  State: {
    "workSessionDurationMinutes"
    "alarmVolume"
    "alarmEnabled"
    "isTestingAlarm"
    "completedWorkSessions"
  }

  Handlers: {
    "onStartWorkSession"
    "onAlarmVolumeChange"
    "onToggleAlarmTest"
    "onResetWorkSessionCount"
  }
}

UI Components: {
  NumberInput: {
    shape: rectangle
    style.fill: "#e8f5e9"

    Props: {
      "value: number"
      "onChange: (n) => void"
      "onEnter?: () => void"
    }
  }

  Slider: {
    shape: rectangle
    style.fill: "#e8f5e9"

    Props: {
      "value: number"
      "onChange: (n) => void"
      "min, max, step"
    }
  }

  Toggle: {
    shape: rectangle
    style.fill: "#e8f5e9"

    Props: {
      "checked: boolean"
      "onChange: (b) => void"
    }
  }

  Button: {
    shape: rectangle
    style.fill: "#e8f5e9"

    Props: {
      "onClick: () => void"
      "children: ReactNode"
    }
  }

  ProgressBar: {
    shape: rectangle
    style.fill: "#e8f5e9"

    Props: {
      "timeRemaining: number"
      "totalDuration: number"
    }
  }
}

App (Parent).State -> UI Components.NumberInput.Props: "value ↓"
UI Components.NumberInput -> App (Parent).Handlers: "onChange ↑"
App (Parent).State -> UI Components.Slider.Props: "value ↓"
UI Components.Slider -> App (Parent).Handlers: "onChange ↑"
App (Parent).State -> UI Components.Toggle.Props: "checked ↓"
UI Components.Toggle -> App (Parent).Handlers: "onChange ↑"
App (Parent).Handlers -> UI Components.Button.Props: "onClick ↓"
App (Parent).State -> UI Components.ProgressBar.Props: "data ↓"
```

### Component Communication Description

**Pattern**: Unidirectional Data Flow (React Standard)

#### **Communication Principles**:
1. **Props Down**: Parent passes data to children via props
2. **Events Up**: Children notify parent via callback props
3. **Controlled Components**: All input components are controlled (value + onChange)
4. **No Component-to-Component**: All communication flows through App.tsx

#### **Data Flow Categories**:

**Display Data** (One-Way):
- ProgressBar receives `timeRemaining` and `totalDuration`
- Read-only props, no callbacks

**Form Controls** (Two-Way):
- NumberInput, Slider, Toggle use controlled component pattern
- Parent owns state, child notifies of changes
- Example: `<NumberInput value={X} onChange={setX} />`

**Action Triggers** (Event-Only):
- Button receives `onClick` callback
- No state passed down, only event handlers

#### **Props Interface Characteristics**:
- **Minimal APIs**: 2-5 props per component
- **Clear Types**: TypeScript interfaces for all props
- **Optional Props**: Sensible defaults (min, max, step, className)
- **Callback Naming**: Consistent `onX` pattern for events

---

## 10. View State Machine

```d2
direction: right

Idle State: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Condition: {
    "!isRunning && hasBeenDismissed"
  }

  UI Elements: {
    "Completed Sessions Counter"
    "Reset Count Button"
    "Theme Toggle"
    "Alarm Toggle"
    "Alarm Volume Slider"
    "Alarm Test Button"
    "Work Duration Input"
    "Go! Button"
  }

  Actions: {
    "Start Session → Timer State"
    "Test Alarm → (stays Idle)"
  }
}

Timer State: {
  shape: rectangle
  style.fill: "#fff3e0"

  Condition: {
    "timeRemaining !== null"
  }

  UI Elements: {
    "Progress Bar"
    "Countdown Display"
    "End Time Display"
    "Pause/Resume Button"
    "Cancel Button"
    "Finish Session Button"
  }

  Actions: {
    "Pause/Resume (stays in Timer)"
    "Cancel → Idle State"
    "Finish Early → Idle State"
    "Timer Expires → Alarm State"
  }
}

Alarm State: {
  shape: rectangle
  style.fill: "#ffebee"

  Condition: {
    "timerFinished && isAlarmActive && !isTestingAlarm"
  }

  UI Elements: {
    "Take a break heading"
    "Dismiss Alarm Button"
  }

  Actions: {
    "Dismiss → Idle State"
    "(increments completedWorkSessions)"
  }
}

Idle State -> Timer State: "Start Session"
Timer State -> Idle State: "Cancel/Finish Early"
Timer State -> Alarm State: "Timer Expires"
Alarm State -> Idle State: "Dismiss"
```

### View State Machine Description

**Pattern**: Explicit State Machine with Conditional Rendering

The App component renders different UIs based on application state. These are **mutually exclusive views** (only one shown at a time).

#### **State Transitions**:

**Idle → Timer**:
```typescript
onStartWorkSession() {
  setHasBeenDismissed(false)
  startTimer(totalSeconds)
}
// Condition: !isRunning → isRunning
```

**Timer → Alarm**:
```typescript
useTimer({ onFinish: playAlarm })
// Triggered automatically when timeRemaining reaches 0
```

**Alarm → Idle**:
```typescript
onDismissAlarm() {
  dismissAlarm()
  setHasBeenDismissed(true)
  setCompletedWorkSessions(prev => prev + 1)
}
```

**Timer → Idle (Early Exit)**:
```typescript
// Via Cancel
onCancelTimer() {
  cancelTimer()
  setHasBeenDismissed(true)
  // Does NOT increment counter
}

// Via Finish Early
onFinishWorkSessionEarly() {
  cancelTimer()
  setHasBeenDismissed(true)
  setCompletedWorkSessions(prev => prev + 1)
  // DOES increment counter
}
```

#### **State Determination Logic**:
```typescript
// Render order matters! First match wins:

if (timerFinished && isAlarmActive && !isTestingAlarm) {
  return <AlarmView />
}

if (!isRunning && hasBeenDismissed) {
  return <IdleView />
}

if (timeRemaining !== null) {
  return <TimerView />
}
```

**Key Observation**: State machine implemented **implicitly** through boolean flags. Could be made **explicit** with discriminated union:
```typescript
type ViewState =
  | { type: 'idle' }
  | { type: 'timer'; isPaused: boolean }
  | { type: 'alarm' }
```

---

## 11. Data Types and Constants Architecture

```d2
direction: down

types.ts: {
  shape: rectangle
  style.fill: "#fff3e0"

  Theme: {
    "type Theme = 'dark' | 'light'"
    "Derived from THEMES constant"
  }

  SessionState: {
    "durationSeconds: number"
    "endTimestamp: number"
    "isBreak: boolean"
    "⚠️ NOT CURRENTLY USED"
  }
}

constants.ts: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Time Constants: {
    "DEFAULT_WORK_SESSION_DURATION_MINUTES = 25"
    "SECONDS_IN_MINUTE = 60"
    "MILLISECONDS_IN_SECOND = 1000"
  }

  Theme Constants: {
    "THEMES = { DARK: 'dark', LIGHT: 'light' } as const"
  }
}

utils.ts: {
  shape: rectangle
  style.fill: "#f3e5f5"

  formatTime: {
    "formatTime(seconds: number): string"
    "Converts seconds to MM:SS format"
    "Uses SECONDS_IN_MINUTE constant"
  }
}

Component Props: {
  shape: rectangle
  style.fill: "#e3f2fd"

  "ButtonProps"
  "SliderProps"
  "ToggleProps"
  "ThemeToggleProps"
  "ProgressBarProps"
  "NumberInputProps"
  "Defined inline in component files"
}

types.ts -> constants.ts: "references"
utils.ts -> constants.ts: "imports"
Component Props -> types.ts: "may use"
```

### Data Architecture Description

#### **Type System Organization**:

**Shared Types** (types.ts):
- Minimal: Only 2 types defined
- `Theme`: String literal union derived from const object
- `SessionState`: **Currently unused** (vestigial from planned feature)

**Component-Level Types**:
- Props interfaces defined **inline** with components
- No central props type registry
- Pattern: `interface ComponentNameProps { ... }`

#### **Constants Organization**:

**Time Conversions**:
```typescript
SECONDS_IN_MINUTE = 60
MILLISECONDS_IN_SECOND = 1000
// Used throughout for time calculations
```

**Configuration Values**:
```typescript
DEFAULT_WORK_SESSION_DURATION_MINUTES = 25  // Pomodoro standard
```

**Design Note**: Constants are **primitive values** (numbers, strings), not configuration objects. Could be enhanced with:
```typescript
const TIME_CONFIG = {
  defaultWorkMinutes: 25,
  defaultBreakMinutes: 5,
  timerUpdateIntervalMs: 100,
} as const
```

#### **Utility Functions**:

**formatTime** (utils.ts:3-7):
```typescript
formatTime(82) // → "1:22"
formatTime(3600) // → "60:00"
```

**Pure Function Characteristics**:
- No side effects
- Deterministic output
- Uses constant for conversion
- Pads seconds with leading zero

---

## 12. File Size and Complexity Metrics

```d2
direction: down

File Complexity: {
  App.tsx: {
    shape: rectangle
    style.fill: "#ffebee"
    "179 lines\n13 state variables\n10 event handlers\n3 custom hooks\nHIGHEST COMPLEXITY"
  }

  useTimer.ts: {
    shape: rectangle
    style.fill: "#fff3e0"
    "110 lines\n5 state variables\n1 effect with interval\nHIGH COMPLEXITY"
  }

  useAlarm.ts: {
    shape: rectangle
    style.fill: "#fff9c4"
    "52 lines\n2 effects\n1 ref\nMEDIUM COMPLEXITY"
  }

  useAppTheme.ts: {
    shape: rectangle
    style.fill: "#fff9c4"
    "32 lines\n2 effects\n1 state\nMEDIUM COMPLEXITY"
  }

  NumberInput.tsx: {
    shape: rectangle
    style.fill: "#e8f5e9"
    "39 lines\n1 event handler\nLOW COMPLEXITY"
  }

  Slider.tsx: {
    shape: rectangle
    style.fill: "#e8f5e9"
    "40 lines\n1 calculation\nLOW COMPLEXITY"
  }

  Other Components: {
    shape: rectangle
    style.fill: "#e8f5e9"
    "Button: 15 lines\nToggle: 29 lines\nThemeToggle: 19 lines\nProgressBar: 18 lines\nLOW COMPLEXITY"
  }

  Utilities: {
    shape: rectangle
    style.fill: "#e8f5e9"
    "types.ts: 14 lines\nconstants.ts: 8 lines\nutils.ts: 8 lines\nTRIVIAL"
  }
}
```

### Complexity Analysis

#### **Complexity Hotspots**:

**App.tsx** (179 lines):
- **Cognitive Load**: VERY HIGH
- **Responsibilities**: State management, event handling, conditional rendering, layout
- **Coupling**: Depends on 3 hooks, 6 components, 2 utilities
- **Testability**: LOW (many dependencies, mixed concerns)

**useTimer.ts** (110 lines):
- **Cognitive Load**: HIGH
- **Complexity Sources**: setInterval management, pause/resume logic, state synchronization
- **Side Effects**: Continuous time polling
- **Testability**: MEDIUM (needs fake timers)

**Custom Hooks** (52-110 lines each):
- **Well-Scoped**: Each handles one concern
- **Self-Contained**: Minimal external dependencies
- **Reusable**: Can be used in other apps

**UI Components** (15-40 lines each):
- **Simple**: Pure presentation, no business logic
- **Testable**: Easy to test in isolation
- **Composable**: Reusable across views

#### **Lines of Code by Category**:
- **Core Logic (App + Hooks)**: ~373 lines (65%)
- **UI Components**: ~160 lines (28%)
- **Utilities**: ~30 lines (5%)
- **Config**: ~10 lines (2%)

---

## 13. Side Effect Distribution

```d2
direction: down

Side Effect Sources: {
  App.tsx: {
    shape: rectangle
    style.fill: "#ffebee"

    Direct Effects: {
      "13 useState calls"
      "Date.now() reads (2x)"
      "new Date() calls (2x)"
    }

    Delegated Effects: {
      "useTimer → setInterval"
      "useAlarm → Audio playback"
      "useAppTheme → DOM mutation"
    }
  }

  useTimer.ts: {
    shape: rectangle
    style.fill: "#fff3e0"

    "window.setInterval() every 100ms"
    "Date.now() continuous reads"
    "window.clearInterval()"
    "onFinish callback invocation"
    "5 useState calls"
  }

  useAlarm.ts: {
    shape: rectangle
    style.fill: "#fff9c4"

    "new Audio('alarm.mp3')"
    "audio.play() / pause()"
    "Network request (lazy)"
    "useRef mutation"
    "console.error"
    "2 useState calls"
  }

  useAppTheme.ts: {
    shape: rectangle
    style.fill: "#fff9c4"

    "window.matchMedia()"
    "document.body.setAttribute()"
    "addEventListener('change')"
    "removeEventListener()"
    "1 useState call"
  }

  main.tsx: {
    shape: rectangle
    style.fill: "#e8f5e9"

    "ReactDOM.createRoot()"
    "navigator.serviceWorker"
    "window.addEventListener('load')"
  }
}

Browser APIs: {
  shape: cylinder
  style.fill: "#e3f2fd"

  "Timer API\nAudio API\nDOM API\nMedia Query API\nService Worker API"
}

Side Effect Sources.App.tsx -> Browser APIs
Side Effect Sources.useTimer.ts -> Browser APIs
Side Effect Sources.useAlarm.ts -> Browser APIs
Side Effect Sources.useAppTheme.ts -> Browser APIs
Side Effect Sources.main.tsx -> Browser APIs
```

### Side Effect Distribution Analysis

**Concentration of Effects**:
- **App.tsx**: 15+ direct/indirect side effects (state + hooks)
- **useTimer.ts**: 7+ effects (polling, state, callbacks)
- **useAlarm.ts**: 6+ effects (audio, network, refs)
- **useAppTheme.ts**: 5+ effects (DOM, events, state)
- **main.tsx**: 3 effects (mounting, service worker)

**Effect Categories by Type**:
1. **State Mutations**: 21 useState hooks across all components
2. **Time-Based**: setInterval, Date.now()
3. **Browser APIs**: Audio, DOM, Media Queries
4. **Network**: Audio file loading, Service Worker
5. **Event Handling**: addEventListener/removeEventListener

**Problem**: Side effects are **scattered** and **interleaved** with business logic. See [b.md](b.md) for detailed analysis and recommendations.

---

## 14. Test Surface Area

```d2
direction: down

Pure Functions: {
  shape: rectangle
  style.fill: "#e8f5e9"
  "formatTime()\nEasy to Test ✓"
}

Stateless Components: {
  shape: rectangle
  style.fill: "#e8f5e9"
  "Button, Toggle, Slider\nNumberInput, ProgressBar\nEasy to Test ✓"
}

Stateful Components: {
  shape: rectangle
  style.fill: "#fff9c4"
  "ThemeToggle\nMedium to Test ~"
}

Custom Hooks: {
  shape: rectangle
  style.fill: "#fff3e0"
  "useTimer, useAlarm, useAppTheme\nHard to Test ✗\nRequires: fake timers, Audio mocks, DOM mocks"
}

App Component: {
  shape: rectangle
  style.fill: "#ffebee"
  "App.tsx\nVery Hard to Test ✗✗\nRequires: all hook mocks, integration tests"
}

Pure Functions -> Stateless Components: "Testability decreases →"
Stateless Components -> Stateful Components
Stateful Components -> Custom Hooks
Custom Hooks -> App Component
```

### Testing Challenges

#### **Easy to Test** (Pure Functions & Stateless Components):
- No external dependencies
- Deterministic outputs
- No side effects
- Fast test execution

**Example**:
```typescript
describe('formatTime', () => {
  it('formats 82 seconds as 1:22', () => {
    expect(formatTime(82)).toBe('1:22')
  })
})
```

#### **Medium Difficulty** (Stateful Components):
- Requires React Testing Library
- Need to simulate user interactions
- State changes to verify

#### **Hard to Test** (Custom Hooks):
- Browser API mocking required
- Timer mocking for useTimer
- Audio mocking for useAlarm
- DOM mocking for useAppTheme
- Async behavior handling

**Required Test Setup**:
```typescript
jest.useFakeTimers()
global.Audio = jest.fn()
global.matchMedia = jest.fn()
```

#### **Very Hard to Test** (App.tsx):
- Integration of all hooks
- 13 pieces of state to manage
- Complex conditional rendering
- Many possible state combinations
- Requires comprehensive mocking

**Current Testing Status**: ⚠️ **No tests exist in repository**

---

## 15. Architectural Strengths and Weaknesses

```d2
direction: right

Strengths: {
  shape: rectangle
  style.fill: "#e8f5e9"

  "✓ Custom hooks isolate concerns"
  "✓ Components are reusable"
  "✓ TypeScript provides type safety"
  "✓ Pure utility functions"
  "✓ Clear file organization"
  "✓ Minimal dependencies"
  "✓ PWA capabilities"
}

Weaknesses: {
  shape: rectangle
  style.fill: "#ffebee"

  "✗ App.tsx is monolithic (179 lines)"
  "✗ 13 useState hooks (scattered state)"
  "✗ Side effects mixed with logic"
  "✗ Hard to test (no tests exist)"
  "✗ No state management library"
  "✗ Continuous polling (battery drain)"
  "✗ Direct DOM manipulation"
  "✗ Error handling incomplete"
}

Opportunities: {
  shape: rectangle
  style.fill: "#fff9c4"

  "→ Extract view components from App.tsx"
  "→ Use reducer for centralized state"
  "→ Implement service interfaces"
  "→ Add comprehensive tests"
  "→ Optimize timer (requestAnimationFrame)"
  "→ Add error boundaries"
  "→ Persist state to localStorage"
}

Strengths -> Opportunities: "can leverage"
Weaknesses -> Opportunities: "can improve"
```

### Architectural Assessment

#### **What Works Well**:

1. **Separation of Concerns via Hooks**:
   - Timer logic isolated in useTimer
   - Audio logic isolated in useAlarm
   - Theme logic isolated in useAppTheme

2. **Component Reusability**:
   - UI components are pure and composable
   - Can be extracted to component library

3. **Type Safety**:
   - TypeScript catches type errors at compile time
   - Props interfaces document component APIs

4. **Functional Approach**:
   - Pure utility functions (formatTime)
   - No class components

#### **What Needs Improvement**:

1. **App.tsx Complexity**:
   - 179 lines doing too much
   - Should be split into:
     - IdleView component
     - TimerView component
     - AlarmView component

2. **State Management**:
   - 13 useState hooks hard to coordinate
   - State transitions not atomic
   - Consider reducer pattern or state machine

3. **Side Effect Management**:
   - Effects scattered across files
   - No clear separation from business logic
   - Testing requires extensive mocking

4. **Performance**:
   - 100ms polling is wasteful
   - Could use requestAnimationFrame
   - Battery optimization needed

5. **Error Handling**:
   - Audio playback errors swallowed
   - No error boundaries
   - No user-facing error messages

6. **Persistence**:
   - Completed session count lost on refresh
   - Settings not persisted
   - Could use localStorage

---

## 16. Recommended Architecture Evolution

```d2
direction: down

Current: {
  shape: rectangle
  style.fill: "#ffebee"

  "Monolithic App.tsx\nScattered state\nMixed concerns"
}

Phase 1: {
  shape: rectangle
  style.fill: "#fff9c4"

  "Extract view components\nIdleView, TimerView, AlarmView"
}

Phase 2: {
  shape: rectangle
  style.fill: "#fff3e0"

  "Implement useReducer\nCentralize state management"
}

Phase 3: {
  shape: rectangle
  style.fill: "#e3f2fd"

  "Create service interfaces\nITimerService, IAudioService"
}

Phase 4: {
  shape: rectangle
  style.fill: "#e8f5e9"

  "Add tests\nUnit tests for services\nIntegration tests for views"
}

Current -> Phase 1: "Refactor UI"
Phase 1 -> Phase 2: "Refactor State"
Phase 2 -> Phase 3: "Refactor Side Effects"
Phase 3 -> Phase 4: "Add Tests"
```

### Evolution Roadmap

#### **Phase 1: Component Extraction** (Low Risk)
Split App.tsx into view components:
```typescript
<App>
  {state.view === 'idle' && <IdleView />}
  {state.view === 'timer' && <TimerView />}
  {state.view === 'alarm' && <AlarmView />}
</App>
```

**Benefits**:
- Smaller, focused components
- Easier to understand
- Better testability

#### **Phase 2: State Consolidation** (Medium Risk)
Replace useState with useReducer:
```typescript
const [state, dispatch] = useReducer(appReducer, initialState)

// Instead of:
setAlarmVolume(50)

// Use:
dispatch({ type: 'SET_ALARM_VOLUME', volume: 50 })
```

**Benefits**:
- Atomic state transitions
- Centralized logic
- Time-travel debugging

#### **Phase 3: Service Abstraction** (Medium Risk)
Extract side effects to services:
```typescript
interface ITimerService {
  start(duration: number): void
  onTick(callback: (remaining: number) => void): void
}

const timerService = useTimerService()
```

**Benefits**:
- Testable (mock services)
- Swappable implementations
- Clear boundaries

#### **Phase 4: Test Coverage** (Low Risk)
Add comprehensive tests:
- Unit tests for pure functions
- Component tests for UI
- Integration tests for flows
- E2E tests for critical paths

**Target**: 80%+ code coverage

---

## Summary

The Pomo codebase follows a **React Hooks-based architecture** with clear strengths in **component composition** and **separation of concerns via custom hooks**. However, it suffers from **state management complexity** and **mixed side effects** that make testing difficult.

**Key Architectural Characteristics**:
- ✅ **Modular**: Custom hooks isolate timer, alarm, and theme logic
- ✅ **Type-Safe**: TypeScript throughout
- ✅ **Functional**: No classes, pure functions
- ❌ **Monolithic**: App.tsx does too much (179 lines)
- ❌ **Stateful**: 13 useState hooks hard to coordinate
- ❌ **Effectful**: Side effects interleaved with logic

**Recommended Path Forward**: See [a.md](a.md) for detailed refactoring strategies using functional programming and clean architecture principles.
