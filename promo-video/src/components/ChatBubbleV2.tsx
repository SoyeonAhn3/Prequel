import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';
import {typedText} from '../utils';

export const ChatBubbleV2: React.FC<{
	role: 'ai' | 'user';
	text: string;
	startFrame: number;
	framesPerChar?: number;
	maxWidth?: number;
	fontSize?: number;
}> = ({
	role,
	text,
	startFrame,
	framesPerChar = 2,
	maxWidth = 780,
	fontSize = 26,
}) => {
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
					padding: '16px 22px',
					borderRadius: isAi ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
					background: isAi ? colorsV2.surface : colorsV2.brand,
					border: isAi ? `1px solid ${colorsV2.border}` : 'none',
					color: isAi ? colorsV2.ink : '#ffffff',
					fontFamily,
					fontSize,
					fontWeight: 500,
					lineHeight: 1.45,
					boxShadow: isAi
						? '0 2px 10px rgba(20,22,40,0.05)'
						: '0 6px 18px rgba(79,99,240,0.28)',
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

export const ExampleAnswersHint: React.FC<{
	startFrame: number;
	bullets: string[];
	width?: number;
}> = ({startFrame, bullets, width = 620}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const entrance = spring({
		frame: frame - startFrame,
		fps,
		config: {damping: 18, mass: 0.6},
	});
	const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const translateY = interpolate(entrance, [0, 1], [12, 0]);

	return (
		<div
			style={{
				width,
				opacity,
				transform: `translateY(${translateY}px)`,
				background: colorsV2.surfaceAlt,
				border: `1px solid ${colorsV2.border}`,
				borderRadius: 14,
				padding: '14px 18px',
				display: 'flex',
				flexDirection: 'column',
				gap: 8,
			}}
		>
			<div
				style={{
					fontFamily,
					fontSize: 13,
					fontWeight: 700,
					color: colorsV2.inkMuted,
				}}
			>
				See example answers
			</div>
			{bullets.map((b) => (
				<div
					key={b}
					style={{
						fontFamily,
						fontSize: 14,
						fontWeight: 500,
						color: colorsV2.ink,
						display: 'flex',
						gap: 8,
					}}
				>
					<span style={{color: colorsV2.brand}}>•</span>
					{b}
				</div>
			))}
		</div>
	);
};
