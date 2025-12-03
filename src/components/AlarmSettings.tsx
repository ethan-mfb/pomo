import { Toggle } from './Toggle.tsx';
import { Slider } from './Slider.tsx';
import { Button } from './Button.tsx';
import { NumberInput } from './NumberInput.tsx';
import { DEFAULT_WORK_SESSION_DURATION_MINUTES } from '../constants.ts';

interface AlarmSettingsProps {
  alarmEnabled: boolean;
  onAlarmEnabledChange: (enabled: boolean) => void;
  alarmVolume: number;
  onAlarmVolumeChange: (volume: number) => void;
  isTestingAlarm: boolean;
  onToggleAlarmTest: () => void;
  workSessionDurationMinutes: number;
  onWorkSessionDurationChange: (minutes: number) => void;
  onStartWorkSession: () => void;
}

export function AlarmSettings({
  alarmEnabled,
  onAlarmEnabledChange,
  alarmVolume,
  onAlarmVolumeChange,
  isTestingAlarm,
  onToggleAlarmTest,
  workSessionDurationMinutes,
  onWorkSessionDurationChange,
  onStartWorkSession,
}: AlarmSettingsProps) {
  return (
    <div>
      <Toggle
        id="alarm-toggle"
        label="Alarm"
        className="alarm-toggle"
        checked={alarmEnabled}
        onChange={onAlarmEnabledChange}
      />
      {alarmEnabled && (
        <>
          <Slider
            id="alarm-volume"
            label="Alarm Volume:"
            value={alarmVolume}
            onChange={onAlarmVolumeChange}
            min={0}
            max={100}
            showValue={true}
          />
          <Button onClick={onToggleAlarmTest} className="alarm-test-button">
            {isTestingAlarm ? 'Stop Test' : 'Test Alarm'}
          </Button>
        </>
      )}
      <NumberInput
        id="work-duration"
        label="Work Session Duration (minutes):"
        value={workSessionDurationMinutes}
        placeholder={DEFAULT_WORK_SESSION_DURATION_MINUTES}
        onChange={onWorkSessionDurationChange}
        onEnter={onStartWorkSession}
      />
      <Button onClick={onStartWorkSession}>Go!</Button>
    </div>
  );
}
