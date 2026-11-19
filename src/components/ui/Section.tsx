import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function Section({ id, title, icon: Icon, children }: SectionProps) {
  return (
    <section
      className="content-section"
      id={id}
      aria-labelledby={id + '-title'}
      tabIndex={-1}
    >
      <div className="section-heading">
        <span className="heading-icon">
          <Icon aria-hidden="true" size={19} />
        </span>
        <h2 id={id + '-title'}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
