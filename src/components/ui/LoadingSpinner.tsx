export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
    </div>
  );
}
