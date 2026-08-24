import React from 'react';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';

export const LogoBadgeV2: React.FC<{size: number}> = ({size}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: size * 0.24,
			background: colorsV2.logoInk,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0,
		}}
	>
		<span
			style={{
				fontFamily,
				fontSize: size * 0.52,
				fontWeight: 800,
				color: '#ffffff',
			}}
		>
			P
		</span>
	</div>
);

export const WordmarkV2: React.FC<{fontSize: number; color?: string}> = ({
	fontSize,
	color = colorsV2.ink,
}) => (
	<span
		style={{
			fontFamily,
			fontSize,
			fontWeight: 800,
			color,
			letterSpacing: -0.5,
		}}
	>
		Prequel
	</span>
);
