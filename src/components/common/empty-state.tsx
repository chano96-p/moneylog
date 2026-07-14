import { Icon } from "./icon";

type EmptyStateProps = {
  icon: string;
  title: string;
  description?: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-20">
      <Icon name={icon} className="text-4xl text-gray-300" />
      <p className="font-medium text-gray-700">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
