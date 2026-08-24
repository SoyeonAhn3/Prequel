import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';

export const InsightRow: React.FC<{
	label: string;
	value: string;
	startFrame: number;
}> = ({label, value, startFrame}) => {
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
	const translateX = interpolate(entrance, [0, 1], [18, 0]);
	const checkScale = spring({
		frame: frame - startFrame - 4,
		fps,
		config: {damping: 12, mass: 0.4},
	});

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 14,
				opacity,
				transform: `translateX(${translateX}px)`,
				padding: '14px 18px',
				background: colors.surface,
				border: `1px solid ${colors.border}`,
				borderRadius: 14,
			}}
		>
			<div
				style={{
					width: 26,
					height: 26,
					borderRadius: '50%',
					background: colors.greenSoft,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0,
					transform: `scale(${checkScale})`,
				}}
			>
				<svg width={14} height={14} viewBox="0 0 16 16" fill="none">
					<path
						d="M3 8.5L6.2 11.5L13 4.5"
						stroke={colors.green}
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
			<div style={{fontFamily, lineHeight: 1.25}}>
				<div style={{fontSize: 15, color: colors.textSubtle, fontWeight: 600}}>
					{label}
				</div>
				<div style={{fontSize: 19, color: colors.text, fontWeight: 600}}>
					{value}
				</div>
			</div>
		</div>
	);
};
