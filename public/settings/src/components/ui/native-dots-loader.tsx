import { memo } from 'react';
const DOTS = [
  'bg-blue-200/90',
  'bg-blue-300/90',
  'bg-blue-400/90',
  'bg-blue-600',
];

function NativeDotsLoaderComponent() {
  return (
    <div className="flex items-center justify-center gap-4" aria-hidden="true">
      {DOTS.map((color, index) => (
        <span
          key={color}
          className={`flowtask-loading-dot block rounded-full ${color}`}
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </div>
  );
}

export const NativeDotsLoader = memo(NativeDotsLoaderComponent);
