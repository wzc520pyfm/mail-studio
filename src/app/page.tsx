'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(
  () => import('@/components/editor/Editor').then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Mail Studio...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <Editor />;
}
