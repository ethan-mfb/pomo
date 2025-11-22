# Applying Functional Programming & Clean Architecture to App.tsx

## Current Architecture Analysis

The current `App.tsx` has several architectural concerns mixed together:

- **UI State Management** (alarmEnabled, alarmVolume, workSessionDurationMinutes, etc.)
- **Business Logic** (timer management, session completion, alarm triggering)
- **Presentation Logic** (rendering different UI states)
- **Side Effects** (playing/dismissing alarms, timer operations)

## Proposed Architecture Improvements

### 1. Domain Model Separation

**Principle**: Separate business domain from presentation concerns.

```d2
direction: right

Domain Layer: {
  shape: rectangle

  WorkSession: {
    shape: class
    - id: string
    - durationMinutes: number
    - startTime: Date
    - status: SessionStatus
    + complete(): void
    + cancel(): void
  }

  SessionStatus: {
    shape: class
    NotStarted | InProgress | Paused | Completed | Cancelled
  }

  Timer: {
    shape: class
    - remainingSeconds: number
    - totalSeconds: number
    + start(duration): void
    + pause(): void
    + resume(): void
    + finish(): void
  }
}

Application Layer: {
  shape: rectangle

  SessionManager: {
    shape: class
    + startSession(duration): WorkSession
    + finishSessionEarly(): void
    + pauseSession(): void
    + resumeSession(): void
  }

  AlarmService: {
    shape: class
    + play(volume): void
    + dismiss(): void
    + test(volume): void
  }
}

Presentation Layer: {
  shape: rectangle

  App: {
    shape: class
    Uses domain via hooks
  }

  Hooks: {
    useSessionManager
    useAlarmController
  }
}

Domain Layer -> Application Layer: "used by"
Application Layer -> Presentation Layer: "consumed by"
```

### 2. Functional State Management

**Current Problem**: Multiple `useState` calls create scattered state that's hard to reason about.

**Solution**: Use a reducer pattern with pure functions.

```typescript
// Domain Types
type SessionState =
  | { type: 'idle'; completedSessions: number }
  | { type: 'running'; session: WorkSession; isPaused: boolean }
  | { type: 'alarming'; session: WorkSession };

type AppState = {
  session: SessionState;
  settings: {
    workDurationMinutes: number;
    alarmEnabled: boolean;
    alarmVolume: number;
  };
  ui: {
    isTestingAlarm: boolean;
  };
};

// Pure reducer functions
type Action =
  | { type: 'SESSION_START'; durationMinutes: number }
  | { type: 'SESSION_PAUSE' }
  | { type: 'SESSION_RESUME' }
  | { type: 'SESSION_FINISH_EARLY' }
  | { type: 'SESSION_CANCEL' }
  | { type: 'ALARM_DISMISS' }
  | { type: 'SETTINGS_UPDATE'; settings: Partial<AppState['settings']> };

const sessionReducer = (state: AppState, action: Action): AppState => {
  // Pure state transitions
};
```

**Benefits**:

- All state transitions in one place
- Easier to test (pure functions)
- Time-travel debugging possible
- State changes are predictable

### 3. Dependency Injection for Services

**Current Problem**: Direct coupling to `useAlarm` and `useTimer` hooks makes testing difficult.

```d2
Current: {
  App -> useTimer: "tightly coupled"
  App -> useAlarm: "tightly coupled"

  style: {
    fill: "#ffcccc"
  }
}

Proposed: {
  App -> SessionManager: "depends on interface"
  SessionManager -> ITimerService: "interface"
  SessionManager -> IAlarmService: "interface"

  TimerImpl: "implements ITimerService"
  AlarmImpl: "implements IAlarmService"

  ITimerService -> TimerImpl: "runtime injection"
  IAlarmService -> AlarmImpl: "runtime injection"

  style: {
    fill: "#ccffcc"
  }
}
```

**Implementation**:

```typescript
// Service interfaces
interface ITimerService {
  start(duration: number): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  getTimeRemaining(): number | null;
  isRunning(): boolean;
}

interface IAlarmService {
  play(): void;
  dismiss(): void;
  isActive(): boolean;
}

// Inject via context
const ServiceContext = React.createContext<{
  timerService: ITimerService;
  alarmService: IAlarmService;
}>(null!);

// App component uses services through context
function App() {
  const { timerService, alarmService } = useContext(ServiceContext);
  // ...
}
```

### 4. Command Pattern for Actions

**Principle**: Encapsulate operations as objects.

```typescript
// Commands are objects that encapsulate actions
interface Command {
  execute(): void;
  canExecute(): boolean;
}

class StartSessionCommand implements Command {
  constructor(
    private sessionManager: SessionManager,
    private durationMinutes: number
  ) {}

  canExecute(): boolean {
    return !this.sessionManager.hasActiveSession();
  }

  execute(): void {
    this.sessionManager.startSession(this.durationMinutes);
  }
}

class FinishSessionEarlyCommand implements Command {
  constructor(private sessionManager: SessionManager) {}

  canExecute(): boolean {
    return this.sessionManager.hasActiveSession();
  }

  execute(): void {
    this.sessionManager.finishSessionEarly();
  }
}
```

**Benefits**:

- Validation logic encapsulated
- Undo/redo capability
- Command history/logging
- Button disabled states handled automatically

### 5. Pure View Functions

**Principle**: Separate rendering logic from component.

```typescript
// Pure render functions
const renderIdleView = (
  settings: Settings,
  onStartSession: () => void,
  onSettingsChange: (s: Settings) => void
): JSX.Element => {
  // Pure rendering logic
};

const renderActiveSessionView = (
  session: WorkSession,
  isPaused: boolean,
  onPause: () => void,
  onResume: () => void,
  onCancel: () => void,
  onFinish: () => void
): JSX.Element => {
  // Pure rendering logic
};

const renderAlarmView = (onDismiss: () => void): JSX.Element => {
  // Pure rendering logic
};

// App component becomes a thin orchestrator
function App() {
  const state = useAppState();

  switch (state.session.type) {
    case 'idle':
      return renderIdleView(/* ... */);
    case 'running':
      return renderActiveSessionView(/* ... */);
    case 'alarming':
      return renderAlarmView(/* ... */);
  }
}
```

### 6. Effect Isolation

**Current Problem**: Side effects scattered throughout handlers.

**Solution**: Use custom hooks that isolate effects.

```typescript
// Effect hooks with clear responsibilities
function useSessionEffects(state: AppState) {
  // When session completes, trigger alarm
  useEffect(() => {
    if (state.session.type === 'alarming' && state.settings.alarmEnabled) {
      alarmService.play();
    }
  }, [state.session.type]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timerService.cancel();
      alarmService.dismiss();
    };
  }, []);
}

function useTimerSync(state: AppState) {
  // Sync timer with session state
  useEffect(() => {
    if (state.session.type === 'running') {
      // ...
    }
  }, [state.session]);
}
```

### 7. Composable Business Logic

**Principle**: Build complex behavior from small, pure functions.

```typescript
// Pure business logic functions
const calculateEndTime = (startTime: Date, durationSeconds: number): Date => {
  return new Date(startTime.getTime() + durationSeconds * 1000);
};

const shouldPlayAlarm = (session: SessionState, alarmEnabled: boolean): boolean => {
  return session.type === 'alarming' && alarmEnabled;
};

const canStartNewSession = (state: AppState): boolean => {
  return state.session.type === 'idle';
};

const canPauseSession = (state: AppState): boolean => {
  return state.session.type === 'running' && !state.session.isPaused;
};

// Compose into higher-level logic
const getAvailableActions = (state: AppState): Action[] => {
  return [
    canStartNewSession(state) && 'start',
    canPauseSession(state) && 'pause',
    // ...
  ].filter(Boolean);
};
```

### 8. Proposed Directory Structure

```
src/
├── domain/
│   ├── models/
│   │   ├── WorkSession.ts
│   │   ├── SessionStatus.ts
│   │   └── Timer.ts
│   ├── services/
│   │   ├── ITimerService.ts
│   │   ├── IAlarmService.ts
│   │   └── IStorageService.ts
│   └── logic/
│       ├── sessionLogic.ts (pure functions)
│       └── timerLogic.ts (pure functions)
├── application/
│   ├── state/
│   │   ├── AppState.ts
│   │   ├── actions.ts
│   │   └── reducer.ts
│   ├── commands/
│   │   ├── Command.ts
│   │   ├── StartSessionCommand.ts
│   │   └── FinishSessionCommand.ts
│   └── managers/
│       ├── SessionManager.ts
│       └── SettingsManager.ts
├── infrastructure/
│   ├── services/
│   │   ├── TimerService.ts (implementation)
│   │   ├── AlarmService.ts (implementation)
│   │   └── LocalStorageService.ts
│   └── hooks/
│       ├── useTimer.ts (wrap service)
│       └── useAlarm.ts (wrap service)
├── presentation/
│   ├── App.tsx (thin orchestrator)
│   ├── hooks/
│   │   ├── useAppState.ts
│   │   ├── useSessionEffects.ts
│   │   └── useCommands.ts
│   ├── views/
│   │   ├── IdleView.tsx
│   │   ├── ActiveSessionView.tsx
│   │   └── AlarmView.tsx
│   └── components/
│       ├── Button.tsx
│       ├── NumberInput.tsx
│       └── ...
```

### 9. Data Flow Architecture

```d2
direction: down

User Input: {
  shape: rectangle
  style.fill: "#e3f2fd"
}

UI Layer: {
  App Component
  View Components
  style.fill: "#fff3e0"
}

Application Layer: {
  Commands
  State Reducer
  Managers
  style.fill: "#f3e5f5"
}

Domain Layer: {
  Business Logic
  Domain Models
  Pure Functions
  style.fill: "#e8f5e9"
}

Infrastructure: {
  Services
  External APIs
  Browser APIs
  style.fill: "#fce4ec"
}

User Input -> UI Layer: "events"
UI Layer -> Application Layer: "dispatch actions"
Application Layer -> Domain Layer: "execute logic"
Domain Layer -> Application Layer: "return new state"
Application Layer -> Infrastructure: "trigger effects"
Infrastructure -> Application Layer: "callbacks"
Application Layer -> UI Layer: "state updates"
UI Layer -> User Input: "render"
```

### 10. Functional Patterns to Apply

#### Immutability

```typescript
// Current (mutating approach)
const onDismissAlarm = () => {
  dismissAlarm();
  setHasBeenDismissed(true);
  setCompletedWorkSessions((prev) => prev + 1);
};

// Functional (immutable state transition)
const dismissAlarm = (state: AppState): AppState => ({
  ...state,
  session: {
    type: 'idle',
    completedSessions:
      state.session.type === 'alarming'
        ? state.session.session.completedCount + 1
        : state.session.completedSessions,
  },
  ui: {
    ...state.ui,
    hasBeenDismissed: true,
  },
});
```

#### Function Composition

```typescript
// Compose small functions into larger ones
const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T) =>
    fns.reduce((acc, fn) => fn(acc), value);

const startSession = pipe(validateSessionDuration, createSession, initializeTimer, updateState);
```

#### Higher-Order Functions

```typescript
// Create configurable behavior
const withLogging = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args) => {
    console.log(`Calling ${fn.name} with`, args);
    const result = fn(...args);
    console.log(`${fn.name} returned`, result);
    return result;
  }) as T;
};

const withValidation = <T extends (...args: any[]) => any>(
  fn: T,
  validator: (args: Parameters<T>) => boolean
): T => {
  return ((...args) => {
    if (!validator(args)) {
      throw new Error('Validation failed');
    }
    return fn(...args);
  }) as T;
};
```

#### Monadic Error Handling

```typescript
// Result type for operations that can fail
type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

const startSession = (durationMinutes: number): Result<WorkSession> => {
  if (durationMinutes <= 0) {
    return {
      success: false,
      error: new Error('Duration must be positive'),
    };
  }

  return {
    success: true,
    value: {
      /* ... */
    },
  };
};

// Chain operations safely
const result = startSession(duration)
  .map((session) => initializeTimer(session))
  .map((timer) => playAlarm(timer))
  .mapError((err) => logError(err));
```

## Benefits Summary

```d2
direction: right

Current Issues: {
  shape: rectangle
  style.fill: "#ffcccc"

  "Mixed Concerns"
  "Hard to Test"
  "Scattered State"
  "Side Effects Everywhere"
  "Tight Coupling"
}

After Refactoring: {
  shape: rectangle
  style.fill: "#ccffcc"

  "Separation of Concerns"
  "Easy to Test (Pure Functions)"
  "Centralized State Management"
  "Isolated Effects"
  "Dependency Injection"
  "Type-Safe Architecture"
  "Predictable State Changes"
  "Composable Logic"
}

Current Issues -> After Refactoring: "Apply FP + Clean Architecture"
```

## Implementation Strategy

1. **Phase 1**: Extract domain models and pure business logic
2. **Phase 2**: Implement reducer-based state management
3. **Phase 3**: Create service interfaces and inject dependencies
4. **Phase 4**: Implement command pattern for user actions
5. **Phase 5**: Split views into pure render functions
6. **Phase 6**: Isolate side effects into dedicated hooks
7. **Phase 7**: Add comprehensive tests (now easy with pure functions)

## Testing Benefits

With this architecture, testing becomes straightforward:

```typescript
// Test pure business logic
describe('sessionLogic', () => {
  it('should complete session early', () => {
    const initialState = createRunningSession(25);
    const newState = finishSessionEarly(initialState);

    expect(newState.session.type).toBe('idle');
    expect(newState.session.completedSessions).toBe(1);
  });
});

// Test state transitions
describe('reducer', () => {
  it('should handle SESSION_FINISH_EARLY', () => {
    const state = { session: { type: 'running' } };
    const action = { type: 'SESSION_FINISH_EARLY' };
    const newState = reducer(state, action);

    expect(newState.session.type).toBe('idle');
  });
});

// Test commands
describe('FinishSessionEarlyCommand', () => {
  it('should only execute when session is active', () => {
    const manager = createMockSessionManager();
    const command = new FinishSessionEarlyCommand(manager);

    expect(command.canExecute()).toBe(true);
    command.execute();
    expect(manager.finishSessionEarly).toHaveBeenCalled();
  });
});

// Mock services easily
const mockTimerService: ITimerService = {
  start: jest.fn(),
  pause: jest.fn(),
  // ...
};
```

## Conclusion

Applying functional programming and clean architecture principles transforms App.tsx from a monolithic component with mixed concerns into a maintainable, testable, and extensible architecture. The key is **separation of concerns**, **pure functions**, **immutability**, and **dependency injection**.
