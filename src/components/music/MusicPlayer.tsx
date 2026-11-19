import {
  Music2,
  Pause,
  Play,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePreferences } from '../../contexts/preferences';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import type { ProfileConfig } from '../../types/profile';
import { timeLabel } from '../../utils/audio';
import { SafeImage } from '../ui/SafeImage';
import { Visualizer } from './Visualizer';

export default function MusicPlayer({
  config,
}: {
  config: ProfileConfig['music'];
}) {
  const { t } = usePreferences();
  const player = useAudioPlayer(config);
  const { track, playing, loading, error, duration, progress } = player;
  if (!track) return null;
  return (
    <div className="panel player">
      <audio {...player.mediaProps} />
      <div className="player-heading">
        <div className="track-art">
          <SafeImage
            image={track.artwork}
            fallback={<Music2 aria-hidden="true" />}
          />
        </div>
        <div>
          <h3>{track.title}</h3>
          <p className="muted">{track.artist}</p>
        </div>
        {config.visualization && (
          <Visualizer analyser={player.analyser} playing={playing} />
        )}
      </div>
      <div className="player-timeline">
        <span>{timeLabel(progress)}</span>
        <input
          type="range"
          aria-label={t('seek')}
          aria-valuetext={timeLabel(progress)}
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(progress, duration)}
          disabled={!duration}
          onChange={(event) => player.seek(event.target.valueAsNumber)}
        />
        <span>{timeLabel(duration)}</span>
      </div>
      <div className="player-controls button-row">
        <button
          className="button icon-button"
          aria-label={t('previous')}
          disabled={config.playlist.length < 2}
          onClick={() => player.move(-1)}
        >
          <SkipBack aria-hidden="true" />
        </button>
        <button
          className="button icon-button primary"
          aria-label={t(playing ? 'pause' : 'play')}
          onClick={player.toggle}
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        <button
          className="button icon-button"
          aria-label={t('following')}
          disabled={config.playlist.length < 2}
          onClick={() => player.move(1)}
        >
          <SkipForward aria-hidden="true" />
        </button>
        <button
          className="button icon-button"
          aria-label={t('repeat')}
          aria-pressed={player.repeat}
          onClick={() => player.setRepeat(!player.repeat)}
        >
          <Repeat1 aria-hidden="true" />
        </button>
        <button
          className="button icon-button"
          aria-label={t('shuffle')}
          aria-pressed={player.shuffle}
          onClick={() => player.setShuffle(!player.shuffle)}
          disabled={config.playlist.length < 2}
        >
          <Shuffle aria-hidden="true" />
        </button>
        <button
          className="button icon-button"
          aria-label={t(player.muted ? 'unmute' : 'mute')}
          onClick={player.toggleMute}
        >
          {player.muted ? (
            <VolumeX aria-hidden="true" />
          ) : (
            <Volume2 aria-hidden="true" />
          )}
        </button>
        <input
          className="volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={player.volume}
          aria-label={t('volume')}
          onChange={(event) => player.changeVolume(event.target.valueAsNumber)}
        />
      </div>
      <p role="status">
        {error ? t('audioError') : loading ? t('loading') : ''}
      </p>
      <h4>{t('playlist')}</h4>
      <ol className="playlist">
        {config.playlist.map((item, index) => (
          <li key={item.id}>
            <button
              className="button"
              aria-current={index === player.index ? 'true' : undefined}
              onClick={() => player.play(index)}
            >
              <Play size={15} aria-hidden="true" />
              {item.title} <span className="muted">{item.artist}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
