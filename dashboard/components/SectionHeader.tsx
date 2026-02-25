interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mt-12 mb-4">
      <h2 className="text-xl font-semibold text-sola-text">{title}</h2>
      {subtitle && (
        <p className="text-sm text-sola-textSecondary mt-1">{subtitle}</p>
      )}
    </div>
  );
}
