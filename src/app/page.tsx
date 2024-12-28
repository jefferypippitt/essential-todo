import { MaxWidthWrapper } from "@/components/max-width-wrapper";

export default function Home() {
  return (
    <MaxWidthWrapper>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">🪴 Essential To-Do</h1>
      </div>
    </MaxWidthWrapper>
  );
}
