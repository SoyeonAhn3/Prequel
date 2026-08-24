import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';

const STEPS = [
	'Detect project type',
	'Main users',
	'Core value',
	'Data sources',
	'Tech stack',
	'Success metrics',
	'Risks',
	'Deep dive (1/3)',
	'Deep dive (2/3)',
	'Final review',
	'AI suggestions',
];

export const StepList: React.FC<{
	activeIndex: number;
	doneCount: number;
	width: number;
	startFrame: number;
}> = ({activeIndex, doneCount, width, startFrame}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame - startFrame, [0, 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div style={{width, opacity, display: 'flex', flexDirection: 'column', gap: 2}}>
			{STEPS.map((label, i) => {
				const done = i < doneCount;
				const active = i === activeIndex;
				return (
					<div
						key={label}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							padding: '7px 10px',
							borderRadius: 10,
							background: active ? colorsV2.brandSoft : 'transparent',
						}}
					>
						<div
							style={{
								width: 20,
								height: 20,
								borderRadius: '50%',
								flexShrink: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: done || active ? colorsV2.logoInk : colorsV2.surface,
								border: done || active ? 'none' : `1.5px solid ${colorsV2.borderStrong}`,
							}}
						>
							{done ? (
								<svg width={10} height={10} viewBox="0 0 16 16" fill="none">
									<path
										d="M3 8.5L6.2 11.5L13 4.5"
										stroke="#fff"
										strokeWidth={2.4}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							) : (
								<span
									style={{
										fontFamily,
										fontSize: 10,
										fontWeight: 700,
										color: active ? '#fff' : colorsV2.inkSubtle,
									}}
								>
									{i + 1}
								</span>
							)}
						</div>
						<span
							style={{
								fontFamily,
								fontSize: 13,
								fontWeight: active ? 700 : 600,
								color: active ? colorsV2.ink : done ? colorsV2.inkMuted : colorsV2.inkSubtle,
							}}
						>
							{label}
						</span>
					</div>
				);
			})}
		</div>
	);
};
