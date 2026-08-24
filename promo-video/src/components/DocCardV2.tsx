import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';

const CardShell: React.FC<{
	startFrame: number;
	width: number;
	children: React.ReactNode;
}> = ({startFrame, width, children}) => {
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
	const translateY = interpolate(entrance, [0, 1], [26, 0]);

	return (
		<div
			style={{
				width,
				opacity,
				transform: `translateY(${translateY}px)`,
				background: colorsV2.surface,
				border: `1px solid ${colorsV2.border}`,
				borderRadius: 18,
				padding: 22,
				boxShadow: '0 10px 30px rgba(20,22,40,0.06)',
			}}
		>
			{children}
		</div>
	);
};

const CardLabel: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div
		style={{
			fontFamily,
			fontSize: 13,
			fontWeight: 700,
			color: colorsV2.inkSubtle,
			marginBottom: 12,
			textTransform: 'uppercase',
			letterSpacing: 0.6,
		}}
	>
		{children}
	</div>
);

export const StatStripCardV2: React.FC<{startFrame: number; width: number}> = ({
	startFrame,
	width,
}) => {
	const stats: [string, string][] = [
		['Type', 'AI Chatbot'],
		['Questions', '11 steps'],
		['Users', 'All employees'],
	];
	return (
		<CardShell startFrame={startFrame} width={width}>
			<div style={{display: 'flex', gap: 28}}>
				{stats.map(([label, value]) => (
					<div key={label} style={{fontFamily}}>
						<div
							style={{
								fontSize: 13,
								fontWeight: 600,
								color: colorsV2.inkSubtle,
								textTransform: 'uppercase',
								letterSpacing: 0.5,
							}}
						>
							{label}
						</div>
						<div style={{fontSize: 23, fontWeight: 700, color: colorsV2.ink}}>
							{value}
						</div>
					</div>
				))}
			</div>
		</CardShell>
	);
};

type MeterTone = 'green' | 'amber';
const METER_TONE: Record<MeterTone, {bar: string; fg: string; dot: string}> = {
	green: {bar: colorsV2.green, fg: colorsV2.green, dot: colorsV2.green},
	amber: {bar: colorsV2.amber, fg: colorsV2.amber, dot: colorsV2.amber},
};

const MeterLine: React.FC<{
	label: string;
	score: number;
	tone: MeterTone;
	rowStartFrame: number;
}> = ({label, score, tone, rowStartFrame}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = METER_TONE[tone];

	const rowOpacity = interpolate(frame - rowStartFrame, [0, 8], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fill = spring({
		frame: frame - rowStartFrame - 4,
		fps,
		config: {damping: 200},
		durationInFrames: 24,
	});

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				opacity: rowOpacity,
				padding: '8px 0',
				borderBottom: `1px solid ${colorsV2.border}`,
			}}
		>
			<div style={{width: 7, height: 7, borderRadius: '50%', background: t.dot, flexShrink: 0}} />
			<div
				style={{
					fontFamily,
					fontSize: 15,
					fontWeight: 600,
					color: colorsV2.ink,
					width: 132,
					flexShrink: 0,
				}}
			>
				{label}
			</div>
			<div style={{flex: 1, height: 7, borderRadius: 4, background: colorsV2.surfaceAlt, overflow: 'hidden'}}>
				<div
					style={{
						height: '100%',
						borderRadius: 4,
						width: `${interpolate(fill, [0, 1], [0, (score / 10) * 100])}%`,
						background: t.bar,
					}}
				/>
			</div>
			<div
				style={{
					fontFamily: 'monospace',
					fontSize: 14,
					fontWeight: 700,
					color: t.fg,
					width: 44,
					textAlign: 'right',
					flexShrink: 0,
				}}
			>
				{score}/10
			</div>
		</div>
	);
};

export const EvalMeterCardV2: React.FC<{startFrame: number; width: number}> = ({
	startFrame,
	width,
}) => {
	const rows: [string, number, MeterTone][] = [
		['Differentiation', 7, 'amber'],
		['AI fit', 9, 'green'],
		['Market', 6, 'amber'],
		['Completeness', 8, 'green'],
	];
	return (
		<CardShell startFrame={startFrame} width={width}>
			<CardLabel>Honest evaluation</CardLabel>
			<div>
				{rows.map(([label, score, tone], i) => (
					<MeterLine
						key={label}
						label={label}
						score={score}
						tone={tone}
						rowStartFrame={startFrame + 10 + i * 8}
					/>
				))}
			</div>
		</CardShell>
	);
};

type PriorityTone = 'must' | 'should' | 'could';
const PRIORITY_TONE: Record<PriorityTone, {fg: string; bg: string}> = {
	must: {fg: colorsV2.red, bg: colorsV2.red + '1a'},
	should: {fg: colorsV2.brandDeep, bg: colorsV2.brandSoft},
	could: {fg: colorsV2.inkSubtle, bg: colorsV2.surfaceAlt},
};

export const SectionsTableCardV2: React.FC<{startFrame: number; width: number}> = ({
	startFrame,
	width,
}) => {
	const frame = useCurrentFrame();
	const rows: [string, PriorityTone][] = [
		['Target users', 'must'],
		['Success metrics', 'must'],
		['Data sources', 'should'],
		['Tech stack', 'should'],
		['Risks', 'could'],
	];
	return (
		<CardShell startFrame={startFrame} width={width}>
			<CardLabel>Covered sections</CardLabel>
			<div>
				{rows.map(([label, tone], i) => {
					const rowStart = startFrame + 10 + i * 6;
					const rowOpacity = interpolate(frame - rowStart, [0, 8], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					const t = PRIORITY_TONE[tone];
					return (
						<div
							key={label}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								opacity: rowOpacity,
								padding: '9px 0',
								borderBottom: `1px solid ${colorsV2.border}`,
							}}
						>
							<div style={{fontFamily, fontSize: 15, fontWeight: 600, color: colorsV2.ink}}>
								{label}
							</div>
							<div
								style={{
									fontFamily: 'monospace',
									fontSize: 11,
									fontWeight: 700,
									letterSpacing: 0.4,
									color: t.fg,
									background: t.bg,
									borderRadius: 6,
									padding: '3px 8px',
								}}
							>
								{tone.toUpperCase()}
							</div>
						</div>
					);
				})}
			</div>
		</CardShell>
	);
};

export const GapCalloutCardV2: React.FC<{startFrame: number; width: number}> = ({
	startFrame,
	width,
}) => {
	const frame = useCurrentFrame();
	const entrance = spring({
		frame: frame - startFrame,
		fps: 30,
		config: {damping: 18, mass: 0.6},
	});
	const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const translateY = interpolate(entrance, [0, 1], [18, 0]);

	return (
		<div
			style={{
				width,
				opacity,
				transform: `translateY(${translateY}px)`,
				background: colorsV2.amberSoft,
				borderRadius: 16,
				padding: '16px 22px',
				display: 'flex',
				alignItems: 'flex-start',
				gap: 14,
			}}
		>
			<div
				style={{
					fontFamily: 'monospace',
					fontSize: 11,
					fontWeight: 700,
					letterSpacing: 0.4,
					color: colorsV2.amber,
					background: colorsV2.surface,
					borderRadius: 6,
					padding: '4px 8px',
					flexShrink: 0,
					marginTop: 2,
				}}
			>
				GAP FOUND
			</div>
			<div style={{fontFamily, fontSize: 16, fontWeight: 500, color: colorsV2.ink, lineHeight: 1.4}}>
				Policy-exception approvals aren&apos;t handled yet — flagged before you build, not after.
			</div>
		</div>
	);
};
