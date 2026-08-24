import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';
import {LogoMark, Wordmark} from '../components/Logo';

export const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const entrance = spring({frame, fps, config: {damping: 18, mass: 0.6}});
	const scale = interpolate(entrance, [0, 1], [0.9, 1]);
	const opacity = interpolate(frame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const lineOpacity = interpolate(frame, [14, 26], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const urlOpacity = interpolate(frame, [24, 36], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				background: colors.bg,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 20,
					opacity,
					transform: `scale(${scale})`,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
					<LogoMark size={56} />
					<Wordmark fontSize={56} />
				</div>
				<div
					style={{
						fontFamily,
						fontSize: 26,
						fontWeight: 600,
						color: colors.textMuted,
						opacity: lineOpacity,
					}}
				>
					Find the gaps before you build.
				</div>
				<div
					style={{
						fontFamily,
						fontSize: 18,
						fontWeight: 600,
						color: colors.accent,
						opacity: urlOpacity,
						letterSpacing: 0.3,
					}}
				>
					prequel-production.netlify.app
				</div>
			</div>
		</AbsoluteFill>
	);
};
