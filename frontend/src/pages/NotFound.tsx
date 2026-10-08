import React from "react";
import { Link } from "react-router-dom";
import { Cloud, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-center relative overflow-hidden">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
        <Cloud className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-100 mb-2">404</h1>
      <h2 className="text-lg font-semibold text-slate-300 mb-2">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
        The page you are looking for might have been moved, deleted, or does not exist.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};
