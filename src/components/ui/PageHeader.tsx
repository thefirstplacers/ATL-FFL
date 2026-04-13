export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">{title}</h1>
      {subtitle && <p className="text-text-secondary mt-2 text-lg">{subtitle}</p>}
    </div>
  );
}
