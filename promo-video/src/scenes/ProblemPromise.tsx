import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';

export const ProblemPromise: React.FC = () => {
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
				background: colors.bg,
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
						color: colors.text,
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
						color: colors.accentDeep,
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
						color: colors.textMuted,
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
