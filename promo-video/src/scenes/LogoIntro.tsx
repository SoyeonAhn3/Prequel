import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';
import {LogoMark, Wordmark} from '../components/Logo';
import {Caption} from '../components/Caption';

export const LogoIntro: React.FC<{durationInFrames: number}> = ({
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const markSpring = spring({frame, fps, config: {damping: 12, mass: 0.7}});
	const markScale = interpolate(markSpring, [0, 1], [0.4, 1]);
	const markOpacity = interpolate(markSpring, [0, 1], [0, 1]);

	const wordSpring = spring({
		frame: frame - 10,
		fps,
		config: {damping: 18, mass: 0.6},
	});
	const wordOpacity = interpolate(frame - 10, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const wordX = interpolate(wordSpring, [0, 1], [-16, 0]);

	return (
		<AbsoluteFill
			style={{
				background: colors.bg,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 24}}>
					<div style={{transform: `scale(${markScale})`, opacity: markOpacity}}>
						<LogoMark size={96} />
					</div>
					<div style={{opacity: wordOpacity, transform: `translateX(${wordX}px)`}}>
						<Wordmark fontSize={96} />
					</div>
				</div>
				<Caption
					text="Every great project deserves a prequel."
					sceneDuration={durationInFrames}
					fontSize={30}
					color={colors.textMuted}
					weight={500}
					align="center"
				/>
			</div>
		</AbsoluteFill>
	);
};
