import React from 'react';
import type { LucideProps } from 'lucide-react';

interface SectionCardProps {
  title?: string;
  titleIcon?: React.ComponentType<LucideProps>;
  titleIconProps?: LucideProps;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  cardClassName?: string;
  headerAreaClassName?: string;
  contentAreaClassName?: string;
  titleTextClassName?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  titleIcon: TitleIcon,
  titleIconProps,
  headerActions,
  children,
  cardClassName = "bg-white rounded-xl shadow-md",
  headerAreaClassName = "p-4 sm:p-5 border-b border-slate-200",
  contentAreaClassName = "p-4 sm:p-5",
  titleTextClassName = "text-lg md:text-xl font-semibold text-slate-800",
}) => {
  const hasHeader = title || headerActions;

  return (
    <div className={`${cardClassName}`}>
      {hasHeader && (
        <div className={`flex justify-between items-center ${headerAreaClassName}`}>
          {title && (
            <h2 className={`flex items-center ${titleTextClassName}`}>
              {TitleIcon && titleIconProps && <TitleIcon {...titleIconProps} />}
              <span className={TitleIcon && titleIconProps ? 'ml-2' : ''}>{title}</span>
            </h2>
          )}
          {headerActions && <div className="ml-auto pl-4 flex-shrink-0">{headerActions}</div>}
        </div>
      )}
      <div className={`${contentAreaClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default SectionCard;