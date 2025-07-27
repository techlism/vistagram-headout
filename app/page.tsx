import { Camera } from "lucide-react";
import Link from "next/link";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-primary">Vistagram</h1>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">
              Capture & Share Points of Interest
            </h2>
            <p className="text-xl text-gray-600">
              Share your favorite spots and discover amazing places through the
              community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <SignInWithGoogle />
            <Link href="/posts">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-transparent"
              >
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
