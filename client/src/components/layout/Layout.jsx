// =============================================
// client/src/components/layout/Layout.jsx
//
// CONCEPT: Layout Composition with "children" prop
// =============================================
// Every authenticated page (Dashboard, Patients, Doctors…)
// shares the same structure:
//
//   Sidebar | Navbar + Page Content
//
// Instead of copy-pasting Sidebar + Navbar into every page,
// we create ONE Layout component that wraps any page.
//
// The "children" prop is special — it represents whatever
// JSX you write between the opening and closing tags:
//
//   <Layout>
//     <Dashboard />    <-- this is "children"
//   </Layout>
//
// Layout renders Sidebar, Navbar, then {children} in the right spot.
// This is called the "Wrapper Pattern" or "Slot Pattern".
// =============================================

import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      {/* Fixed left sidebar — always visible */}
      <Sidebar />

      {/* Right side: scrollable main area */}
      <div className="main-content">
        {/* Sticky top navigation bar */}
        <Navbar />

        {/* The actual page content goes here */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
