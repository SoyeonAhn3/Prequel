import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';

const InfoCard: React.FC<{
	label: string;
	value: string;
	startFrame: number;
	isNew?: boolean;
}> = ({label, value, startFrame, isNew}) => {
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
	const translateY = interpolate(entrance, [0, 1], [14, 0]);

	return (
		<div
			style={{
				opacity,
				transform: `translateY(${translateY}px)`,
				background: colorsV2.surface,
				border: `1px solid ${isNew ? colorsV2.brand : colorsV2.border}`,
				borderRadius: 12,
				padding: '10px 14px',
				position: 'relative',
			}}
		>
			<div
				style={{
					fontFamily,
					fontSize: 11,
					fontWeight: 700,
					color: colorsV2.inkSubtle,
					textTransform: 'uppercase',
					letterSpacing: 0.4,
				}}
			>
				{label}
			</div>
			<div
				style={{
					fontFamily,
					fontSize: 15,
					fontWeight: 700,
					color: colorsV2.ink,
					marginTop: 3,
				}}
			>
				{value}
			</div>
			{isNew ? (
				<div
					style={{
						position: 'absolute',
						top: 10,
						right: 10,
						fontFamily,
						fontSize: 10,
						fontWeight: 800,
						color: colorsV2.brand,
						background: colorsV2.brandSoft,
						borderRadius: 5,
						padding: '2px 6px',
					}}
				>
					NEW
				</div>
			) : null}
		</div>
	);
};

export const CollectedPanel: React.FC<{
	width: number;
	startFrame: number;
	filled: number;
	total?: number;
	items: {label: string; value: string; startFrame: number; isNew?: boolean}[];
}> = ({width, startFrame, filled, total = 11, items}) => {
	const frame = useCurrentFrame();
	const headerOpacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div style={{width, display: 'flex', flexDirection: 'column', gap: 10}}>
			<div
				style={{
					opacity: headerOpacity,
					display: 'flex',
					alignItems: 'baseline',
					justifyContent: 'space-between',
				}}
			>
				<span style={{fontFamily, fontSize: 14, fontWeight: 700, color: colorsV2.ink}}>
					Collected info
				</span>
				<span style={{fontFamily, fontSize: 13, fontWeight: 700, color: colorsV2.brand}}>
					{filled}/{total}
				</span>
			</div>
			{items.map((item) => (
				<InfoCard
					key={item.label}
					label={item.label}
					value={item.value}
					startFrame={item.startFrame}
					isNew={item.isNew}
				/>
			))}
		</div>
	);
};
