# Error Handling Analysis - Pomo Application

## Overview

This document provides a comprehensive analysis of error handling (or lack thereof) in the Pomo application. It catalogs all potential error scenarios, current handling mechanisms, and recommendations for improvement.

---

## 1. Current Error Handling Status

```d2
direction: down

Error Handling: {
  shape: rectangle
  style.fill: "#ffebee"

  Implemented: {
    style.fill: "#fff9c4"
    "1. Audio playback catch (silent)"
    "2. Null checks (defensive)"
    "3. TypeScript type guards"
  }

  NOT Implemented: {
    style.fill: "#ffebee"
    "❌ No error boundaries"
    "❌ No user-facing error messages"
    "❌ No error logging service"
    "❌ No graceful degradation"
    "❌ No retry mechanisms"
    "❌ No validation errors"
    "❌ No network error handling"
  }
}

Error Types: {
  shape: rectangle
  style.fill: "#e3f2fd"

  Runtime Errors: {
    "Audio playback failures"
    "Service worker failures"
    "Timer calculation errors"
  }

  User Input Errors: {
    "Invalid duration values"
    "NaN from number input"
  }

  Browser API Errors: {
    "matchMedia not supported"
    "Audio API not available"
    "DOM manipulation failures"
  }

  Network Errors: {
    "alarm.mp3 load failure"
    "Service worker script failure"
  }
}

Error Handling -> Error Types: "handles very few"
```

### Summary Status

**Error Handling Coverage**: ⚠️ **~5%**

**Only Explicit Error Handling**:
1. Audio playback catch → `console.error` (1 location)

**Implicit Safety**:
2. Null checks for optional values
3. TypeScript type checking at compile time

**Critical Gaps**:
- No error boundaries to catch React errors
- No user-facing error messages
- Failed operations happen silently
- No recovery mechanisms

---

## 2. Explicit Error Handling

### 2.1 Audio Playback Error Handling

**Location**: [src/hooks/useAlarm.ts:29](src/hooks/useAlarm.ts#L29)

```d2
direction: down

playAlarm Function: {
  shape: rectangle
  style.fill: "#fff3e0"

  Setup: {
    "audio.current = new Audio('alarm.mp3')"
    "audio.current.volume = volume / 100"
  }

  Playback: {
    shape: rectangle
    style.fill: "#ffebee"
    "audio.current.play()"
  }

  Promise: {
    shape: diamond
    "play() returns Promise<void>"
  }

  Success: {
    shape: rectangle
    style.fill: "#e8f5e9"
    "Audio plays"
  }

  Failure: {
    shape: rectangle
    style.fill: "#ffebee"
    ".catch(console.error)"
    "Error logged to console"
    "User sees nothing"
  }

  Setup -> Playback
  Playback -> Promise
  Promise -> Success: "resolved"
  Promise -> Failure: "rejected"
}
```

**Code**:
```typescript
audio.current.play().catch(console.error);
```

**What it does**:
- ✅ Prevents unhandled promise rejection
- ✅ Logs error to browser console

**What it doesn't do**:
- ❌ Doesn't inform the user
- ❌ Doesn't retry
- ❌ Doesn't fall back to alternatives
- ❌ Doesn't disable alarm feature
- ❌ Doesn't report to monitoring service

**Potential Failure Scenarios**:
1. **Network error**: alarm.mp3 fails to load (404, network down)
2. **Browser policy**: Autoplay blocked (user hasn't interacted yet)
3. **Audio API unavailable**: Older browser, API disabled
4. **File format**: Browser doesn't support MP3
5. **Permissions**: User denied audio permissions

**Impact**: User expects alarm but hears nothing. Timer finishes silently.

---

## 3. Defensive Null Checks

### 3.1 Audio Element Null Checks

**Location**: [src/hooks/useAlarm.ts](src/hooks/useAlarm.ts)

```d2
direction: right

Audio Ref: {
  shape: rectangle
  style.fill: "#fff3e0"
  "audio = useRef<HTMLAudioElement | null>(null)"
}

playAlarm: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Check: {
    shape: diamond
    "audio.current === null?"
  }

  Create: {
    "audio.current = new Audio('alarm.mp3')"
  }

  Use: {
    "audio.current.play()"
  }

  Check -> Create: "YES"
  Check -> Use: "NO"
}

dismissAlarm: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Check: {
    shape: diamond
    "audio.current !== null?"
  }

  Pause: {
    "audio.current.pause()"
    "audio.current.currentTime = 0"
  }

  Skip: {
    "Do nothing"
  }

  Check -> Pause: "YES"
  Check -> Skip: "NO"
}

Audio Ref -> playAlarm
Audio Ref -> dismissAlarm
```

**Code Examples**:

**playAlarm** (line 20):
```typescript
if (audio.current === null) {
  audio.current = new Audio('alarm.mp3');
  audio.current.loop = false;
}
```

**dismissAlarm** (line 33):
```typescript
if (audio.current !== null) {
  audio.current.pause();
  audio.current.currentTime = 0;
  setIsAlarmActive(false);
}
```

**Purpose**: Prevent accessing properties on null reference

**Effectiveness**: ✅ Prevents null pointer errors

**Limitation**: Doesn't handle audio creation failures

---

### 3.2 Timer State Null Checks

**Location**: [src/hooks/useTimer.ts](src/hooks/useTimer.ts), [src/App.tsx](src/App.tsx)

```d2
direction: down

State Checks: {
  Timer Effect: {
    shape: rectangle
    style.fill: "#fff3e0"

    "if (!isPaused && endTime !== null)"
    "  → Start interval"
    "else"
    "  → Skip effect"
  }

  Pause Handler: {
    shape: rectangle
    style.fill: "#e8f5e9"

    "if (timeRemaining !== null)"
    "  → Save paused time"
    "else"
    "  → No-op"
  }

  Resume Handler: {
    shape: rectangle
    style.fill: "#e8f5e9"

    "if (pausedTimeRemaining !== null)"
    "  → Calculate new endTime"
    "else"
    "  → No-op"
  }

  Cleanup: {
    shape: rectangle
    style.fill: "#fff9c4"

    "if (interval !== null)"
    "  → clearInterval(interval)"
    "else"
    "  → Skip cleanup"
  }
}

View Conditionals: {
  App.tsx: {
    shape: rectangle
    style.fill: "#e3f2fd"

    "if (timeRemaining !== null)"
    "  → Show Timer View"

    "if (endTime && !isPaused)"
    "  → Show end time display"
  }
}
```

**Purpose**: Use `null` to represent "timer not running" state

**Pattern**: `null` as sentinel value for inactive state

**Code Examples**:

**Timer effect guard** (useTimer.ts:28):
```typescript
if (!isPaused && endTime !== null) {
  // Run timer interval
}
```

**View conditional** (App.tsx:158):
```typescript
{timeRemaining !== null && (
  <div className="timer-display">
    {/* Timer UI */}
  </div>
)}
```

**Effectiveness**: ✅ Prevents operations on invalid state

**Problem**: Doesn't distinguish between "not started" and "error occurred"

---

### 3.3 Optional Prop Checks

**Location**: Component files

```d2
direction: right

Component Props: {
  NumberInput: {
    shape: rectangle
    style.fill: "#e8f5e9"

    "args.placeholder?.toString()"
    "args.onEnter && args.onEnter()"
  }

  Button: {
    shape: rectangle
    style.fill: "#e8f5e9"

    "className || ''"
  }

  Toggle: {
    shape: rectangle
    style.fill: "#e8f5e9"

    "className || ''"
  }

  Slider: {
    shape: rectangle
    style.fill: "#e8f5e9"

    "showValue && <span>..."
    "const { min = 0, max = 100, step = 1 }"
  }
}
```

**Patterns**:

**Optional chaining** (NumberInput.tsx:34):
```typescript
placeholder={args.placeholder?.toString()}
```

**Conditional invocation** (NumberInput.tsx:17):
```typescript
if (e.key === 'Enter' && args.onEnter) {
  args.onEnter();
}
```

**Default values** (Slider.tsx:15):
```typescript
const { min = 0, max = 100, step = 1, showValue = true } = args;
```

**Fallback operator** (Button.tsx:11):
```typescript
className={`button ${className || ''}`}
```

**Purpose**: Handle optional props gracefully

**Effectiveness**: ✅ Prevents errors from missing optional props

---

## 4. TypeScript Type Safety

```d2
direction: right

Compile-Time Checks: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Type Annotations: {
    "Function parameters typed"
    "Return types explicit"
    "State types declared"
  }

  Union Types: {
    "number | null"
    "Date | null"
    "HTMLAudioElement | null"
  }

  Interface Contracts: {
    "Component props interfaces"
    "Hook return type interfaces"
  }
}

Prevents: {
  shape: rectangle
  style.fill: "#fff9c4"

  "✓ Type mismatches"
  "✓ Missing required props"
  "✓ Invalid property access"
  "✓ Wrong function signatures"
}

Doesn't Prevent: {
  shape: rectangle
  style.fill: "#ffebee"

  "✗ Runtime errors"
  "✗ Network failures"
  "✗ Browser API failures"
  "✗ Invalid user input values"
  "✗ Race conditions"
}

Compile-Time Checks -> Prevents: "catches at compile time"
Compile-Time Checks -> Doesn't Prevent: "runtime issues remain"
```

**Example Type Guards**:

**Union type for nullable values**:
```typescript
const [endTime, setEndTime] = useState<Date | null>(null);
```

**Interface contracts**:
```typescript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}
```

**Hook return type**:
```typescript
export function useTimer(args: { onFinish: () => void }): {
  timeRemaining: number | null;
  isRunning: boolean;
  // ...
}
```

**Benefit**: Catches many errors at compile time

**Limitation**: Can't prevent runtime failures

---

## 5. Missing Error Handling

### 5.1 No React Error Boundaries

```d2
direction: down

Current: {
  shape: rectangle
  style.fill: "#ffebee"

  App: {
    "No ErrorBoundary wrapper"
  }

  Component Error: {
    "Render error in any component"
    "→ White screen of death"
    "→ No recovery"
  }

  Hook Error: {
    "Error in useEffect"
    "→ App crashes"
    "→ No fallback UI"
  }
}

Recommended: {
  shape: rectangle
  style.fill: "#e8f5e9"

  ErrorBoundary: {
    "Wrap <App /> in ErrorBoundary"
    "Catch render errors"
    "Display fallback UI"
  }

  Fallback UI: {
    "Sorry, something went wrong"
    "Reload button"
    "Contact support link"
  }

  Error Logging: {
    "componentDidCatch(error, info)"
    "Log to monitoring service"
  }
}

Current -> Recommended: "should implement"
```

**Current Behavior**:
If any component throws an error:
1. App crashes completely
2. User sees blank white screen
3. Browser console shows error
4. Only recovery: Hard refresh

**Recommended Implementation**:
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
    // TODO: Send to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1>Oops! Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### 5.2 No User Input Validation

```d2
direction: down

Number Input Issues: {
  shape: rectangle
  style.fill: "#ffebee"

  Invalid Values: {
    "User enters: -10"
    "User enters: 0"
    "User enters: 9999"
    "User enters: 1.5"
  }

  Current Behavior: {
    "No validation"
    "Accepted as-is"
    "May cause issues"
  }

  Problems: {
    "Negative duration → timer breaks"
    "Zero duration → immediate finish"
    "Huge duration → unusable"
    "Decimal duration → unexpected behavior"
  }
}

Recommended: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Validation: {
    "Min: 1 minute"
    "Max: 120 minutes"
    "Integer only"
  }

  User Feedback: {
    "Red border on invalid"
    "Error message below input"
    "Disable Go button if invalid"
  }

  Sanitization: {
    "Clamp to valid range"
    "Round to nearest integer"
  }
}

Number Input Issues -> Recommended: "needs"
```

**Current Code** (NumberInput.tsx:30):
```typescript
onChange={(e) => args.onChange(Number(e.target.value))}
```

**Problems**:
- `Number("")` → `0` (invalid duration)
- `Number("abc")` → `NaN` (breaks calculations)
- `Number("-10")` → `-10` (negative duration)
- No range constraints

**Recommended Fix**:
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = Number(e.target.value);

  // Validate
  if (isNaN(value)) return;  // Reject invalid
  if (value < 1) return;      // Reject too small
  if (value > 120) return;    // Reject too large

  args.onChange(Math.floor(value));  // Round to integer
};

<input
  type="number"
  min={1}
  max={120}
  step={1}
  onChange={handleChange}
/>
```

---

### 5.3 No Network Error Handling

```d2
direction: down

Network Requests: {
  shape: rectangle
  style.fill: "#ffebee"

  alarm.mp3: {
    "new Audio('alarm.mp3')"
    "Network request made"
  }

  Failure Scenarios: {
    "404 - File not found"
    "Network offline"
    "Server error"
    "Timeout"
    "CORS error"
  }

  Current Handling: {
    "Audio object created"
    "No error until play() called"
    "play().catch(console.error)"
    "User not informed"
  }
}

Service Worker: {
  shape: rectangle
  style.fill: "#fff3e0"

  Registration: {
    "navigator.serviceWorker.getRegistrations()"
    "No error handling"
  }

  Failure Scenarios: {
    "Service worker disabled"
    "Script error"
    "Registration fails"
  }

  Current Handling: {
    "Silent failure"
    "App continues without offline support"
  }
}

Recommended: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Audio Fallback: {
    "Detect load failure"
    "Show visual-only alarm"
    "Vibration API as fallback"
  }

  Service Worker: {
    "Catch registration errors"
    "Log but don't break app"
    "Continue without SW"
  }

  User Notification: {
    "Toast: 'Alarm sound unavailable'"
    "Suggest checking connection"
  }
}

Network Requests -> Recommended: "needs"
Service Worker -> Recommended: "needs"
```

**Current Code** (main.tsx:6-13):
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(() => {
      // No error handling
    });
  });
}
```

**Problem**: If service worker registration fails, failure is silent

**Recommended Fix**:
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then(() => {
        console.log('Service worker registered');
      })
      .catch((error) => {
        console.warn('Service worker registration failed:', error);
        // App continues without offline support
      });
  });
}
```

---

### 5.4 No Browser API Compatibility Checks

```d2
direction: down

Browser APIs Used: {
  shape: rectangle
  style.fill: "#fff3e0"

  HTMLAudioElement: {
    "new Audio()"
  }

  matchMedia: {
    "window.matchMedia()"
  }

  setInterval: {
    "window.setInterval()"
  }

  ServiceWorker: {
    "navigator.serviceWorker"
  }
}

Current Checks: {
  shape: rectangle
  style.fill: "#fff9c4"

  Partial: {
    "'serviceWorker' in navigator"
    "→ Only for service worker"
  }

  Missing: {
    "No matchMedia check"
    "No Audio API check"
  }
}

Potential Issues: {
  shape: rectangle
  style.fill: "#ffebee"

  Old Browsers: {
    "IE11: No matchMedia"
    "Old Safari: Audio restrictions"
  }

  Privacy Mode: {
    "Some APIs disabled"
  }

  Embedded WebView: {
    "Limited API support"
  }
}

Recommended: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Feature Detection: {
    "Check each API before use"
    "Provide fallbacks"
  }

  Graceful Degradation: {
    "matchMedia missing → default theme"
    "Audio missing → silent mode"
  }

  User Notification: {
    "Browser not fully supported"
    "Some features unavailable"
  }
}

Browser APIs Used -> Current Checks
Current Checks -> Potential Issues: "doesn't prevent"
Potential Issues -> Recommended: "needs"
```

**Recommended Checks**:

```typescript
// Theme system with fallback
const hasMatchMedia = window.matchMedia !== undefined;

function useAppTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (!hasMatchMedia) return THEMES.DARK;  // Fallback

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? THEMES.DARK : THEMES.LIGHT;
  });

  useEffect(() => {
    if (!hasMatchMedia) return;  // Skip listener

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // ... rest of implementation
  }, []);
}

// Audio with detection
const hasAudio = typeof Audio !== 'undefined';

function useAlarm(args) {
  const supportsAudio = useRef(hasAudio);

  const playAlarm = useCallback(() => {
    setIsAlarmActive(true);

    if (!supportsAudio.current || !args.soundEnabled) {
      // Visual-only alarm
      return;
    }

    // ... audio playback
  }, []);
}
```

---

### 5.5 No Timer Calculation Error Handling

```d2
direction: down

Potential Issues: {
  shape: rectangle
  style.fill: "#ffebee"

  Date Math Errors: {
    "endTime - now = negative"
    "endTime = NaN"
    "Math.ceil(NaN) = NaN"
  }

  State Corruption: {
    "timeRemaining = NaN"
    "totalDuration = 0"
    "Division by zero"
  }

  Display Issues: {
    "formatTime(NaN) = 'NaN:NaN'"
    "progress = NaN%"
    "Width: NaN%"
  }
}

Current Protection: {
  shape: rectangle
  style.fill: "#fff9c4"

  "if (remainingSeconds <= 0)"
  "  → Stop timer"
  "But doesn't check for NaN"
}

Recommended: {
  shape: rectangle
  style.fill: "#e8f5e9"

  Input Validation: {
    "Validate duration before start"
    "if (isNaN(duration) || duration <= 0) return"
  }

  Calculation Guards: {
    "const remaining = Math.max(0, endTime - now)"
    "if (isNaN(remaining)) { /* handle error */ }"
  }

  Display Fallbacks: {
    "formatTime: if (isNaN(seconds)) return '--:--'"
    "progress: Math.max(0, Math.min(100, ...))"
  }

  Error Recovery: {
    "Detect corrupt state"
    "Reset timer"
    "Notify user"
  }
}

Potential Issues -> Current Protection: "partially addresses"
Potential Issues -> Recommended: "needs"
```

**Example Fix for formatTime**:
```typescript
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '--:--';  // Fallback for invalid input
  }

  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const remainingSeconds = seconds % SECONDS_IN_MINUTE;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
```

---

## 6. Error Scenarios & Impact

```d2
direction: down

Error Scenarios: {
  Audio Load Fails: {
    shape: rectangle
    style.fill: "#ffebee"
    "Impact: Silent alarm"
    "User experience: Poor"
    "App functionality: Degraded"
  }

  Audio Play Blocked: {
    shape: rectangle
    style.fill: "#fff3e0"
    "Impact: No sound on first play"
    "User experience: Confusing"
    "App functionality: Partially working"
  }

  Service Worker Fails: {
    shape: rectangle
    style.fill: "#fff9c4"
    "Impact: No offline support"
    "User experience: Unaffected online"
    "App functionality: Reduced"
  }

  Invalid Duration Input: {
    shape: rectangle
    style.fill: "#ffebee"
    "Impact: Timer behaves unexpectedly"
    "User experience: Poor"
    "App functionality: Broken"
  }

  Component Render Error: {
    shape: rectangle
    style.fill: "#ff5252"
    "Impact: White screen of death"
    "User experience: App unusable"
    "App functionality: Completely broken"
  }

  Timer Calculation Error: {
    shape: rectangle
    style.fill: "#fff3e0"
    "Impact: Display shows NaN"
    "User experience: Poor"
    "App functionality: Degraded"
  }

  Theme Detection Fails: {
    shape: rectangle
    style.fill: "#e8f5e9"
    "Impact: Wrong initial theme"
    "User experience: Minor annoyance"
    "App functionality: Unaffected"
  }
}

Severity: {
  Critical: {
    style.fill: "#ff5252"
    "Component Render Error"
    "Invalid Duration Input"
  }

  High: {
    style.fill: "#ffebee"
    "Audio Load Fails"
    "Timer Calculation Error"
  }

  Medium: {
    style.fill: "#fff3e0"
    "Audio Play Blocked"
  }

  Low: {
    style.fill: "#e8f5e9"
    "Service Worker Fails"
    "Theme Detection Fails"
  }
}
```

### Impact Assessment

| Error Type | Current Handling | User Impact | Severity |
|------------|------------------|-------------|----------|
| Audio load failure | `console.error` | Silent alarm, no notification | 🔴 High |
| Audio play blocked | `console.error` | Confusion on first use | 🟡 Medium |
| Service worker failure | Silent | Reduced offline capability | 🟢 Low |
| Invalid duration | None | Broken timer | 🔴 Critical |
| Component error | None | White screen | 🔴 Critical |
| Timer calculation error | Partial | Display glitches | 🟡 High |
| Theme detection failure | Fallback to dark | Wrong colors | 🟢 Low |

---

## 7. Recommended Error Handling Strategy

```d2
direction: down

Layer 1 - Prevention: {
  shape: rectangle
  style.fill: "#e8f5e9"

  "Input validation"
  "Type safety (TypeScript)"
  "Feature detection"
  "Defensive programming"
}

Layer 2 - Detection: {
  shape: rectangle
  style.fill: "#fff9c4"

  "Try-catch blocks"
  "Promise catch handlers"
  "Error boundaries"
  "State validation"
}

Layer 3 - Recovery: {
  shape: rectangle
  style.fill: "#fff3e0"

  "Fallback values"
  "Default states"
  "Retry mechanisms"
  "Graceful degradation"
}

Layer 4 - Communication: {
  shape: rectangle
  style.fill: "#ffebee"

  "User notifications"
  "Error messages"
  "Suggestions"
  "Recovery actions"
}

Layer 5 - Monitoring: {
  shape: rectangle
  style.fill: "#f3e5f5"

  "Console logging"
  "Error reporting service"
  "Analytics"
  "Debug info"
}

Layer 1 - Prevention -> Layer 2 - Detection: "if failure occurs"
Layer 2 - Detection -> Layer 3 - Recovery: "attempt recovery"
Layer 3 - Recovery -> Layer 4 - Communication: "inform user"
Layer 4 - Communication -> Layer 5 - Monitoring: "log for analysis"
```

### Recommended Implementation

#### **1. Add Error Boundary**
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React error:', error, errorInfo);
    // TODO: Send to Sentry/LogRocket
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Oops! Something went wrong</h1>
          <p>We're sorry for the inconvenience.</p>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

#### **2. Add Input Validation**
```typescript
// src/utils/validation.ts
export function validateWorkDuration(minutes: number): {
  valid: boolean;
  error?: string;
} {
  if (isNaN(minutes)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  if (minutes < 1) {
    return { valid: false, error: 'Duration must be at least 1 minute' };
  }
  if (minutes > 120) {
    return { valid: false, error: 'Duration cannot exceed 120 minutes' };
  }
  if (minutes !== Math.floor(minutes)) {
    return { valid: false, error: 'Duration must be a whole number' };
  }
  return { valid: true };
}

// Usage in App.tsx
const handleStartSession = () => {
  const validation = validateWorkDuration(workSessionDurationMinutes);
  if (!validation.valid) {
    showErrorToast(validation.error!);
    return;
  }
  // ... start session
};
```

#### **3. Improve Audio Error Handling**
```typescript
// src/hooks/useAlarm.ts
const playAlarm = useCallback(() => {
  setIsAlarmActive(true);

  if (!soundEnabled) return;

  try {
    if (audio.current === null) {
      audio.current = new Audio('alarm.mp3');
      audio.current.loop = false;

      // Handle load errors
      audio.current.addEventListener('error', (e) => {
        console.error('Audio load failed:', e);
        showErrorToast('Alarm sound unavailable');
      });
    }

    audio.current.volume = volume / 100;

    audio.current.play()
      .catch((error) => {
        console.error('Audio playback failed:', error);

        // Specific error handling
        if (error.name === 'NotAllowedError') {
          showWarningToast('Please interact with the page to enable sound');
        } else if (error.name === 'NotSupportedError') {
          showErrorToast('Your browser does not support audio playback');
        } else {
          showErrorToast('Unable to play alarm sound');
        }
      });
  } catch (error) {
    console.error('Audio setup failed:', error);
    showErrorToast('Alarm system unavailable');
  }
}, [soundEnabled, volume]);
```

#### **4. Add Toast Notification System**
```typescript
// src/hooks/useToast.ts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'error' | 'warning' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  return {
    toasts,
    showError: (msg: string) => showToast(msg, 'error'),
    showWarning: (msg: string) => showToast(msg, 'warning'),
    showInfo: (msg: string) => showToast(msg, 'info'),
  };
}
```

#### **5. Add Safe formatTime**
```typescript
// src/utils.ts
export function formatTime(seconds: number): string {
  // Guard against invalid input
  if (!isFinite(seconds) || seconds < 0) {
    console.warn('formatTime received invalid input:', seconds);
    return '--:--';
  }

  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const remainingSeconds = seconds % SECONDS_IN_MINUTE;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
```

---

## 8. Error Handling Checklist

```d2
direction: down

Current Status: {
  shape: rectangle
  style.fill: "#ffebee"

  Implemented: {
    "❌ Error boundaries"
    "❌ Input validation"
    "❌ User-facing error messages"
    "❌ Network error handling"
    "❌ Graceful degradation"
    "❌ Error logging service"
    "✓ Some null checks"
    "✓ TypeScript types"
    "✓ One catch handler (audio)"
  }
}

Priority Improvements: {
  shape: rectangle
  style.fill: "#fff3e0"

  P0 - Critical: {
    "1. Add ErrorBoundary wrapper"
    "2. Validate duration input"
    "3. Handle audio failures gracefully"
  }

  P1 - High: {
    "4. Add toast notification system"
    "5. Safe formatTime implementation"
    "6. Feature detection for APIs"
  }

  P2 - Medium: {
    "7. Service worker error handling"
    "8. Network error recovery"
    "9. State validation"
  }

  P3 - Nice to Have: {
    "10. Error logging service (Sentry)"
    "11. Retry mechanisms"
    "12. Offline detection"
  }
}

Current Status -> Priority Improvements: "needs"
```

---

## Summary

### Current State

**Error Handling Coverage**: ⚠️ **~5%**

**What Exists**:
- 1 explicit error handler (audio playback)
- Defensive null checks
- TypeScript compile-time safety
- Basic optional prop handling

**Critical Gaps**:
- No error boundaries (app crashes → white screen)
- No input validation (accepts invalid values)
- No user-facing error messages (failures silent)
- No network error handling (assumes success)
- No graceful degradation (no fallbacks)

### Recommended Path Forward

**Phase 1 - Critical (P0)**:
1. Wrap app in ErrorBoundary
2. Add duration input validation
3. Improve audio error handling with user feedback

**Phase 2 - High Priority (P1)**:
4. Implement toast notification system
5. Add guards to utility functions (formatTime, etc.)
6. Add browser API feature detection

**Phase 3 - Medium Priority (P2)**:
7. Handle service worker registration errors
8. Add network error recovery
9. Validate state transitions

**Phase 4 - Enhancement (P3)**:
10. Integrate error monitoring (Sentry, LogRocket)
11. Add retry mechanisms for transient failures
12. Detect and handle offline scenarios

### Impact

Implementing these recommendations would:
- ✅ Prevent white screen crashes
- ✅ Validate user input before use
- ✅ Inform users of errors
- ✅ Gracefully degrade on failures
- ✅ Improve user trust and experience
- ✅ Enable debugging and monitoring

**Current User Experience**: Silent failures, crashes, confusion
**Target User Experience**: Clear feedback, graceful recovery, maintained functionality
