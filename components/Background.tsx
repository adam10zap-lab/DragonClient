export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[140px]" />

      <div className="absolute left-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="absolute right-[-250px] bottom-[-150px] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_40%)]" />
    </div>
  );
}