export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] px-5 py-5 text-[#111827] lg:pl-[236px]">
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-5">
        <div className="h-10 w-44 rounded-md bg-[#e5e7eb]" />
        <div className="rounded-md border border-[#d7dbe0] bg-white p-6 shadow-sm">
          <div className="h-5 w-20 rounded bg-[#dbeafe]" />
          <div className="mt-5 h-8 w-2/3 rounded bg-[#e5e7eb]" />
          <div className="mt-4 h-4 w-full rounded bg-[#edf0f2]" />
          <div className="mt-2 h-4 w-5/6 rounded bg-[#edf0f2]" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-32 rounded-md border border-[#d7dbe0] bg-[#f8fafc]" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
