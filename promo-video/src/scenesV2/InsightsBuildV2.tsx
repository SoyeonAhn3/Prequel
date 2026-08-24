import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';
import {typedText} from '../utils';
import {AppShellV2} from '../components/AppShellV2';
import {Breadcrumb} from '../components/Breadcrumb';
import {ChatBubbleV2, ExampleAnswersHint} from '../components/ChatBubbleV2';
import {StepList} from '../components/StepList';
import {CollectedPanel} from '../components/CollectedPanel';
import {LogoBadgeV2} from '../components/LogoV2';

// The distinctive real-product moment: a 3-column working screen —
// step list, live chat, and the info panel that fills in as you answer.

const Tag: React.FC<{children: React.ReactNode}> = ({children}) => (
	<span
		style={{
			fontFamily,
			fontSize: 11,
			fontWeight: 700,
			color: colorsV2.inkMuted,
			background: colorsV2.surfaceAlt,
			border: `1px solid ${colorsV2.border}`,
			borderRadius: 6,
			padding: '3px 8px',
		}}
	>
		{children}
	</span>
);

const LeftColumn: React.FC<{width: number}> = ({width}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div style={{width, display: 'flex', flexDirection: 'column', gap: 16}}>
			<div
				style={{
					opacity,
					display: 'flex',
					flexDirection: 'column',
					gap: 10,
					paddingBottom: 14,
					borderBottom: `1px solid ${colorsV2.border}`,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
					<LogoBadgeV2 size={26} />
					<div>
						<div style={{fontFamily, fontSize: 13, fontWeight: 700, color: colorsV2.ink}}>
							Prequel
						</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 5}}>
							<div style={{width: 6, height: 6, borderRadius: '50%', background: colorsV2.brand}} />
							<span style={{fontFamily, fontSize: 11, fontWeight: 600, color: colorsV2.inkMuted}}>
								Interview in progress
							</span>
						</div>
					</div>
				</div>
				<div style={{fontFamily, fontSize: 14, fontWeight: 700, color: colorsV2.ink, lineHeight: 1.3}}>
					Internal Policy Finder Bot
				</div>
				<div style={{display: 'flex', gap: 6}}>
					<Tag>AI/ML</Tag>
					<Tag>en</Tag>
				</div>
			</div>
			<div style={{opacity}}>
				<div
					style={{
						fontFamily,
						fontSize: 11,
						fontWeight: 700,
						color: colorsV2.inkSubtle,
						textTransform: 'uppercase',
						letterSpacing: 0.5,
					}}
				>
					Phase 1 of 3
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'baseline',
						gap: 6,
						marginTop: 6,
					}}
				>
					<span style={{fontFamily, fontSize: 22, fontWeight: 800, color: colorsV2.ink}}>
						2/11
					</span>
					<span style={{fontFamily, fontSize: 12, fontWeight: 600, color: colorsV2.inkMuted}}>
						Planning interview
					</span>
				</div>
				<div style={{fontFamily, fontSize: 11, fontWeight: 600, color: colorsV2.inkSubtle, marginTop: 2}}>
					~18 min left
				</div>
			</div>
			<StepList activeIndex={1} doneCount={1} width={width} startFrame={26} />
		</div>
	);
};

const MetaRow: React.FC<{startFrame: number}> = ({startFrame}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div style={{opacity, fontFamily, fontSize: 13, fontWeight: 600, color: colorsV2.inkSubtle}}>
			Avg. 1 min · Answer → 1 insight extracted
		</div>
	);
};

const ButtonsRow: React.FC<{startFrame: number}> = ({startFrame}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const translateY = interpolate(frame - startFrame, [0, 10], [10, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const buttons: [string, 'primary' | 'ghost' | 'dark'][] = [
		['Get AI suggestion', 'primary'],
		['Skip', 'ghost'],
		['Ask again', 'ghost'],
		['Next step', 'dark'],
	];
	return (
		<div style={{opacity, transform: `translateY(${translateY}px)`, display: 'flex', gap: 10}}>
			{buttons.map(([label, tone]) => (
				<div
					key={label}
					style={{
						fontFamily,
						fontSize: 13,
						fontWeight: 700,
						borderRadius: 9,
						padding: '9px 16px',
						color: tone === 'ghost' ? colorsV2.inkMuted : '#ffffff',
						background:
							tone === 'primary' ? colorsV2.brand : tone === 'dark' ? colorsV2.logoInk : colorsV2.surface,
						border: tone === 'ghost' ? `1px solid ${colorsV2.border}` : 'none',
					}}
				>
					{label}
				</div>
			))}
		</div>
	);
};

const QuestionCard: React.FC<{startFrame: number; width: number}> = ({
	startFrame,
	width,
}) => {
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
	const translateY = interpolate(entrance, [0, 1], [20, 0]);

	const tabs = ['Topic', 'Main users', 'Usage frequency', 'Usage context'];
	const questionText =
		"Got it — about 200 employees company-wide. When and how often will they use this?";
	const typedStart = startFrame + 14;
	const framesPerChar = 0.95;
	const shown = typedText(frame, questionText, typedStart, framesPerChar);
	const isTyping = shown.length > 0 && shown.length < questionText.length;
	const bulletsStart = typedStart + questionText.length * framesPerChar + 8;
	const metaStart = bulletsStart + 50;

	return (
		<div
			style={{
				width,
				opacity,
				transform: `translateY(${translateY}px)`,
				background: colorsV2.surface,
				border: `1px solid ${colorsV2.border}`,
				borderRadius: 18,
				padding: '22px 26px',
				boxShadow: '0 10px 30px rgba(20,22,40,0.06)',
				display: 'flex',
				flexDirection: 'column',
				gap: 16,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
				<div style={{display: 'flex', gap: 6}}>
					{tabs.map((t, i) => (
						<span
							key={t}
							style={{
								fontFamily,
								fontSize: 12,
								fontWeight: 700,
								color: i === 1 ? colorsV2.brandDeep : colorsV2.inkSubtle,
								background: i === 1 ? colorsV2.brandSoft : 'transparent',
								borderRadius: 7,
								padding: '5px 10px',
							}}
						>
							{t}
						</span>
					))}
				</div>
				<span
					style={{
						fontFamily,
						fontSize: 11,
						fontWeight: 700,
						color: colorsV2.inkMuted,
						background: colorsV2.surfaceAlt,
						borderRadius: 6,
						padding: '4px 9px',
					}}
				>
					High priority
				</span>
			</div>
			<div style={{fontFamily, fontSize: 21, fontWeight: 600, color: colorsV2.ink, lineHeight: 1.4}}>
				{shown}
				{isTyping ? <span style={{opacity: frame % 20 < 10 ? 1 : 0}}>|</span> : null}
			</div>
			<ExampleAnswersHint
				startFrame={bulletsStart}
				width={width - 52}
				bullets={[
					'Everyday use: whenever a policy question comes up',
					'Peak season: heavy use during onboarding or year-end',
					'Mixed: light daily use, spikes around HR events',
				]}
			/>
			<MetaRow startFrame={metaStart} />
			<ButtonsRow startFrame={metaStart + 16} />
		</div>
	);
};

export const InsightsBuildV2: React.FC = () => {
	const leftWidth = 230;
	const rightWidth = 280;
	const shellWidth = 1760;
	const shellHeight = 920;

	const items = [
		{label: 'Detected type', value: 'AI/ML', startFrame: 30},
		{label: 'Project name', value: 'Internal Policy Finder Bot', startFrame: 55},
		{
			label: 'Core summary',
			value: 'AI chatbot that finds company policy info and answers with links',
			startFrame: 80,
		},
		{label: 'Main user group', value: 'All employees (company-wide)', startFrame: 105},
		{label: 'User scale', value: '~200 people', startFrame: 132, isNew: true},
	];

	return (
		<AbsoluteFill
			style={{background: colorsV2.bg, alignItems: 'center', justifyContent: 'center'}}
		>
			<AppShellV2 width={shellWidth} height={shellHeight} projectTitle="Internal Policy Finder Bot">
				<div
					style={{
						height: '100%',
						padding: '28px 40px',
						display: 'flex',
						flexDirection: 'column',
						gap: 18,
					}}
				>
					<Breadcrumb step="STEP 02" label="Main users · Question 5" />
					<div style={{flex: 1, minHeight: 0, display: 'flex', gap: 28}}>
						<LeftColumn width={leftWidth} />
						<div
							style={{
								flex: 1,
								minWidth: 0,
								display: 'flex',
								flexDirection: 'column',
								gap: 18,
								paddingLeft: 28,
								paddingRight: 28,
								borderLeft: `1px solid ${colorsV2.border}`,
								borderRight: `1px solid ${colorsV2.border}`,
							}}
						>
							<ChatBubbleV2
								role="ai"
								text="So it's for all employees! About how many people?"
								startFrame={10}
								framesPerChar={1.3}
								fontSize={17}
								maxWidth={620}
							/>
							<ChatBubbleV2
								role="user"
								text="About 200 people."
								startFrame={80}
								fontSize={17}
								maxWidth={420}
							/>
							<QuestionCard startFrame={108} width={700} />
						</div>
						<div style={{width: rightWidth, display: 'flex', flexDirection: 'column', gap: 14}}>
							<CollectedPanel width={rightWidth} startFrame={20} filled={6} items={items} />
							<AutoSaveFooter startFrame={160} />
						</div>
					</div>
				</div>
			</AppShellV2>
		</AbsoluteFill>
	);
};

const AutoSaveFooter: React.FC<{startFrame: number}> = ({startFrame}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				opacity,
				marginTop: 4,
				display: 'flex',
				flexDirection: 'column',
				gap: 4,
				borderTop: `1px solid ${colorsV2.border}`,
				paddingTop: 12,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 6}}>
				<div style={{width: 6, height: 6, borderRadius: '50%', background: colorsV2.green}} />
				<span style={{fontFamily, fontSize: 12, fontWeight: 700, color: colorsV2.green}}>
					Auto-saved · just now
				</span>
			</div>
			<span style={{fontFamily, fontSize: 11, fontWeight: 500, color: colorsV2.inkSubtle}}>
				Safe even if you close the browser
			</span>
		</div>
	);
};
