import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

// Soft crossfade at the start/end of every scene so hard cuts don't flash.
export const SceneFade: React.FC<{
	durationInFrames: number;
	fadeFrames?: number;
	children: React.ReactNode;
}> = ({durationInFrames, fadeFrames = 8, children}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
