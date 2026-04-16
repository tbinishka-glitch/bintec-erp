'use client';

import { Snowfall } from './Snowfall';
import { SantaSleigh } from './SantaSleigh';
import { Confetti } from './Confetti';
import { Fireworks } from './Fireworks';
import { Balloons } from './Balloons';

interface SeasonalEngineProps {
  settings: {
    snowfallEnabled: boolean;
    santaEnabled: boolean;
    confettiEnabled: boolean;
    fireworksEnabled: boolean;
    balloonsEnabled: boolean;
  };
}

export function SeasonalEngine({ settings }: SeasonalEngineProps) {
  // Renders the specific components based on the active global toggles. 
  // If a setting is false, the component never mounts, preserving 100% performance.
  return (
    <>
      {settings.snowfallEnabled && <Snowfall />}
      {settings.santaEnabled && <SantaSleigh />}
      {settings.confettiEnabled && <Confetti />}
      {settings.fireworksEnabled && <Fireworks />}
      {settings.balloonsEnabled && <Balloons />}
    </>
  );
}
