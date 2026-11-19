import './editor.css';
import { useEffect, useRef, useState } from 'react';
import { validateProfile } from '../config/validate';
import type { ProfileConfig } from '../types/profile';

type Section = Exclude<keyof ProfileConfig, 'publicationApproved'>;
const sections: Section[] = [
  'website',
  'profile',
  'socialMedia',
  'interests',
  'personality',
  'music',
  'quiz',
  'theme',
  'localization',
  'visibility',
];
const json = (value: unknown) => JSON.stringify(value, null, 2);

export default function ProfileEditor({
  config,
  update,
  close,
}: {
  config: ProfileConfig;
  update: (value: ProfileConfig) => void;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [section, setSection] = useState<Section | 'all'>('all');
  const [draft, setDraft] = useState(() => json(config));
  const [status, setStatus] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  function candidate() {
    const parsed: unknown = JSON.parse(draft);
    const value = validateProfile(
      section === 'all' ? parsed : { ...config, [section]: parsed },
    );
    return { ...value, publicationApproved: false };
  }
  function perform(action: (valid: ProfileConfig) => void, message: string) {
    try {
      action(candidate());
      setStatus(message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 1024 * 1024)
        throw new Error('JSON must be at most 1 MB.');
      const value = validateProfile(JSON.parse(await file.text()));
      setSection('all');
      setDraft(json({ ...value, publicationApproved: false }));
      setStatus(
        'Imported into the editor. Apply preview to review the changes.',
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }
  function download(value: ProfileConfig) {
    const url = URL.createObjectURL(
      new Blob([json(value) + '\n'], { type: 'application/json' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'profile.local.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <dialog
      ref={dialog}
      onClose={close}
      className="editor panel"
      aria-labelledby="editor-title"
    >
      <h2 id="editor-title">Local profile editor</h2>
      <p className="muted">
        Preview edits in this tab or export a draft JSON file. The preview stays
        in memory.
      </p>
      <div className="editor-options">
        <label>
          Configuration section
          <select
            value={section}
            onChange={(event) => {
              const value = event.target.value as Section | 'all';
              setSection(value);
              setDraft(json(value === 'all' ? config : config[value]));
              setStatus('');
            }}
          >
            <option value="all">Complete profile</option>
            {sections.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <label>
          Import JSON{' '}
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              void importFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
      </div>
      <label className="editor-input">
        Configuration JSON
        <textarea
          spellCheck={false}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <p role="status">{status}</p>
      <div className="button-row">
        <button
          className="button"
          onClick={() => perform(() => undefined, 'Configuration is valid.')}
        >
          Validate
        </button>
        <button
          className="button primary"
          onClick={() =>
            perform((value) => {
              update(value);
              dialog.current?.close();
            }, 'Preview updated.')
          }
        >
          Apply preview
        </button>
        <button
          className="button"
          onClick={() => perform(download, 'Draft exported.')}
        >
          Export JSON
        </button>
        <button className="button" onClick={() => dialog.current?.close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}
