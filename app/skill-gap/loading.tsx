export default function Loading() {
  return (
    <div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-[#252936] border-t-purple-500 animate-spin" />

        <h2 className="text-xl font-semibold">
          Loading Skill Gap...
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Analyzing your skills and identifying gaps
        </p>
      </div>
    </div>
  );
}