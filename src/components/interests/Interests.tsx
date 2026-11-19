import {
  BookOpen,
  Clapperboard,
  Gamepad2,
  Heart,
  Palette,
  PawPrint,
  Sparkles,
  Snowflake,
  Star,
  Utensils,
} from 'lucide-react';
import type { InterestGroup } from '../../types/profile';
import { usePreferences } from '../../contexts/preferences';

const icons = {
  hobbies: Heart,
  anime: Sparkles,
  screen: Clapperboard,
  books: BookOpen,
  food: Utensils,
  animals: PawPrint,
  colors: Palette,
  characters: Star,
  games: Gamepad2,
  season: Snowflake,
};

export function Interests({ groups }: { groups: InterestGroup[] }) {
  const { localize } = usePreferences();
  return (
    <div className="interest-grid">
      {groups
        .filter((group) => group.values.length > 0)
        .map((group) => {
          const Icon = Object.hasOwn(icons, group.id)
            ? icons[group.id as keyof typeof icons]
            : Star;
          return (
            <article
              className={'panel interest-card interest-' + group.id}
              key={group.id}
            >
              <Icon aria-hidden="true" size={20} />
              <h3>{localize(group.label)}</h3>
              <ul>
                {group.values.map((value, index) => (
                  <li key={index}>
                    {group.id === 'colors' && value === '黑色' && (
                      <span className="black-swatch" aria-hidden="true" />
                    )}
                    {value}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
    </div>
  );
}
