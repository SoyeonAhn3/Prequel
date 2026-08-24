import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';
import {AppFrame} from '../components/AppFrame';
import {ProgressSteps} from '../components/ProgressSteps';

const TYPES = ['Web App', 'Mobile App', 'AI/ML', 'Data Pipeline', 'API/Backend', 'DevOps/Infra', 'Other'];
const DETECTED = 'Web App';
const DETECT_FRAME = 55;

const TypeChip: React.FC<{label: string; startFrame: number}> = ({label, startFrame}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const pop = spring({
		frame: frame - startFrame,
		fps,
		config: {damping: 16, mass: 0.5},
	});
	const scaleIn = interpolate(pop, [0, 1], [0.85, 1]);

	const isDetected = label === DETECTED;
	const detect = spring({
		frame: frame - DETECT_FRAME,
		fps,
		config: {damping: 16, mass: 0.5},
	});
	const detectScale = isDetected ? interpolate(detect, [0, 1], [1, 1.08]) : 1;
	const detectOn = isDetected && frame >= DETECT_FRAME;

	return (
		<div
			style={{
				position: 'relative',
				opacity,
				transform: `scale(${scaleIn * detectScale})`,
			}}
		>
			<div
				style={{
					fontFamily,
					fontSize: 26,
					fontWeight: 600,
					padding: '16px 28px',
					borderRadius: 999,
					background: detectOn ? colors.accentSoft : colors.surface,
					border: `2px solid ${detectOn ? colors.accentDeep : colors.border}`,
					color: detectOn ? colors.accentDeep : colors.text,
				}}
			>
				{label}
			</div>
			{isDetected ? (
				<div
					style={{
						position: 'absolute',
						top: -10,
						right: -10,
						width: 30,
						height: 30,
						borderRadius: '50%',
						background: colors.green,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						opacity: interpolate(frame - DETECT_FRAME - 6, [0, 8], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						transform: `scale(${interpolate(detect, [0, 1], [0.4, 1])})`,
					}}
				>
					<svg width={16} height={16} viewBox="0 0 16 16" fill="none">
						<path
							d="M3 8.5L6.2 11.5L13 4.5"
							stroke={colors.surface}
							strokeWidth={2.4}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			) : null}
		</div>
	);
};

export const TypeDetection: React.FC = () => {
	const frame = useCurrentFrame();

	const headingOpacity = interpolate(frame, [0, 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const captionOpacity = interpolate(frame, [30, 45], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const progress = interpolate(frame, [50, 105], [0, 1 / 11], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{background: colors.bg, alignItems: 'center', justifyContent: 'center'}}
		>
			<AppFrame title="Interview" width={1360} height={760}>
				<div
					style={{
						height: '100%',
						padding: '40px 56px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}
				>
					<div style={{display: 'flex', flexDirection: 'column', gap: 28}}>
						<div
							style={{
								fontFamily,
								fontSize: 24,
								fontWeight: 600,
								color: colors.textMuted,
								opacity: headingOpacity,
							}}
						>
							Detecting project type…
						</div>
						<div style={{display: 'flex', flexWrap: 'wrap', gap: 16, maxWidth: 1100}}>
							{TYPES.map((label, i) => (
								<TypeChip key={label} label={label} startFrame={10 + i * 4} />
							))}
						</div>
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
						<div
							style={{
								fontFamily,
								fontSize: 18,
								fontWeight: 600,
								color: colors.textMuted,
								opacity: captionOpacity,
							}}
						>
							It figures out what you&apos;re building.
						</div>
						<ProgressSteps progress={progress} width={1248} />
					</div>
				</div>
			</AppFrame>
		</AbsoluteFill>
	);
};
