import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export function Visualizer({
  analyser,
  playing,
}: {
  analyser: AnalyserNode | null;
  playing: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!context || !analyser || !playing || reduced) return;
    const values = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    function draw() {
      if (!context || !analyser) return;
      analyser.getByteFrequencyData(values);
      context.clearRect(0, 0, 220, 34);
      context.fillStyle = '#819fff';
      for (let i = 0; i < 22; i++) {
        const height = 2 + (values[i] / 255) * 32;
        context.fillRect(i * 10, 34 - height, 6, height);
      }
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, [analyser, playing, reduced]);
  if (!playing || reduced) return null;
  return analyser ? (
    <canvas
      ref={canvas}
      width={220}
      height={34}
      className="visualizer"
      aria-hidden="true"
    />
  ) : (
    <span className="equalizer" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
