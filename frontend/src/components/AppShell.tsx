import { type ReactNode } from "react";
import Sidebar from "./Sidebar";

interface Props {
  children: ReactNode;
}

export default function AppShell({ children }: Props) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
