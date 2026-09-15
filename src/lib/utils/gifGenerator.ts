import { createBoardFromMoves } from "$lib/engine/helpers";
import type { BoardGrid, Move, PieceColor } from "$lib/engine/types";

// SVG path definitions from the component icons (all share viewBox 28 28 44 44, center 50,50)
const PIECE_PATHS: Record<string, string[]> = {
	p: [
		"M61.13,69.74h-11.13v.02h-11.13c-3.59-.01-6.01-3.69-4.59-6.99l6.07-14.12c-1.31-1.89-2.08-4.19-2.08-6.67,0-6.48,5.25-11.73,11.73-11.73s11.73,5.25,11.73,11.73c0,2.48-.77,4.78-2.08,6.67l6.07,14.12c1.42,3.3-1,6.97-4.59,6.97Z",
	],
	n: [
		"M67.6,54.17l-1.67,12.19c-.03.2-.07.39-.14.58-.74,1.93-2.59,3.21-4.67,3.21h-19.97c-1.52,0-2.92-.69-3.85-1.81-.68-.82-.78-1.97-.29-2.91l.46-.89c.48-.94,1.21-1.74,2.1-2.31l9.31-5.97c.78-.5,1.24-1.36,1.24-2.28h0c-.01-1.9-1.95-3.19-3.71-2.46l-8.2,3.4c-1.15.48-2.48.1-3.2-.91l-2.38-3.3c-.63-.88-.68-2.05-.11-2.97l9.03-14.72c.09-.15.2-.3.33-.43l1.78-1.91c.5-.54,1.21-.85,1.95-.85l8.69-.05c1.56,0,3.08.44,4.39,1.29l1.17.76c3.3,2.14,5.7,5.42,6.74,9.22l.21.76c1.1,4.02,1.37,8.23.81,12.36Z",
	],
	b: [
		"M66.87,49.47l-.13-.12-3.51-2.94c-.7-.59-1.71-.62-2.45-.09l-6.42,4.62c-1.29.93-2.89-.67-1.96-1.96l4.14-5.76c.61-.85.46-2.03-.34-2.7l-.64-.54c-.5-.42-.69-1.13-.39-1.72.4-.79.63-1.68.63-2.63,0-3.2-2.6-5.8-5.81-5.8s-5.81,2.6-5.81,5.8c0,.95.23,1.84.63,2.63.3.58.11,1.3-.39,1.72l-11.18,9.36-.13.12c-1.83,1.86-2.88,4.03-2.88,6.38,0,5.2,5.18,9.64,12.49,11.44.64.16,1.1.84,1.14,1.5.04.76.67,1.37,1.45,1.37h9.34c.82,0,1.42-.68,1.45-1.51.03-.65.49-1.2,1.13-1.36,7.32-1.8,12.5-6.24,12.5-11.44,0-2.34-1.05-4.52-2.88-6.38Z",
	],
	r: [
		"M61.39,69.74h-11.39s-11.39,0-11.39,0c-3.52,0-5.94-3.54-4.65-6.82l5.93-15.11c.51-1.31-.45-2.73-1.86-2.73h-2.42c-1.1,0-2-.9-2-2v-10.84c0-1.1.9-2,2-2h2.46c1.1,0,2,.9,2,2v3.42c0,1.1.9,2,2,2h2.7c1.1,0,2-.9,2-2v-3.42c0-1.1.9-2,2-2h2.46c1.1,0,2,.9,2,2v3.42c0,1.1.9,2,2,2h2.7c1.1,0,2-.9,2-2v-3.42c0-1.1.9-2,2-2h2.46c1.1,0,2,.9,2,2v10.84c0,1.1-.9,2-2,2h-2.42c-1.41,0-2.38,1.42-1.86,2.73l5.93,15.1c1.29,3.28-1.13,6.83-4.65,6.83Z",
	],
	q: [
		"M69.63,50.83l-4.87,15.43c-.61,1.92-2.75,3.49-4.77,3.49h-19.97c-2.02,0-4.16-1.57-4.77-3.49l-4.87-15.43c-4.23-13.38,1.32-17.2,12.32-8.5l2.45,1.94c2.67,2.11,7.04,2.11,9.72,0l2.45-1.94c11-8.71,16.55-4.88,12.32,8.5Z",
	],
	k: [
		"M69.63,51.23l-4.87,15.43c-.66,2.08-2.59,3.49-4.77,3.49h-19.97c-2.18,0-4.11-1.41-4.77-3.49l-4.87-15.43c-2.32-7.36,6.27-13.28,12.32-8.5l2.45,1.94c2.85,2.25,6.87,2.25,9.72,0l2.45-1.94c6.05-4.79,14.65,1.14,12.32,8.5Z",
		"M56.92,35.11v3.31c0,.57-.46,1.02-1.02,1.02h-2.19c-.57,0-1.02.46-1.02,1.02v2.18c0,.57-.46,1.02-1.02,1.02h-3.3c-.57,0-1.02-.46-1.02-1.02v-2.18c0-.57-.46-1.02-1.02-1.02h-2.19c-.57,0-1.02-.46-1.02-1.02v-3.31c0-.57.46-1.02,1.02-1.02h2.19c.57,0,1.02-.46,1.02-1.02v-2.19c0-.57.46-1.02,1.02-1.02h3.3c.57,0,1.02.46,1.02,1.02v2.19c0,.57.46,1.02,1.02,1.02h2.19c.57,0,1.02.46,1.02,1.02Z",
	],
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = src;
	});
}

export interface GifGeneratorOptions {
	isFlipped?: boolean;
	stepDelayMs?: number;
	finalDelayMs?: number;
	winner?: PieceColor | "draw" | null;
	logoUrl?: string;
}

export async function generateReplayGif(
	initialBoard: BoardGrid,
	moves: Move[],
	options: GifGeneratorOptions = {},
): Promise<Blob> {
	const {
		isFlipped = false,
		stepDelayMs = 800,
		finalDelayMs = 2500,
		winner = null,
		logoUrl = "/images/og-image.jpg",
	} = options;

	const canvasWidth = 560;
	const canvasHeight = 660;
	const boardSize = 300;
	const squareSize = boardSize / 5; // 60px

	const cardPadding = 24;
	const cardWidth = boardSize + cardPadding * 2; // 348px
	const cardHeight = boardSize + cardPadding * 2; // 348px
	const cardRadius = 24;
	const cardX = (canvasWidth - cardWidth) / 2; // 106px (perfect horizontal center)
	const cardY = (canvasHeight - cardHeight) / 2; // 156px (perfect vertical center)
	const boardX = cardX + cardPadding; // 130px
	const boardY = cardY + cardPadding; // 180px

	const canvas = document.createElement("canvas");
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	const rawCtx = canvas.getContext("2d", { willReadFrequently: true });
	if (!rawCtx) throw new Error("Could not create 2D canvas context");
	const ctx: CanvasRenderingContext2D = rawCtx;

	// Cache Path2D objects
	const pathCache: Record<string, Path2D[]> = {};
	for (const [key, paths] of Object.entries(PIECE_PATHS)) {
		pathCache[key] = paths.map((p) => new Path2D(p));
	}

	const squirclePath = new Path2D(
		"M0,50 C0,10 10,0 50,0 C90,0 100,10 100,50 C100,90 90,100 50,100 C10,100 0,90 0,50 Z",
	);

	const bannerImg = logoUrl ? await loadImage(logoUrl) : null;

	const gifenc = await import("gifenc");
	const GIFEncoder =
		gifenc.GIFEncoder ??
		(gifenc as unknown as { default: { GIFEncoder?: typeof gifenc.GIFEncoder } }).default?.GIFEncoder ??
		(gifenc as unknown as { default: typeof gifenc.GIFEncoder }).default;
	const quantize =
		gifenc.quantize ??
		(gifenc as unknown as { default: { quantize?: typeof gifenc.quantize } }).default?.quantize;
	const applyPalette =
		gifenc.applyPalette ??
		(gifenc as unknown as { default: { applyPalette?: typeof gifenc.applyPalette } }).default?.applyPalette;

	if (!GIFEncoder || !quantize || !applyPalette) {
		throw new Error("Failed to load gifenc module");
	}

	const gif = GIFEncoder();

	const rowIndices = isFlipped ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
	const colIndices = isFlipped ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];

	// Cubic-bezier solver for (0.2, 0.7, 0.6, 0.75) easing
	function solveCubicBezier(x1: number, y1: number, x2: number, y2: number) {
		return function (t: number): number {
			if (t <= 0) return 0;
			if (t >= 1) return 1;
			let u = t;
			for (let i = 0; i < 6; i++) {
				const currentX = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
				const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
				if (Math.abs(dx) < 1e-6) break;
				u -= (currentX - t) / dx;
				u = Math.max(0, Math.min(1, u));
			}
			return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
		};
	}
	const easeSlam = solveCubicBezier(0.2, 0.7, 0.6, 0.75);

	function getSquareCanvasCenter(r: number, c: number) {
		const visualCol = isFlipped ? 4 - c : c;
		const visualRow = isFlipped ? 4 - r : r;
		return {
			x: boardX + visualCol * squareSize + squareSize / 2,
			y: boardY + visualRow * squareSize + squareSize / 2,
		};
	}

	function recordFrame(delayMs: number) {
		const { data, width, height } = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
		const palette = quantize(data, 256);
		const index = applyPalette(data, palette);
		gif.writeFrame(index, width, height, { palette, delay: delayMs });
	}

	function drawPiece(
		piece: { type: string; color: string },
		centerX: number,
		centerY: number,
		options: {
			rotationRad?: number;
			alpha?: number;
		} = {},
	) {
		const { rotationRad = 0, alpha = 1 } = options;
		ctx.save();
		ctx.translate(centerX, centerY);
		if (rotationRad !== 0) ctx.rotate(rotationRad);
		if (alpha < 1) ctx.globalAlpha = alpha;

		const scale = (squareSize * 0.72) / 44;
		ctx.scale(scale, scale);
		ctx.translate(-50, -50);

		ctx.fillStyle = piece.color === "white" ? "#919191" : "#18181b";
		const paths = pathCache[piece.type];
		if (paths) {
			for (const p of paths) ctx.fill(p);
		}
		if (piece.type === "q") {
			ctx.beginPath();
			ctx.arc(50, 36.36, 6.12, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	}

	function renderBoardBase(highlightSquares: Array<{ row: number; col: number }>) {
		// 1. Background
		ctx.fillStyle = "#f4f4f6";
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		// 2. White board card
		ctx.fillStyle = "#ffffff";
		if (ctx.roundRect) {
			ctx.beginPath();
			ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
			ctx.fill();
		} else {
			ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
		}

		// 3. Squares & Dots
		for (let visualRow = 0; visualRow < 5; visualRow++) {
			for (let visualCol = 0; visualCol < 5; visualCol++) {
				const r = rowIndices[visualRow];
				const c = colIndices[visualCol];

				const sqX = boardX + visualCol * squareSize;
				const sqY = boardY + visualRow * squareSize;
				const isDark = (r + c) % 2 === 0;

				ctx.save();
				ctx.translate(sqX, sqY);
				ctx.scale(squareSize / 100, squareSize / 100);
				ctx.fillStyle = isDark ? "#e5e5e5" : "#fafafa";
				ctx.fill(squirclePath);
				ctx.restore();

				const isHighlighted = highlightSquares.some((sq) => sq.row === r && sq.col === c);
				if (isHighlighted) {
					const centerX = sqX + squareSize / 2;
					const centerY = sqY + squareSize / 2;
					ctx.beginPath();
					ctx.arc(centerX, centerY, 4.5, 0, Math.PI * 2);
					ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
					ctx.fill();
				}
			}
		}

		// 4. Logo Banner
		if (bannerImg) {
			const sx = 60,
				sy = 215,
				sw = 1080,
				sh = 185;
			const targetHeight = 44;
			const targetWidth = targetHeight * (sw / sh);
			const logoX = (canvasWidth - targetWidth) / 2;
			const logoY = (cardY - targetHeight) / 2;
			ctx.drawImage(bannerImg, sx, sy, sw, sh, logoX, logoY, targetWidth, targetHeight);
		}

		// 5. Footer URL text
		ctx.font = '500 13px "Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		ctx.textBaseline = "alphabetic";
		ctx.textAlign = "left";
		const prefixText = "Come compete at ";
		const siteUrl = "minichess.co";
		const prefixWidth = ctx.measureText(prefixText).width;
		const siteUrlWidth = ctx.measureText(siteUrl).width;
		const totalTextWidth = prefixWidth + siteUrlWidth;
		const textStartX = (canvasWidth - totalTextWidth) / 2;
		const textY = cardY + cardHeight + 68;

		ctx.fillStyle = "#71717a";
		ctx.fillText(prefixText, textStartX, textY);
		const linkX = textStartX + prefixWidth;
		ctx.fillStyle = "#18181b";
		ctx.fillText(siteUrl, linkX, textY);
		ctx.beginPath();
		ctx.strokeStyle = "#18181b";
		ctx.lineWidth = 1.2;
		ctx.moveTo(linkX, textY + 3.5);
		ctx.lineTo(linkX + siteUrlWidth, textY + 3.5);
		ctx.stroke();
	}

	function renderStaticPieces(
		board: BoardGrid,
		excludePos: { row: number; col: number } | null = null,
		isGameOver = false,
	) {
		for (let visualRow = 0; visualRow < 5; visualRow++) {
			for (let visualCol = 0; visualCol < 5; visualCol++) {
				const r = rowIndices[visualRow];
				const c = colIndices[visualCol];
				if (excludePos && excludePos.row === r && excludePos.col === c) continue;

				const piece = board[r]?.[c];
				if (!piece) continue;

				const isDeadKing =
					isGameOver && piece.type === "k" && winner && winner !== "draw" && piece.color !== winner;

				const pos = getSquareCanvasCenter(r, c);
				drawPiece(piece, pos.x, pos.y, {
					rotationRad: isDeadKing ? (-25 * Math.PI) / 180 : 0,
					alpha: isDeadKing ? 0.75 : 1,
				});
			}
		}
	}

	// If no moves, render initial board for finalDelayMs
	if (moves.length === 0) {
		renderBoardBase([]);
		renderStaticPieces(initialBoard, null, true);
		recordFrame(finalDelayMs);
		gif.finish();
		const bytes = gif.bytes();
		return new Blob([bytes as unknown as BlobPart], { type: "image/gif" });
	}

	// 1. Initial Opening Board Position (500ms pause)
	renderBoardBase([]);
	renderStaticPieces(initialBoard, null, false);
	recordFrame(500);

	// 2. Play through moves
	for (let m = 0; m < moves.length; m++) {
		const move = moves[m];
		const isLastMoveOfGame = m === moves.length - 1;
		const boardBefore = createBoardFromMoves(initialBoard, moves.slice(0, m));
		const boardAfter = createBoardFromMoves(initialBoard, moves.slice(0, m + 1));
		const movingPiece = boardBefore[move.from.row]?.[move.from.col];
		const targetPiece = boardBefore[move.to.row]?.[move.to.col];

		if (!movingPiece) {
			renderBoardBase([move.from, move.to]);
			renderStaticPieces(boardAfter, null, isLastMoveOfGame);
			recordFrame(isLastMoveOfGame ? finalDelayMs : stepDelayMs);
			continue;
		}

		const fromPos = getSquareCanvasCenter(move.from.row, move.from.col);
		const toPos = getSquareCanvasCenter(move.to.row, move.to.col);

		const dx = toPos.x - fromPos.x;
		const dy = toPos.y - fromPos.y;
		const dist = Math.hypot(dx, dy);
		const nx = dist > 0 ? -dy / dist : 0;
		const ny = dist > 0 ? dx / dist : 0;
		const mx = (fromPos.x + toPos.x) / 2;
		const my = (fromPos.y + toPos.y) / 2;
		const h = Math.min(50, Math.max(22, dist * 0.22));

		const boardCenterX = boardX + 2.5 * squareSize;
		const boardCenterY = boardY + 2.5 * squareSize;
		const dot = nx * (boardCenterX - mx) + ny * (boardCenterY - my);
		const sign = Math.abs(dot) > 10 ? (dot > 0 ? 1 : -1) : 1;

		const pcX = mx + nx * h * sign;
		const pcY = my + ny * h * sign;

		// 9 Flight Transit Frames (30ms each = 270ms flight at ~33.3 FPS)
		const flightSteps = 9;
		for (let step = 1; step <= flightSteps; step++) {
			const t = step / (flightSteps + 1);
			const e = easeSlam(t);

			const oneMinusE = 1 - e;
			const curX = oneMinusE * oneMinusE * fromPos.x + 2 * oneMinusE * e * pcX + e * e * toPos.x;
			const curY = oneMinusE * oneMinusE * fromPos.y + 2 * oneMinusE * e * pcY + e * e * toPos.y;
			const rot = sign * ((5 * Math.PI) / 180) * Math.sin(Math.PI * e);

			renderBoardBase([move.from, move.to]);
			renderStaticPieces(boardBefore, move.from, false);
			drawPiece(movingPiece, curX, curY, { rotationRad: rot });
			recordFrame(30);
		}

		// If a piece was captured, draw 3 ascending soul frames (30ms each = 90ms at ~33.3 FPS)
		if (targetPiece) {
			// Soul frame 1
			renderBoardBase([move.from, move.to]);
			renderStaticPieces(boardAfter, null, false);
			drawPiece(targetPiece, toPos.x, toPos.y - 10, { rotationRad: -0.04, alpha: 0.65 });
			recordFrame(30);

			// Soul frame 2
			renderBoardBase([move.from, move.to]);
			renderStaticPieces(boardAfter, null, false);
			drawPiece(targetPiece, toPos.x, toPos.y - 19, { rotationRad: -0.08, alpha: 0.35 });
			recordFrame(30);

			// Soul frame 3
			renderBoardBase([move.from, move.to]);
			renderStaticPieces(boardAfter, null, false);
			drawPiece(targetPiece, toPos.x, toPos.y - 28, { rotationRad: -0.12, alpha: 0.12 });
			recordFrame(30);
		}

		// Final landed state for this move (pause frame)
		renderBoardBase([move.from, move.to]);
		renderStaticPieces(boardAfter, null, isLastMoveOfGame);
		recordFrame(isLastMoveOfGame ? finalDelayMs : stepDelayMs);
	}

	gif.finish();
	const bytes = gif.bytes();
	return new Blob([bytes as unknown as BlobPart], { type: "image/gif" });
}
