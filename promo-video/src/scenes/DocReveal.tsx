import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';
import {AppFrame} from '../components/AppFrame';
import {
	StatStripCard,
	EvalMeterCard,
	SectionsTableCard,
	GapCalloutCard,
} from '../components/DocCard';

export const DocReveal: React.FC = () => {
	const frame = useCurrentFrame();
	const captionOpacity = interpolate(frame, [4, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const colWidth = (1248 - 24) / 2;

	return (
		<AbsoluteFill
			style={{background: colors.bg, alignItems: 'center', justifyContent: 'center'}}
		>
			<AppFrame title="Kickoff Document" width={1360} height={760}>
				<div
					style={{
						height: '100%',
						padding: '32px 56px',
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
							color: colors.textMuted,
							opacity: captionOpacity,
						}}
					>
						One kickoff document. Every gap covered.
					</div>
					<StatStripCard startFrame={12} width={1248} />
					<div style={{display: 'flex', gap: 24}}>
						<EvalMeterCard startFrame={34} width={colWidth} />
						<SectionsTableCard startFrame={34} width={colWidth} />
					</div>
					<GapCalloutCard startFrame={92} width={1248} />
				</div>
			</AppFrame>
		</AbsoluteFill>
	);
};
