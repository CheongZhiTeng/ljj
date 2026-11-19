import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../config/profile';
import type { ProfileConfig } from '../types/profile';
import { nextTrack } from '../utils/audio';

export function useAudioPlayer(config: ProfileConfig['music']) {
  const audio = useRef<HTMLAudioElement>(null);
  const graph = useRef<{
    context: AudioContext;
    analyser: AnalyserNode;
  } | null>(null);
  const command = useRef(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(config.repeat);
  const [shuffle, setShuffle] = useState(config.shuffle);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const track = config.playlist[index];
  const localPlaylist = config.playlist.every(
    (item) =>
      new URL(assetUrl(item.src), document.baseURI).origin === location.origin,
  );

  useEffect(() => {
    const element = audio.current;
    return () => {
      element?.pause();
      if (element?.hasAttribute('src')) {
        element.removeAttribute('src');
        element.load();
      }
      if (graph.current) {
        void graph.current.context.close().catch(() => undefined);
        graph.current = null;
      }
    };
  }, []);

  function enableVisualization(element: HTMLAudioElement) {
    if (!config.visualization || !localPlaylist || !window.AudioContext) return;
    try {
      if (!graph.current) {
        const context = new AudioContext();
        try {
          const node = context.createAnalyser();
          node.fftSize = 128;
          node.connect(context.destination);
          context.createMediaElementSource(element).connect(node);
          graph.current = { context, analyser: node };
          setAnalyser(node);
        } catch {
          void context.close().catch(() => undefined);
          return;
        }
      }
      void graph.current.context.resume().catch(() => undefined);
    } catch {
      // The media element continues to provide audio on unsupported devices.
    }
  }

  function play(target = index) {
    const element = audio.current;
    const selected = config.playlist[target];
    if (!element || !selected) return;
    const token = ++command.current;
    const src = assetUrl(selected.src);
    setError(false);
    setIndex(target);
    if (
      element.getAttribute('src') !== src ||
      element.error ||
      target !== index
    ) {
      element.src = src;
      setDuration(0);
      setProgress(0);
      setLoading(true);
    }
    enableVisualization(element);
    void element.play().catch(() => {
      if (audio.current === element && command.current === token) {
        setError(true);
        setLoading(false);
        setPlaying(false);
      }
    });
  }

  function toggle() {
    const element = audio.current;
    if (element && !element.paused) {
      command.current++;
      element.pause();
      setLoading(false);
    } else play();
  }
  function move(direction: 1 | -1) {
    play(nextTrack(index, config.playlist.length, direction, shuffle));
  }

  return {
    track,
    index,
    playing,
    loading,
    error,
    progress,
    duration,
    volume,
    muted,
    repeat,
    shuffle,
    analyser,
    toggle,
    play,
    move,
    setRepeat,
    setShuffle,
    seek(value: number) {
      if (audio.current && duration > 0) audio.current.currentTime = value;
    },
    changeVolume(value: number) {
      if (!audio.current) return;
      audio.current.volume = value;
      if (value > 0) audio.current.muted = false;
      setVolume(value);
      setMuted(audio.current.muted);
    },
    toggleMute() {
      if (!audio.current) return;
      audio.current.muted = !audio.current.muted;
      setMuted(audio.current.muted);
    },
    mediaProps: {
      ref: audio,
      preload: 'none',
      loop: repeat,
      onTimeUpdate: () => setProgress(audio.current?.currentTime ?? 0),
      onDurationChange: () => {
        const value = audio.current?.duration ?? 0;
        setDuration(Number.isFinite(value) ? value : 0);
      },
      onWaiting: () => setLoading(true),
      onPlaying: () => {
        setPlaying(true);
        setLoading(false);
      },
      onPause: () => {
        setPlaying(false);
        setLoading(false);
      },
      onError: () => {
        if (audio.current?.getAttribute('src')) {
          setError(true);
          setLoading(false);
          setPlaying(false);
        }
      },
      onEnded: () => {
        setPlaying(false);
        if (
          config.playlist.length > 1 &&
          (shuffle || index < config.playlist.length - 1)
        )
          move(1);
      },
    },
  };
}
