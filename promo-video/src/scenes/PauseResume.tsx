import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';

export const PauseResume: React.FC = () => {
	const frame = useCurrentFrame();

	const line1Opacity = interpolate(frame, [0, 14], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const line2Opacity = interpolate(frame, [30, 46], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const badgeOpacity = interpolate(frame, [58, 72], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const badgeY = interpolate(frame, [58, 72], [10, 0], {
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
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
				<div
					style={{
						fontFamily,
						fontSize: 50,
						fontWeight: 700,
						color: colors.text,
						textAlign: 'center',
						lineHeight: 1.3,
						opacity: line1Opacity,
					}}
				>
					Close the tab anytime.
				</div>
				<div
					style={{
						fontFamily,
						fontSize: 50,
						fontWeight: 800,
						color: colors.accentDeep,
						textAlign: 'center',
						lineHeight: 1.3,
						opacity: line2Opacity,
					}}
				>
					Come back and pick up right where you left off.
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						opacity: badgeOpacity,
						transform: `translateY(${badgeY}px)`,
						marginTop: 8,
						background: colors.greenSoft,
						borderRadius: 999,
						padding: '10px 22px',
					}}
				>
					<div
						style={{
							width: 22,
							height: 22,
							borderRadius: '50%',
							background: colors.green,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
						}}
					>
						<svg width={12} height={12} viewBox="0 0 16 16" fill="none">
							<path
								d="M3 8.5L6.2 11.5L13 4.5"
								stroke={colors.surface}
								strokeWidth={2.4}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<div
						style={{
							fontFamily,
							fontSize: 22,
							fontWeight: 600,
							color: colors.green,
						}}
					>
						Auto-saved after every answer
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
