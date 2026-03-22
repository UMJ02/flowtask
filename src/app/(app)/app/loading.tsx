function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function AppLoading() {
  return (
    <div className="space-y-4">
      <Block className="h-28 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Block className="h-40" />
        <Block className="h-40" />
        <Block className="h-40" />
      </div>
      <Block className="h-24 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Block className="h-64" />
        <Block className="h-64" />
      </div>
    </div>
  );
}
