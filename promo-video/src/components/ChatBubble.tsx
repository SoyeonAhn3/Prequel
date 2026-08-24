import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';
import {typedText} from '../utils';

export const ChatBubble: React.FC<{
	role: 'ai' | 'user';
	text: string;
	startFrame: number;
	framesPerChar?: number;
	maxWidth?: number;
	fontSize?: number;
}> = ({role, text, startFrame, framesPerChar = 2, maxWidth = 860, fontSize = 30}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const entrance = spring({
		frame: frame - startFrame,
		fps,
		config: {damping: 18, mass: 0.6},
	});
	const translateY = interpolate(entrance, [0, 1], [16, 0]);
	const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const isAi = role === 'ai';

	// AI messages type out character by character (simulates thinking).
	// User messages appear instantly — the user already finished typing before sending.
	const shown = isAi ? typedText(frame, text, startFrame + 4, framesPerChar) : text;
	const isTyping = isAi && shown.length > 0 && shown.length < text.length;

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: isAi ? 'flex-start' : 'flex-end',
				opacity,
				transform: `translateY(${translateY}px)`,
			}}
		>
			<div
				style={{
					maxWidth,
					padding: '20px 26px',
					borderRadius: isAi ? '4px 22px 22px 22px' : '22px 4px 22px 22px',
					background: isAi ? colors.surface : colors.accentDeep,
					border: isAi ? `1px solid ${colors.border}` : 'none',
					color: isAi ? colors.text : colors.surface,
					fontFamily,
					fontSize,
					fontWeight: 500,
					lineHeight: 1.4,
					boxShadow: isAi
						? '0 2px 10px rgba(28,31,38,0.05)'
						: '0 6px 18px rgba(47,74,100,0.25)',
				}}
			>
				{shown}
				{isTyping ? (
					<span style={{opacity: frame % 20 < 10 ? 1 : 0}}>|</span>
				) : null}
			</div>
		</div>
	);
};
