import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';
import {AppShellV2} from '../components/AppShellV2';
import {
	StatStripCardV2,
	EvalMeterCardV2,
	SectionsTableCardV2,
	GapCalloutCardV2,
} from '../components/DocCardV2';

export const DocRevealV2: React.FC = () => {
	const frame = useCurrentFrame();
	const captionOpacity = interpolate(frame, [4, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const colWidth = (1248 - 24) / 2;

	return (
		<AbsoluteFill
			style={{background: colorsV2.bg, alignItems: 'center', justifyContent: 'center'}}
		>
			<AppShellV2 width={1360} height={760} projectTitle="Kickoff Document">
				<div
					style={{
						height: '100%',
						padding: '28px 56px',
						display: 'flex',
						flexDirection: 'column',
						gap: 16,
					}}
				>
					<div
						style={{
							fontFamily,
							fontSize: 17,
							fontWeight: 600,
							color: colorsV2.inkMuted,
							opacity: captionOpacity,
						}}
					>
						One kickoff document. Every gap covered.
					</div>
					<StatStripCardV2 startFrame={12} width={1248} />
					<div style={{display: 'flex', gap: 24}}>
						<EvalMeterCardV2 startFrame={34} width={colWidth} />
						<SectionsTableCardV2 startFrame={34} width={colWidth} />
					</div>
					<GapCalloutCardV2 startFrame={92} width={1248} />
				</div>
			</AppShellV2>
		</AbsoluteFill>
	);
};
