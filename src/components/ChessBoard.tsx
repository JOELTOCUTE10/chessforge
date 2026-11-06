import { Chess, type Square } from 'chess.js';
import { useEffect, useMemo, useState } from 'react';

const pieces: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

type Props = {
  fen: string;
  onMove: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
  orientation?: 'w' | 'b';
  lastMove?: { from: string; to: string } | null;
  inputLabel?: string;
};

export default function ChessBoard({ fen, onMove, disabled = false, orientation = 'w', lastMove = null, inputLabel = 'Chess position' }: Props) {
  const game = useMemo(() => new Chess(fen), [fen]);
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<{ from: string; to: string; color: 'w' | 'b' } | null>(null);
  useEffect(() => { setSelected(null); setPromotion(null); }, [fen]);
  const targets = useMemo(() => selected ? game.moves({ square: selected as Square, verbose: true }).map((move) => move.to) : [], [game, selected]);
  const files = orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  const ranks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

  function handleSquare(square: Square) {
    if (disabled || promotion) return;
    const piece = game.get(square);
    if (selected && targets.includes(square)) {
      const move = game.moves({ square: selected as Square, verbose: true }).find((candidate) => candidate.to === square);
      if (move?.flags.includes('p')) {
        setPromotion({ from: selected, to: square, color: game.turn() });
        return;
      }
      onMove(selected, square);
      setSelected(null);
      return;
    }
    if (piece && piece.color === game.turn()) {
      setSelected(square);
      return;
    }
    setSelected(null);
  }

  function choosePromotion(piece: string) {
    if (!promotion) return;
    onMove(promotion.from, promotion.to, piece);
    setPromotion(null);
    setSelected(null);
  }

  return (
    <div className="board-wrap">
      <div className="board" role="group" aria-label={inputLabel}>
        {ranks.flatMap((rank) => files.map((file) => {
          const square = `${file}${rank}` as Square;
          const piece = game.get(square);
          const isLight = (files.indexOf(file) + ranks.indexOf(rank)) % 2 === 0;
          const isTarget = targets.includes(square);
          const isLast = lastMove?.from === square || lastMove?.to === square;
          const isSelected = selected === square;
          return (
            <button
              className={`square ${isLight ? 'light' : 'dark'} ${isLast ? 'last-move' : ''} ${isSelected ? 'selected' : ''}`}
              key={square}
              type="button"
              onClick={() => handleSquare(square)}
              aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
              aria-pressed={isSelected}
            >
              {file === files[0] && <span className="rank-label">{rank}</span>}
              {rank === ranks[ranks.length - 1] && <span className="file-label">{file}</span>}
              {piece && <span className={`piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}>{pieces[`${piece.color}${piece.type}`]}</span>}
              {isTarget && <span className={`move-dot ${piece ? 'capture-dot' : ''}`} />}
            </button>
          );
        }))}
      </div>
      {promotion && (
        <div className="promotion-popover" role="dialog" aria-label="Choose promotion piece">
          <span>Promote to</span>
          {['q', 'r', 'b', 'n'].map((piece) => <button key={piece} onClick={() => choosePromotion(piece)}>{pieces[`${promotion.color}${piece}`]}</button>)}
        </div>
      )}
    </div>
  );
}
