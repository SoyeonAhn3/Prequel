import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';
import {AppShellV2} from '../components/AppShellV2';
import {Breadcrumb} from '../components/Breadcrumb';

const TYPES = ['Web App', 'Mobile App', 'AI/ML', 'Data Pipeline', 'API/Backend', 'DevOps/Infra', 'Other'];
const DETECTED = 'AI/ML';
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
					background: detectOn ? colorsV2.brandSoft : colorsV2.surface,
					border: `2px solid ${detectOn ? colorsV2.brand : colorsV2.border}`,
					color: detectOn ? colorsV2.brandDeep : colorsV2.ink,
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
						background: colorsV2.green,
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
							stroke={colorsV2.surface}
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

const DetectionBanner: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const resolvedOpacity = interpolate(frame - DETECT_FRAME, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const label = frame >= DETECT_FRAME ? DETECTED : '—';

	return (
		<div
			style={{
				opacity,
				display: 'flex',
				alignItems: 'center',
				gap: 14,
				background: colorsV2.surface,
				border: `1px solid ${colorsV2.border}`,
				borderRadius: 12,
				padding: '10px 18px',
			}}
		>
			<span style={{fontFamily, fontSize: 15, fontWeight: 600, color: colorsV2.inkMuted}}>
				Detected project type:
			</span>
			<span style={{fontFamily, fontSize: 15, fontWeight: 800, color: colorsV2.brandDeep}}>
				{label}
			</span>
			<div style={{flex: 1}} />
			<div
				style={{
					opacity: resolvedOpacity,
					display: 'flex',
					gap: 8,
				}}
			>
				<div
					style={{
						fontFamily,
						fontSize: 13,
						fontWeight: 700,
						color: '#ffffff',
						background: colorsV2.brand,
						borderRadius: 8,
						padding: '7px 14px',
					}}
				>
					Confirm
				</div>
				<div
					style={{
						fontFamily,
						fontSize: 13,
						fontWeight: 700,
						color: colorsV2.inkMuted,
						background: colorsV2.surface,
						border: `1px solid ${colorsV2.border}`,
						borderRadius: 8,
						padding: '7px 14px',
					}}
				>
					Edit
				</div>
			</div>
		</div>
	);
};

export const TypeDetectionV2: React.FC = () => {
	const frame = useCurrentFrame();

	const captionOpacity = interpolate(frame, [80, 95], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{background: colorsV2.bg, alignItems: 'center', justifyContent: 'center'}}
		>
			<AppShellV2 width={1360} height={760} projectTitle="Internal Policy Finder Bot">
				<div
					style={{
						height: '100%',
						padding: '32px 56px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}
				>
					<div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
						<DetectionBanner />
						<div style={{display: 'flex', flexWrap: 'wrap', gap: 16, maxWidth: 1100}}>
							{TYPES.map((label, i) => (
								<TypeChip key={label} label={label} startFrame={10 + i * 4} />
							))}
						</div>
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
						<div
							style={{
								fontFamily,
								fontSize: 18,
								fontWeight: 600,
								color: colorsV2.inkMuted,
								opacity: captionOpacity,
							}}
						>
							It figures out what you&apos;re building.
						</div>
						<Breadcrumb step="STEP 01" label="Detecting project type" />
					</div>
				</div>
			</AppShellV2>
		</AbsoluteFill>
	);
};
