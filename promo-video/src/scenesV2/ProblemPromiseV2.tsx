import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';

export const ProblemPromiseV2: React.FC = () => {
	const frame = useCurrentFrame();

	const line1Opacity = interpolate(frame, [0, 14], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const line2Opacity = interpolate(frame, [42, 58], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const line2Y = interpolate(frame, [42, 58], [10, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const subOpacity = interpolate(frame, [72, 86], [0, 1], {
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
					Most AI tools generate a plan from one prompt.
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
					Prequel interviews you first.
				</div>
				<div
					style={{
						fontFamily,
						fontSize: 28,
						fontWeight: 500,
						color: colorsV2.inkMuted,
						textAlign: 'center',
						opacity: subOpacity,
						marginTop: 6,
					}}
				>
					So the gaps surface before you build — not after.
				</div>
			</div>
		</AbsoluteFill>
	);
};
