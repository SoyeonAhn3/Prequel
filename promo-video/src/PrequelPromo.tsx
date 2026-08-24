import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {colors} from './theme';
import {SceneFade} from './components/SceneFade';
import {LogoIntro} from './scenes/LogoIntro';
import {ProblemPromise} from './scenes/ProblemPromise';
import {TypeDetection} from './scenes/TypeDetection';
import {InterviewHook} from './scenes/InterviewHook';
import {InsightsBuild} from './scenes/InsightsBuild';
import {PauseResume} from './scenes/PauseResume';
import {DocReveal} from './scenes/DocReveal';
import {Payoff} from './scenes/Payoff';
import {EndCard} from './scenes/EndCard';

const SCENES = [
	{name: 'logo-intro', duration: 90},
	{name: 'problem-promise', duration: 105},
	{name: 'type-detection', duration: 105},
	{name: 'interview-hook', duration: 165},
	{name: 'insights-build', duration: 165},
	{name: 'pause-resume', duration: 90},
	{name: 'doc-reveal', duration: 135},
	{name: 'payoff', duration: 90},
	{name: 'end-card', duration: 75},
] as const;

export const PrequelPromo: React.FC = () => {
	let cursor = 0;
	const ranges = SCENES.map((scene) => {
		const from = cursor;
		cursor += scene.duration;
		return {...scene, from};
	});

	return (
		<AbsoluteFill style={{background: colors.bg}}>
			{ranges.map((scene) => (
				<Sequence key={scene.name} from={scene.from} durationInFrames={scene.duration}>
					<SceneFade durationInFrames={scene.duration}>
						{scene.name === 'logo-intro' && (
							<LogoIntro durationInFrames={scene.duration} />
						)}
						{scene.name === 'problem-promise' && <ProblemPromise />}
						{scene.name === 'type-detection' && <TypeDetection />}
						{scene.name === 'interview-hook' && <InterviewHook />}
						{scene.name === 'insights-build' && <InsightsBuild />}
						{scene.name === 'pause-resume' && <PauseResume />}
						{scene.name === 'doc-reveal' && <DocReveal />}
						{scene.name === 'payoff' && <Payoff />}
						{scene.name === 'end-card' && <EndCard />}
					</SceneFade>
				</Sequence>
			))}
		</AbsoluteFill>
	);
};

export const PREQUEL_PROMO_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);
