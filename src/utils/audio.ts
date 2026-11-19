export function nextTrack(
  index: number,
  count: number,
  direction: 1 | -1,
  shuffle: boolean,
  random = Math.random,
) {
  if (count <= 1) return 0;
  if (shuffle && direction === 1)
    return (index + 1 + Math.floor(random() * (count - 1))) % count;
  return (index + direction + count) % count;
}

export function timeLabel(seconds: number) {
  const whole =
    Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}
