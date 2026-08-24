import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';
import {AppShellV2} from '../components/AppShellV2';
import {Breadcrumb} from '../components/Breadcrumb';
import {ChatBubbleV2, ExampleAnswersHint} from '../components/ChatBubbleV2';

export const InterviewHookV2: React.FC = () => {
	const frame = useCurrentFrame();

	const bottomCaptionOpacity = interpolate(frame, [130, 145], [0, 1], {
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
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						padding: '32px 56px',
					}}
				>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22, width: 920}}>
						<Breadcrumb step="STEP 02" label="Main users" />
						<ChatBubbleV2
							role="ai"
							text="Who will be using this day to day?"
							startFrame={14}
							framesPerChar={2.2}
						/>
						<ChatBubbleV2
							role="user"
							text="All employees, company-wide."
							startFrame={100}
							maxWidth={620}
						/>
						<ExampleAnswersHint
							startFrame={120}
							bullets={[
								'Onboarding: mainly used during new-hire onboarding',
								'Daily use: quick policy checks throughout the day',
								'Payroll season: spikes around year-end settlement',
							]}
							width={700}
						/>
					</div>
					<div
						style={{
							fontFamily,
							fontSize: 18,
							fontWeight: 600,
							color: colorsV2.inkMuted,
							opacity: bottomCaptionOpacity,
						}}
					>
						It interviews you — one focused question at a time.
					</div>
				</div>
			</AppShellV2>
		</AbsoluteFill>
	);
};
