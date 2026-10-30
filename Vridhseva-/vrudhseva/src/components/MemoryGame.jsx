import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const allPairs = [
  { emoji: '🍵', name: 'tea cup' },
  { emoji: '🌼', name: 'flower' },
  { emoji: '🕐', name: 'clock' },
  { emoji: '📻', name: 'radio' },
  { emoji: '🔔', name: 'bell' },
  { emoji: '☂️', name: 'umbrella' },
  { emoji: '🪔', name: 'lamp' },
  { emoji: '🫖', name: 'teapot' }
];

function shuffle(arr) {
  return [...arr].map((value) => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
}

export default function MemoryGame() {
  const { t } = useLanguage();
  const [pairCount, setPairCount] = useState(6);
  const [board, setBoard] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [status, setStatus] = useState(t('mem_find'));
  const [locked, setLocked] = useState(false);

  const buildBoard = () => {
    const chosen = allPairs.slice(0, pairCount);
    const deck = shuffle([...chosen, ...chosen]);
    setBoard(deck.map((item, index) => ({ ...item, id: `${item.name}-${index}` })));
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setStatus(t('mem_find'));
    setLocked(false);
  };

  useEffect(() => {
    buildBoard();
  }, [pairCount]);

  useEffect(() => {
    if (matches === pairCount) {
      setStatus(t('mem_done'));
    }
  }, [matches, pairCount, t]);

  const handleFlip = (card) => {
    if (locked || flipped.some((item) => item.id === card.id) || card.matched) return;

    const nextFlipped = [...flipped, card];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((current) => current + 1);
      setLocked(true);

      if (nextFlipped[0].emoji === nextFlipped[1].emoji) {
        setBoard((current) => current.map((item) =>
          item.id === nextFlipped[0].id || item.id === nextFlipped[1].id ? { ...item, matched: true } : item
        ));
        setMatches((current) => current + 1);
        setFlipped([]);
        setStatus(t('mem_nice'));
        setLocked(false);
      } else {
        setStatus(t('mem_find'));
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 700);
      }
    }
  };

  const renderedBoard = useMemo(() => board.map((card) => {
    const isOpen = flipped.some((item) => item.id === card.id) || card.matched;
    return (
      <button
        key={card.id}
        type="button"
        className={`mem-card ${isOpen ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
        aria-label={isOpen ? card.name : 'Hidden card'}
        onClick={() => handleFlip(card)}
      >
        <span className="mem-inner">
          <span className="mem-face mem-front">?</span>
          <span className="mem-face mem-back">{card.emoji}</span>
        </span>
      </button>
    );
  }), [board, flipped]);

  return (
    <article className="card reveal" id="memory-demo">
      <h3>{t('mem_title')}</h3>
      <p>{t('mem_intro')}</p>
      <div className="memory-toolbar">
        <span id="diff-label">{t('mem_diff')}</span>
        <div role="group" aria-labelledby="diff-label">
          {[4, 6, 8].map((count) => (
            <button
              key={count}
              type="button"
              className="btn btn-ghost mini"
              aria-pressed={pairCount === count}
              onClick={() => setPairCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
        <p id="move-count">{t('mem_moves').replace('{n}', String(moves))}</p>
        <button type="button" className="btn btn-primary" onClick={buildBoard}>{t('mem_again')}</button>
      </div>
      <div className="memory-board">{renderedBoard}</div>
      <p className="memory-status" role="status">{status}</p>
      <p className="disclaimer">{t('mem_note')}</p>
    </article>
  );
}
