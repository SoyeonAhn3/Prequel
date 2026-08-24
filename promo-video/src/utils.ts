export const typedText = (
	frame: number,
	text: string,
	startFrame: number,
	framesPerChar: number,
): string => {
	const elapsed = frame - startFrame;
	if (elapsed <= 0) return '';
	const chars = Math.floor(elapsed / framesPerChar);
	return text.slice(0, Math.min(chars, text.length));
};

export const clamp = (value: number, min: number, max: number): number =>
	Math.min(max, Math.max(min, value));
