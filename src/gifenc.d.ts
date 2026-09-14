declare module "gifenc" {

	export interface GIFEncoderOptions {
		auto?: boolean;
		initialCapacity?: number;
	}

	export interface WriteFrameOptions {
		palette?: number[][];
		delay?: number;
		repeat?: number;
		transparent?: boolean;
		transparentIndex?: number;
		dispose?: number;
	}

	export interface GIFEncoderInstance {
		writeFrame(_index: Uint8Array, _width: number, _height: number, _options?: WriteFrameOptions): void;
		finish(): void;
		bytes(): Uint8Array;
		bytesView(): Uint8Array;
		reset(): void;
		stream: unknown;
	}

	export function GIFEncoder(_options?: GIFEncoderOptions): GIFEncoderInstance;

	export function quantize(
		_rgba: Uint8Array | Uint8ClampedArray,
		_maxColors: number,
		_options?: {
			format?: "rgb565" | "rgb444" | "rgba4444";
			oneBitAlpha?: boolean | number;
			clearAlpha?: boolean;
			clearAlphaThreshold?: number;
			clearAlphaColor?: number;
		},
	): number[][];

	export function applyPalette(
		_rgba: Uint8Array | Uint8ClampedArray,
		_palette: number[][],
		_format?: "rgb565" | "rgb444" | "rgba4444",
	): Uint8Array;

	const defaultExport: {
		GIFEncoder: typeof GIFEncoder;
		quantize: typeof quantize;
		applyPalette: typeof applyPalette;
	};
	export default defaultExport;
}

