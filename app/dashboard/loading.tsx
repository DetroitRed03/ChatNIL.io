export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600 text-sm font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
}
