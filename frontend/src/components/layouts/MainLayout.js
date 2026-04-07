import Sidebar from "./Sidebar";
import ErrorMessage from "./ErrorMessage";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-surface-50 dark:bg-gray-950 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <ErrorMessage />
        {children}
      </main>
    </div>
  );
}
