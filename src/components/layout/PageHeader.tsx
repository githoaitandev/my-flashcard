interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="md:text-lg xl:text-3xl font-bold text-gray-900">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm lg:text-lg text-gray-600">{description}</p>
      )}
    </div>
  );
}
