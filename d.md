# Data Flow Architecture - Pomo Application

## Overview

This document provides a comprehensive analysis of how data flows through the Pomo application, from user interactions to UI updates. The architecture follows React's unidirectional data flow pattern, with state managed through hooks and props.

---

## 1. Global Data Flow Overview

```d2
direction: down

User Interaction: {
  shape: oval
  style.fill: "#e3f2fd"
  "Clicks, Keyboard, System Events"
}

Event Handlers: {
  shape: rectangle
  style.fill: "#fff3e0"
  "App.tsx Event Handlers"
  "Component Callbacks"
}

State Updates: {
  shape: rectangle
  style.fill: "#f3e5f5"

  React State: {
    "setState() calls"
    "Hook state updates"
  }

  Side Effects: {
    "useEffect triggers"
    "Browser API calls"
  }
}

Re-render: {
  shape: rectangle
  style.fill: "#e8f5e9"
  "React reconciliation"
  "Virtual DOM diff"
  "DOM updates"
}

UI Display: {
  shape: oval
  style.fill: "#e3f2fd"
  "Updated screen"
}

User Interaction -> Event Handlers: "triggers"
Event Handlers -> State Updates: "updates"
State Updates.React State -> Re-render: "causes"
State Updates.Side Effects -> State Updates.React State: "may update"
Re-render -> UI Display: "renders"
UI Display -> User Interaction: "user sees changes"
```

### Flow Characteristics

**Pattern**: Unidirectional, Event-Driven, State-Reactive

**Key Properties**:
- **Single Direction**: Data flows down (state → props), events flow up (callbacks)
- **Immutable Updates**: State never mutated directly, always via setState
- **Reactive Rendering**: UI automatically updates when state changes
- **Batched Updates**: React batches multiple setState calls for performance

---

## 2. Application State Architecture

```d2
direction: right

Application State: {
  App.tsx Local State: {
    shape: rectangle
    style.fill: "#ffebee"

    Session Config: {
      workSessionDurationMinutes: "number (25)"
      totalDuration: "number (0)"
      endTime: "Date | null"
    }

    Session Tracking: {
      completedWorkSessions: "number (0)"
      hasBeenDismissed: "boolean (true)"
    }

    Alarm Settings: {
      alarmEnabled: "boolean (true)"
      alarmVolume: "number (50)"
      isTestingAlarm: "boolean (false)"
    }
  }

  Hook State: {
    shape: rectangle
    style.fill: "#fff3e0"

    useTimer State: {
      timeRemaining: "number | null"
      isRunning: "boolean"
      timerFinished: "boolean"
      isPaused: "boolean"
      endTime: "number | null (internal)"
      pausedTimeRemaining: "number | null"
    }

    useAlarm State: {
      isAlarmActive: "boolean"
      audio: "HTMLAudioElement | null (ref)"
    }

    useAppTheme State: {
      theme: "'dark' | 'light'"
    }
  }

  Derived State: {
    shape: rectangle
    style.fill: "#e8f5e9"

    "progress = (timeRemaining / totalDuration) * 100"
    "currentView = f(isRunning, hasBeenDismissed, timerFinished)"
    "endTimeDisplay = endTime.toLocaleTimeString()"
  }
}

App.tsx Local State -> Hook State: "coordinates with"
Hook State -> Derived State: "computes"
Derived State -> App.tsx Local State: "influences"
```

### State Organization

#### **App.tsx Local State** (8 pieces)
Lives in the App component, managed by individual `useState` hooks:

**Session Configuration**:
- `workSessionDurationMinutes`: User-configured duration (default: 25)
- `totalDuration`: Calculated total seconds for progress bar
- `endTime`: Calculated completion time for display

**Session Tracking**:
- `completedWorkSessions`: Counter for finished sessions
- `hasBeenDismissed`: Flag controlling view state transitions

**Alarm Settings**:
- `alarmEnabled`: Toggle for sound on/off
- `alarmVolume`: 0-100 range for volume control
- `isTestingAlarm`: Flag preventing alarm view during test

#### **Hook State** (11 pieces)
Encapsulated within custom hooks, exposed via return values:

**useTimer (6 pieces)**:
- Public: `timeRemaining`, `isRunning`, `timerFinished`, `isPaused`
- Internal: `endTime`, `pausedTimeRemaining`

**useAlarm (2 pieces)**:
- Public: `isAlarmActive`
- Internal: `audio` ref (not state, but stateful)

**useAppTheme (1 piece)**:
- Public: `theme`

#### **Derived State**
Computed values, not stored:
- Progress percentage for ProgressBar
- Current view determination
- Formatted time strings

**Total State Pieces**: 19 (8 local + 11 hook)

---

## 3. Data Flow: Starting a Work Session

```d2
direction: down

User Action: {
  shape: oval
  style.fill: "#e3f2fd"
  "User clicks 'Go!' button"
}

Event Handler: {
  shape: rectangle
  style.fill: "#fff3e0"

  onStartWorkSession: {
    "1. Read workSessionDurationMinutes"
    "2. Calculate totalSeconds = duration * 60"
    "3. setTotalDuration(totalSeconds)"
    "4. setEndTime(new Date(now + totalSeconds * 1000))"
    "5. dismissAlarm()"
    "6. startTimer(totalSeconds)"
    "7. setHasBeenDismissed(false)"
  }
}

State Changes: {
  shape: rectangle
  style.fill: "#f3e5f5"

  App State: {
    "totalDuration: 0 → 1500"
    "endTime: null → Date object"
    "hasBeenDismissed: true → false"
  }

  useAlarm State: {
    "isAlarmActive: true/false → false"
    "audio.currentTime: X → 0"
  }

  useTimer State: {
    "timeRemaining: null → 1500"
    "isRunning: false → true"
    "endTime: null → timestamp"
    "isPaused: false → false"
  }
}

Side Effects: {
  shape: rectangle
  style.fill: "#ffebee"

  "Date.now() read"
  "new Date() creation"
  "audio.pause() call"
  "setInterval() starts (100ms)"
}

View Update: {
  shape: rectangle
  style.fill: "#e8f5e9"

  "Idle View unmounts"
  "Timer View mounts"
  "ProgressBar receives props"
  "Countdown displays 25:00"
}

User Action -> Event Handler
Event Handler -> State Changes: "triggers"
Event Handler -> Side Effects: "executes"
State Changes -> View Update: "causes"
View Update -> User Action: "user sees Timer View"
```

### Step-by-Step Flow

**Step 1: User Interaction**
- User clicks "Go!" button in Idle View
- Button's `onClick` prop calls `onStartWorkSession`

**Step 2: Read Input State**
```typescript
const totalSeconds = workSessionDurationMinutes * SECONDS_IN_MINUTE
// Example: 25 * 60 = 1500 seconds
```

**Step 3: Calculate Derived Values**
```typescript
setTotalDuration(totalSeconds)  // 1500
setEndTime(new Date(Date.now() + totalSeconds * MILLISECONDS_IN_SECOND))
// Example: new Date(now + 1500000)
```

**Step 4: Coordinate Hooks**
```typescript
dismissAlarm()      // Stop any playing alarm
startTimer(totalSeconds)  // Start countdown
```

**Step 5: Update View State**
```typescript
setHasBeenDismissed(false)  // Triggers view transition
```

**Step 6: React Reconciliation**
- React batches all state updates
- Component re-renders once
- Conditional rendering logic evaluates
- Timer View now matches conditions

**Step 7: Timer Starts**
- `useTimer` effect triggers on state change
- `setInterval` begins polling every 100ms
- Countdown starts updating

---

## 4. Data Flow: Timer Countdown Loop

```d2
direction: right

setInterval (100ms): {
  shape: diamond
  style.fill: "#fff3e0"
  "Fires every 100ms"
}

Update Function: {
  shape: rectangle
  style.fill: "#f3e5f5"

  Calculation: {
    "1. const now = Date.now()"
    "2. const remainingMs = endTime - now"
    "3. const remainingSeconds = Math.ceil(remainingMs / 1000)"
  }

  Decision: {
    shape: diamond
    "remainingSeconds <= 0?"
  }
}

Timer Continues: {
  shape: rectangle
  style.fill: "#e8f5e9"

  "setTimeRemaining(remainingSeconds)"
  "Component re-renders"
  "Display updates"
}

Timer Finishes: {
  shape: rectangle
  style.fill: "#ffebee"

  "setTimeRemaining(0)"
  "setEndTime(null)"
  "setTimerFinished(true)"
  "onFinish() → playAlarm()"
}

View Update: {
  shape: rectangle
  style.fill: "#e3f2fd"

  Countdown: {
    "formatTime(timeRemaining)"
    "Updates every 100ms"
  }

  ProgressBar: {
    "progress = (timeRemaining / totalDuration) * 100"
    "Width updates"
  }
}

setInterval (100ms) -> Update Function
Update Function.Calculation -> Update Function.Decision
Update Function.Decision -> Timer Continues: "NO"
Update Function.Decision -> Timer Finishes: "YES"
Timer Continues -> View Update
Timer Finishes -> View Update
View Update -> setInterval (100ms): "continues"
```

### Countdown Mechanism

**Polling Loop** (useTimer.ts:25-64):
```typescript
useEffect(() => {
  if (!isPaused && endTime !== null) {
    const updateTimeRemaining = () => {
      const now = Date.now()
      const remainingMs = endTime - now
      const remainingSeconds = Math.ceil(remainingMs / 1000)

      if (remainingSeconds <= 0) {
        // Timer finished
        setTimeRemaining(0)
        setEndTime(null)
        setTimerFinished(true)
        onFinish()  // Triggers playAlarm
      } else {
        // Timer continues
        setTimeRemaining(remainingSeconds)
      }
    }

    updateTimeRemaining()  // Immediate call
    const interval = setInterval(updateTimeRemaining, 100)

    return () => clearInterval(interval)
  }
}, [onFinish, isPaused, endTime, timeRemaining])
```

**Data Flow Characteristics**:
- **Frequency**: 10 updates per second (100ms interval)
- **Time Source**: System time (`Date.now()`), not elapsed time
- **State Update**: `setTimeRemaining` on every tick
- **Re-render**: Component re-renders 10 times per second
- **Optimization**: React batches updates, no flicker

**Derived Updates**:
Every time `timeRemaining` changes:
1. **Countdown Display**: `formatTime(timeRemaining)` recomputes
2. **Progress Bar**: `(timeRemaining / totalDuration) * 100` recalculates
3. **End Time Display**: Already computed, just displayed

---

## 5. Data Flow: Pause/Resume

```d2
direction: down

Pause Flow: {
  shape: rectangle
  style.fill: "#fff3e0"

  User Clicks Pause: {
    shape: oval
  }

  pauseTimer: {
    "1. Save current timeRemaining"
    "2. setPausedTimeRemaining(timeRemaining)"
    "3. setEndTime(null)  // Stop calculations"
    "4. setIsPaused(true)"
  }

  Effect Cleanup: {
    "endTime === null"
    "→ clearInterval()"
    "→ No more updates"
  }

  UI Updates: {
    "Button text: 'Pause' → 'Resume'"
    "End time display: '10:30:45 PM' → '--:--:-- --'"
    "Countdown frozen at current value"
  }

  User Clicks Pause -> pauseTimer
  pauseTimer -> Effect Cleanup
  Effect Cleanup -> UI Updates
}

Resume Flow: {
  shape: rectangle
  style.fill: "#e8f5e9"

  User Clicks Resume: {
    shape: oval
  }

  App.onResumeTimer: {
    "1. Read timeRemaining from hook"
    "2. Calculate new endTime"
    "3. setEndTime(new Date(now + remaining * 1000))"
    "4. Call hook.resumeTimer()"
  }

  Hook.resumeTimer: {
    "1. Read pausedTimeRemaining"
    "2. Calculate targetEndTime"
    "3. setEndTime(targetEndTime)"
    "4. setPausedTimeRemaining(null)"
    "5. setIsPaused(false)"
  }

  Effect Restart: {
    "endTime !== null"
    "→ setInterval() starts again"
    "→ Updates resume"
  }

  UI Updates: {
    "Button text: 'Resume' → 'Pause'"
    "End time recalculated and displayed"
    "Countdown resumes from paused value"
  }

  User Clicks Resume -> App.onResumeTimer
  App.onResumeTimer -> Hook.resumeTimer
  Hook.resumeTimer -> Effect Restart
  Effect Restart -> UI Updates
}

Pause Flow -> Resume Flow: "user can resume"
```

### Pause Mechanism

**Key Insight**: Pause is implemented by **clearing the target end time**, which stops the effect loop.

**State During Pause**:
- `timeRemaining`: Frozen at pause moment
- `endTime`: Set to `null` (stops interval)
- `pausedTimeRemaining`: Stores remaining seconds
- `isPaused`: `true`

### Resume Mechanism

**Two-Step Process**:
1. **App.tsx** recalculates `endTime` from current `timeRemaining`
2. **Hook** recalculates `endTime` from stored `pausedTimeRemaining`

**Note**: This is **redundant** - both App and hook calculate end time. Could be simplified.

---

## 6. Data Flow: Finishing Session Early

```d2
direction: down

User Action: {
  shape: oval
  style.fill: "#e3f2fd"
  "User clicks 'Finish Work Session'"
}

Event Handler: {
  shape: rectangle
  style.fill: "#fff3e0"

  onFinishWorkSessionEarly: {
    "1. cancelTimer()"
    "2. setEndTime(null)"
    "3. setHasBeenDismissed(true)"
    "4. setCompletedWorkSessions(prev => prev + 1)"
  }
}

Hook Update: {
  shape: rectangle
  style.fill: "#f3e5f5"

  cancelTimer: {
    "setTimeRemaining(null)"
    "setIsPaused(false)"
    "setTimerFinished(false)"
    "setEndTime(null)"
    "setPausedTimeRemaining(null)"
  }
}

Side Effects: {
  shape: rectangle
  style.fill: "#ffebee"

  "clearInterval() via effect cleanup"
  "No alarm played (unlike natural finish)"
}

State Result: {
  shape: rectangle
  style.fill: "#e8f5e9"

  App State: {
    "endTime: Date → null"
    "hasBeenDismissed: false → true"
    "completedWorkSessions: N → N+1"
  }

  Timer State: {
    "timeRemaining: N → null"
    "isRunning: true → false"
    "timerFinished: false (remains false)"
  }
}

View Transition: {
  shape: rectangle
  style.fill: "#e3f2fd"

  Condition Check: {
    "!isRunning && hasBeenDismissed"
    "→ true"
  }

  Result: {
    "Timer View unmounts"
    "Idle View mounts"
    "Counter shows incremented value"
  }
}

User Action -> Event Handler
Event Handler -> Hook Update
Event Handler -> Side Effects
Hook Update -> State Result
State Result -> View Transition
```

### Finish Early vs Natural Completion

**Similarities**:
- Both increment `completedWorkSessions`
- Both return to Idle View
- Both stop the timer

**Differences**:

| Aspect | Natural Finish | Finish Early |
|--------|----------------|--------------|
| Timer reaches 0 | ✓ Yes | ✗ No |
| Alarm plays | ✓ Yes | ✗ No |
| Shows alarm view | ✓ Yes | ✗ No |
| `timerFinished` flag | `true` | `false` |
| Transition | Timer → Alarm → Idle | Timer → Idle |

---

## 7. Data Flow: Alarm System

```d2
direction: down

Trigger: {
  shape: diamond
  style.fill: "#fff3e0"

  Natural: {
    "Timer reaches 0"
    "onFinish callback"
  }

  Manual: {
    "Test Alarm button"
    "onToggleAlarmTest"
  }
}

playAlarm Function: {
  shape: rectangle
  style.fill: "#f3e5f5"

  State Update: {
    "setIsAlarmActive(true)"
  }

  Conditional: {
    shape: diamond
    "soundEnabled?"
  }

  Audio Creation: {
    "if (audio.current === null)"
    "  audio.current = new Audio('alarm.mp3')"
  }

  Audio Config: {
    "audio.current.loop = false"
    "audio.current.volume = volume / 100"
  }

  Playback: {
    "audio.current.play().catch(console.error)"
  }
}

State Changes: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Hook State: {
    "isAlarmActive: false → true"
  }

  Audio Element: {
    "Lazy initialized (first play)"
    "Volume updated"
    "Playback started"
  }

  App State: {
    "timerFinished: true (if natural)"
  }
}

View Updates: {
  shape: rectangle
  style.fill: "#e3f2fd"

  Conditional Render: {
    "if (timerFinished && isAlarmActive && !isTestingAlarm)"
    "  → Show Alarm View"
  }

  Alarm View: {
    "Displays 'Take a break'"
    "Shows 'Dismiss Alarm' button"
  }
}

Dismissal: {
  shape: rectangle
  style.fill: "#ffebee"

  User Clicks Dismiss: {
    shape: oval
  }

  dismissAlarm: {
    "audio.current.pause()"
    "audio.current.currentTime = 0"
    "setIsAlarmActive(false)"
  }

  onDismissAlarm: {
    "dismissAlarm()"
    "setHasBeenDismissed(true)"
    "setCompletedWorkSessions(prev => prev + 1)"
  }

  Return to Idle: {
    "Alarm View unmounts"
    "Idle View mounts"
  }
}

Trigger -> playAlarm Function
playAlarm Function.Conditional -> playAlarm Function.Audio Creation: "YES"
playAlarm Function.Conditional -> playAlarm Function.State Update: "NO"
playAlarm Function.Audio Creation -> playAlarm Function.Audio Config
playAlarm Function.Audio Config -> playAlarm Function.Playback
playAlarm Function -> State Changes
State Changes -> View Updates
View Updates -> Dismissal
```

### Alarm Data Flow

**Trigger Paths**:
1. **Natural**: Timer countdown reaches 0 → `onFinish()` → `playAlarm()`
2. **Manual**: User clicks "Test Alarm" → `onToggleAlarmTest()` → `playAlarm()`

**Audio Lifecycle**:
```typescript
// First play: Create audio element
audio.current = new Audio('alarm.mp3')  // Network request

// Subsequent plays: Reuse element
audio.current.currentTime = 0  // Reset to start
audio.current.play()
```

**State Synchronization**:
- `isAlarmActive` (hook state) → controls alarm view visibility
- `timerFinished` (hook state) → distinguishes natural from test alarm
- `isTestingAlarm` (app state) → prevents alarm view during test

**View Logic**:
```typescript
// Only show alarm view for natural completion
if (timerFinished && isAlarmActive && !isTestingAlarm) {
  return <AlarmView />
}
```

---

## 8. Data Flow: Theme System

```d2
direction: right

Initialization: {
  shape: rectangle
  style.fill: "#fff3e0"

  OS Query: {
    "window.matchMedia('(prefers-color-scheme: light)')"
    "Read on mount"
  }

  Initial State: {
    "useState(() => getOsCurrentTheme())"
    "Returns 'light' or 'dark'"
  }

  OS Query -> Initial State
}

Runtime Updates: {
  shape: rectangle
  style.fill: "#f3e5f5"

  OS Change: {
    "User changes system theme"
    "Media query event fires"
  }

  Manual Toggle: {
    "User clicks theme button"
    "toggleTheme() called"
  }

  State Update: {
    "setTheme(newTheme)"
  }

  OS Change -> State Update: "handleChange"
  Manual Toggle -> State Update: "toggleTheme"
}

Side Effects: {
  shape: rectangle
  style.fill: "#ffebee"

  DOM Mutation: {
    "useEffect(() => {"
    "  document.body.setAttribute('data-theme', theme)"
    "}, [theme])"
  }

  CSS Re-evaluation: {
    "body[data-theme='dark'] styles apply"
    "OR"
    "body[data-theme='light'] styles apply"
  }

  DOM Mutation -> CSS Re-evaluation
}

UI Update: {
  shape: rectangle
  style.fill: "#e8f5e9"

  ThemeToggle Button: {
    "Icon changes: ◐ ↔ ◑"
  }

  App Styling: {
    "Colors transition"
    "All themed elements update"
  }
}

Initialization -> Runtime Updates
Runtime Updates.State Update -> Side Effects
Side Effects -> UI Update
UI Update -> Runtime Updates: "user sees change"
```

### Theme Data Flow

**Three-Way Synchronization**:
1. **OS Preference** → Read via Media Query API
2. **React State** → Managed by `useState`
3. **DOM Attribute** → Applied via `useEffect`

**Data Sources**:
- **Initial**: OS theme preference (light/dark)
- **Runtime**: OS changes OR manual toggle

**Propagation Chain**:
```
OS/User → setTheme() → useEffect → DOM → CSS → Visual Change
```

**Key Implementation Detail**:
Theme state lives in React, but styling applied **outside React** via direct DOM manipulation. This is acceptable but could be improved by using a root `<div className={theme}>` pattern.

---

## 9. Data Flow: Form Inputs

```d2
direction: down

Controlled Components: {
  shape: rectangle
  style.fill: "#fff3e0"

  Pattern: {
    "Value flows DOWN from parent state"
    "Events flow UP via callbacks"
  }
}

NumberInput Flow: {
  shape: rectangle
  style.fill: "#f3e5f5"

  Parent State: {
    "workSessionDurationMinutes: number"
  }

  Component Props: {
    "value={workSessionDurationMinutes}"
    "onChange={setWorkSessionDurationMinutes}"
  }

  User Types: {
    shape: oval
    "User enters '30'"
  }

  Input Event: {
    "onChange(e)"
    "Number(e.target.value)"
  }

  Callback Invocation: {
    "props.onChange(30)"
  }

  Parent Update: {
    "setWorkSessionDurationMinutes(30)"
  }

  Re-render: {
    "Component re-renders"
    "Input value now shows '30'"
  }

  User Types -> Input Event
  Input Event -> Callback Invocation
  Callback Invocation -> Parent Update
  Parent Update -> Re-render
  Re-render -> Component Props
}

Slider Flow: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Parent State: {
    "alarmVolume: number"
  }

  Component Props: {
    "value={alarmVolume}"
    "onChange={onAlarmVolumeChange}"
  }

  User Drags: {
    shape: oval
    "User drags to 75"
  }

  Range Event: {
    "onChange(e)"
    "Number(e.target.value)"
  }

  Callback Invocation: {
    "props.onChange(75)"
  }

  Handler: {
    "onAlarmVolumeChange(75)"
    "setAlarmVolume(75)"
  }

  Re-render: {
    "Slider updates position"
    "Volume display shows '75'"
  }

  User Drags -> Range Event
  Range Event -> Callback Invocation
  Callback Invocation -> Handler
  Handler -> Re-render
}

Toggle Flow: {
  shape: rectangle
  style.fill: "#fff9c4"

  Parent State: {
    "alarmEnabled: boolean"
  }

  Component Props: {
    "checked={alarmEnabled}"
    "onChange={setAlarmEnabled}"
  }

  User Clicks: {
    shape: oval
    "User toggles switch"
  }

  Checkbox Event: {
    "onChange(e)"
    "e.target.checked"
  }

  Callback Invocation: {
    "props.onChange(false)"
  }

  Parent Update: {
    "setAlarmEnabled(false)"
  }

  Re-render: {
    "Toggle switch animates"
    "Alarm section may hide"
  }

  User Clicks -> Checkbox Event
  Checkbox Event -> Callback Invocation
  Callback Invocation -> Parent Update
  Parent Update -> Re-render
}
```

### Controlled Component Pattern

**All form inputs follow this pattern**:

1. **Parent owns state**: `const [value, setValue] = useState(initial)`
2. **Props passed down**: `<Input value={value} onChange={setValue} />`
3. **User interaction**: Input captures event
4. **Event transformation**: Extract new value from event
5. **Callback invocation**: `props.onChange(newValue)`
6. **Parent update**: `setValue(newValue)` triggers re-render
7. **Props update**: Component receives new `value` prop
8. **Display sync**: Input shows updated value

**Benefits**:
- Single source of truth (parent state)
- React controls the input value
- Easy to add validation, formatting, side effects

**Components Using This Pattern**:
- `NumberInput`: Numeric input with Enter key support
- `Slider`: Range input with visual feedback
- `Toggle`: Checkbox with custom styling

---

## 10. Data Flow: Component Hierarchy

```d2
direction: down

App Component: {
  shape: rectangle
  style.fill: "#e3f2fd"

  State: "13 pieces"
  Hooks: "3 custom hooks"
  Handlers: "10 event handlers"
}

View Layer: {
  Idle View: {
    shape: rectangle
    style.fill: "#fff3e0"

    ThemeToggle: "theme, onToggle"
    Counter: "completedWorkSessions"
    ResetButton: "onClick"
    Toggle: "alarmEnabled, onChange"
    Slider: "alarmVolume, onChange"
    TestButton: "onClick"
    NumberInput: "workSessionDurationMinutes, onChange, onEnter"
    GoButton: "onClick"
  }

  Timer View: {
    shape: rectangle
    style.fill: "#f3e5f5"

    ProgressBar: "timeRemaining, totalDuration"
    Countdown: "formatTime(timeRemaining)"
    EndTime: "endTime, isPaused"
    PauseResumeButton: "onClick, isPaused"
    CancelButton: "onClick"
    FinishButton: "onClick"
  }

  Alarm View: {
    shape: rectangle
    style.fill: "#ffebee"

    Heading: "static text"
    DismissButton: "onClick"
  }
}

Data Down: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Props: {
    "State values"
    "Derived values"
    "Hook return values"
  }
}

Events Up: {
  shape: rectangle
  style.fill: "#fff9c4"

  Callbacks: {
    "setState functions"
    "Custom event handlers"
    "Hook methods"
  }
}

App Component -> View Layer: "renders based on state"
App Component -> Data Down: "passes"
Data Down -> View Layer: "to components"
View Layer -> Events Up: "invokes"
Events Up -> App Component: "updates"
```

### Hierarchy Flow Pattern

**Downward Flow (Props)**:
```
App State → Component Props → Rendered Output
```

**Upward Flow (Events)**:
```
User Interaction → Component Callback → Event Handler → State Update
```

**View Selection**:
```
State Conditions → Conditional Rendering → Active View → Components
```

**No Sibling Communication**:
- Components never talk to each other directly
- All communication goes through App.tsx parent
- Classic React "lifting state up" pattern

---

## 11. Data Flow: Effect Dependencies

```d2
direction: right

State Changes: {
  shape: rectangle
  style.fill: "#e3f2fd"

  "isPaused changes"
  "endTime changes"
  "timeRemaining changes"
  "theme changes"
}

useEffect Triggers: {
  shape: rectangle
  style.fill: "#fff3e0"

  Timer Effect: {
    "deps: [onFinish, isPaused, endTime, timeRemaining]"
    "→ Restart interval on any change"
  }

  Theme Effect: {
    "deps: [theme]"
    "→ Update DOM attribute"
  }

  Alarm Cleanup: {
    "deps: [dismissAlarm]"
    "→ Cleanup on unmount"
  }

  Media Query Effect: {
    "deps: []"
    "→ Setup listener once"
  }
}

Side Effects Execute: {
  shape: rectangle
  style.fill: "#f3e5f5"

  "clearInterval(old)"
  "setInterval(new)"
  "document.body.setAttribute()"
  "addEventListener()"
  "dismissAlarm()"
}

Cleanup Functions: {
  shape: rectangle
  style.fill: "#ffebee"

  "return () => clearInterval()"
  "return () => removeEventListener()"
  "return dismissAlarm"
}

State Changes -> useEffect Triggers: "trigger"
useEffect Triggers -> Cleanup Functions: "run cleanup first"
Cleanup Functions -> Side Effects Execute: "then execute"
Side Effects Execute -> State Changes: "may cause new"
```

### Effect Dependency Chain

**Timer Effect Dependencies**:
```typescript
useEffect(() => {
  // Effect body
}, [onFinish, isPaused, endTime, timeRemaining])
```

**Trigger Scenarios**:
1. `isPaused` changes → Stop/start interval
2. `endTime` changes → Recalculate with new target
3. `timeRemaining` changes → Update triggers re-run (creates loop!)
4. `onFinish` changes → Callback reference updated

**Problem**: `timeRemaining` in dependencies creates **effect loop**:
- Effect updates `timeRemaining`
- `timeRemaining` change triggers effect
- Effect runs again (but checks prevent infinite loop)

**This is a code smell** - dependency should be removed or effect restructured.

---

## 12. Data Persistence

```d2
direction: right

Current State: {
  shape: rectangle
  style.fill: "#ffebee"

  "No persistence implemented"
  "All state lost on refresh"
}

Lost on Refresh: {
  shape: rectangle
  style.fill: "#fff3e0"

  "completedWorkSessions"
  "alarmEnabled"
  "alarmVolume"
  "workSessionDurationMinutes"
  "theme (overridden)"
}

Session State: {
  shape: rectangle
  style.fill: "#fff9c4"

  "If timer running on refresh:"
  "→ Timer state lost"
  "→ Session lost"
  "→ No recovery"
}

Potential Solutions: {
  shape: rectangle
  style.fill: "#e8f5e9"

  localStorage: {
    "Save settings on change"
    "Restore on mount"
  }

  IndexedDB: {
    "For larger data"
    "Session history"
  }

  Service Worker: {
    "Background sync"
    "Offline persistence"
  }
}

Current State -> Lost on Refresh
Current State -> Session State
Potential Solutions -> Lost on Refresh: "could prevent"
```

### Persistence Gaps

**Currently NO persistence for**:
- Settings (alarm, volume, duration)
- Session count
- Active timer state
- Theme preference (reverts to OS on refresh)

**Impact**:
- Poor user experience on refresh/reload
- Lost progress if browser crashes
- Settings reset to defaults

**Recommendation**: Add localStorage for settings, IndexedDB for session history.

---

## 13. Performance Characteristics

```d2
direction: down

Render Frequency: {
  shape: rectangle
  style.fill: "#fff3e0"

  Idle View: {
    "Renders on state change only"
    "Low frequency"
  }

  Timer View: {
    "Renders 10 times per second (100ms interval)"
    "High frequency"
  }

  Alarm View: {
    "Renders on state change only"
    "Low frequency"
  }
}

Optimization: {
  shape: rectangle
  style.fill: "#e8f5e9"

  React Batching: {
    "Multiple setState calls batched"
    "Single re-render per batch"
  }

  useCallback: {
    "playAlarm wrapped in useCallback"
    "dismissAlarm wrapped in useCallback"
    "Prevents unnecessary re-renders"
  }

  Pure Components: {
    "UI components are pure"
    "No unnecessary re-renders"
  }
}

Performance Issues: {
  shape: rectangle
  style.fill: "#ffebee"

  Polling: {
    "100ms interval is aggressive"
    "10 re-renders per second"
    "Battery drain on mobile"
  }

  Effect Dependencies: {
    "timeRemaining in deps causes loop"
    "Effect runs more than needed"
  }

  No Memoization: {
    "formatTime called on every render"
    "Progress calculation on every render"
    "Could use useMemo"
  }
}

Render Frequency -> Optimization: "mitigated by"
Render Frequency -> Performance Issues: "affected by"
```

### Performance Analysis

**Good**:
- ✅ React batching reduces re-renders
- ✅ useCallback prevents unnecessary hook re-creation
- ✅ Pure components don't re-render unnecessarily

**Problematic**:
- ❌ 10 re-renders per second during timer
- ❌ Calculations run on every render (no memoization)
- ❌ Effect dependency loop
- ❌ Continuous CPU usage

**Optimization Opportunities**:
1. Use `useMemo` for derived calculations
2. Reduce polling frequency (1Hz is sufficient for 1-second granularity)
3. Use `requestAnimationFrame` for smooth updates
4. Remove `timeRemaining` from effect dependencies

---

## Summary

### Data Flow Architecture Overview

**Pattern**: React Unidirectional Data Flow with Hook-Based State Management

**Key Characteristics**:
1. **State Location**: Distributed across App.tsx (8 pieces) and hooks (11 pieces)
2. **Flow Direction**: Props down, events up
3. **Update Trigger**: User interactions and timer polling
4. **Re-render Frequency**: 10Hz during active timer, event-driven otherwise
5. **Side Effects**: Managed via useEffect, coordinated through state
6. **Persistence**: None (all state lost on refresh)

**Data Flow Paths**:
- **User → State → View**: Standard React pattern
- **Timer → State → View**: Continuous polling loop
- **Hook → App → Hook**: Coordination via callbacks
- **OS → State → DOM**: Theme system external integration

**Strengths**:
- ✅ Clear unidirectional flow
- ✅ Predictable state updates
- ✅ Encapsulated hook logic
- ✅ Type-safe interfaces

**Weaknesses**:
- ❌ State scattered across multiple useState calls
- ❌ No atomic state transitions
- ❌ High re-render frequency
- ❌ Effect dependency issues
- ❌ No persistence layer

**Recommended Improvements**:
1. Consolidate state with `useReducer`
2. Add localStorage persistence
3. Optimize timer update frequency
4. Fix effect dependency loops
5. Add memoization for derived values

For architectural recommendations, see [a.md](a.md) and [c.md](c.md).
