import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {colorsV2} from './theme2';
import {SceneFade} from './components/SceneFade';
import {LogoIntro} from './scenes/LogoIntro';
import {ProblemPromiseV2} from './scenesV2/ProblemPromiseV2';
import {TypeDetectionV2} from './scenesV2/TypeDetectionV2';
import {InsightsBuildV2} from './scenesV2/InsightsBuildV2';
import {PauseResumeV2} from './scenesV2/PauseResumeV2';
import {DocRevealV2} from './scenesV2/DocRevealV2';
import {PayoffV2} from './scenesV2/PayoffV2';
import {EndCardV2} from './scenesV2/EndCardV2';

// Same nine-beat narrative as PrequelPromo, re-skinned to match the real
// product screenshot (white app shell, indigo CTA blue, navy "P" badge),
// with the insights-build beat expanded into the real three-column screen
// (step list · chat · live collected-info panel).
const SCENES = [
	{name: 'logo-intro', duration: 90},
	{name: 'problem-promise', duration: 105},
	{name: 'type-detection', duration: 120},
	{name: 'insights-build', duration: 320},
	{name: 'pause-resume', duration: 90},
	{name: 'doc-reveal', duration: 135},
	{name: 'payoff', duration: 90},
	{name: 'end-card', duration: 75},
] as const;

export const PrequelPromoV2: React.FC = () => {
	let cursor = 0;
	const ranges = SCENES.map((scene) => {
		const from = cursor;
		cursor += scene.duration;
		return {...scene, from};
	});

	return (
		<AbsoluteFill style={{background: colorsV2.bg}}>
			{ranges.map((scene) => (
				<Sequence key={scene.name} from={scene.from} durationInFrames={scene.duration}>
					<SceneFade durationInFrames={scene.duration}>
						{scene.name === 'logo-intro' && (
							<LogoIntro durationInFrames={scene.duration} />
						)}
						{scene.name === 'problem-promise' && <ProblemPromiseV2 />}
						{scene.name === 'type-detection' && <TypeDetectionV2 />}
						{scene.name === 'insights-build' && <InsightsBuildV2 />}
						{scene.name === 'pause-resume' && <PauseResumeV2 />}
						{scene.name === 'doc-reveal' && <DocRevealV2 />}
						{scene.name === 'payoff' && <PayoffV2 />}
						{scene.name === 'end-card' && <EndCardV2 />}
					</SceneFade>
				</Sequence>
			))}
		</AbsoluteFill>
	);
};

export const PREQUEL_PROMO_V2_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);
