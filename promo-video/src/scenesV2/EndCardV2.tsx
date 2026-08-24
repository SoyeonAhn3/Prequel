import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';
import {LogoBadgeV2, WordmarkV2} from '../components/LogoV2';

export const EndCardV2: React.FC = () => {
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
				background: colorsV2.bg,
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
					<LogoBadgeV2 size={56} />
					<WordmarkV2 fontSize={56} />
				</div>
				<div
					style={{
						fontFamily,
						fontSize: 26,
						fontWeight: 600,
						color: colorsV2.inkMuted,
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
						color: colorsV2.brand,
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
