import React from 'react';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';

export const Breadcrumb: React.FC<{step: string; label: string}> = ({
	step,
	label,
}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
		<div
			style={{
				fontFamily,
				fontSize: 12,
				fontWeight: 700,
				letterSpacing: 0.5,
				color: colorsV2.brand,
				background: colorsV2.brandSoft,
				borderRadius: 6,
				padding: '4px 9px',
			}}
		>
			{step}
		</div>
		<div
			style={{
				fontFamily,
				fontSize: 15,
				fontWeight: 600,
				color: colorsV2.inkMuted,
			}}
		>
			{label}
		</div>
	</div>
);
