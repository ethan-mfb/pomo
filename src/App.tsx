import { useState, type ReactElement } from 'react';
import './App.scss';

type View = 'setup' | 'running';

export function App(): ReactElement {
  const [view, setView] = useState<View>('setup');

  return (
    <div className="app">
      {view === 'setup' && (
        <div className="app__setup">
          <h1 className="app__title">Pomo</h1>
          <button
            className="app__btn app__btn--primary"
            data-testid="start-btn"
            onClick={() => setView('running')}
          >
            Start
          </button>
        </div>
      )}

      {view === 'running' && (
        <div className="app__running">
          <h1 className="app__title">Pomo</h1>
          <button
            className="app__btn app__btn--secondary"
            data-testid="cancel-btn"
            onClick={() => setView('setup')}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
