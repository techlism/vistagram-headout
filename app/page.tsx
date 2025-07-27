import SignInWithGoogle from "@/components/SignInWithGoogle";

export default async function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      Vistagram - Home
      <SignInWithGoogle />
    </div>)

}