import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max > 0 ? (window.scrollY / max) * 100 : 0;
      setWidth(next);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div id="scroll-progress" aria-hidden="true" style={{ width: `${width}%` }} />;
}
