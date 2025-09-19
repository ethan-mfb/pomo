import { NumberInput } from './components/NumberInput.tsx';

export function App() {
  return (
    <div className="app">
      <NumberInput
        id="work-duration"
        label="Work Session Duration (minutes):"
        value={25}
        placeholder="25"
        onChange={console.log}
      />
      <button
        onClick={() => {
          throw new Error('TODO: implement');
        }}
      >
        Start
      </button>
    </div>
  );
}
