import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';

export const PayoffV2: React.FC = () => {
	const frame = useCurrentFrame();

	const line1Opacity = interpolate(frame, [0, 14], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const line2Opacity = interpolate(frame, [32, 48], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const line2Y = interpolate(frame, [32, 48], [10, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				background: colorsV2.bg,
				alignItems: 'center',
				justifyContent: 'center',
				padding: '0 200px',
			}}
		>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
				<div
					style={{
						fontFamily,
						fontSize: 54,
						fontWeight: 700,
						color: colorsV2.ink,
						textAlign: 'center',
						lineHeight: 1.3,
						opacity: line1Opacity,
					}}
				>
					From one idea to a build-ready plan.
				</div>
				<div
					style={{
						fontFamily,
						fontSize: 54,
						fontWeight: 800,
						color: colorsV2.brand,
						textAlign: 'center',
						lineHeight: 1.3,
						opacity: line2Opacity,
						transform: `translateY(${line2Y}px)`,
					}}
				>
					Nothing skipped. Nothing guessed.
				</div>
			</div>
		</AbsoluteFill>
	);
};
