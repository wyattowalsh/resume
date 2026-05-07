import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">
        <code>resume</code> Dev Docs
      </h1>
      <div className="mt-4 flex flex-row gap-4">
        <Button asChild>
          <Link
            href="/docs"
          >
            <Book className="mr-2 size-4" />
            Docs
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link
            href="https://github.com/wyattowalsh/resume"
          >
            <FaGithub className="mr-2 size-4" />
            GitHub
          </Link>
        </Button>
      </div>
    </main>
  );
}
