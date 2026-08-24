import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';

export const PauseResumeV2: React.FC = () => {
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
				background: colorsV2.bg,
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
						color: colorsV2.ink,
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
						color: colorsV2.brand,
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
						background: colorsV2.greenSoft,
						borderRadius: 999,
						padding: '10px 22px',
					}}
				>
					<div
						style={{
							width: 22,
							height: 22,
							borderRadius: '50%',
							background: colorsV2.green,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
						}}
					>
						<svg width={12} height={12} viewBox="0 0 16 16" fill="none">
							<path
								d="M3 8.5L6.2 11.5L13 4.5"
								stroke={colorsV2.surface}
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
							color: colorsV2.green,
						}}
					>
						Auto-saved after every answer
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
