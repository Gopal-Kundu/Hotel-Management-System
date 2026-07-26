import { FaLinkedin } from "react-icons/fa";
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white text-slate-500 py-4 px-4 italic text-center flex items-center justify-center gap-2 border-t border-red-100">
      <span className="text-sm">
        Thank you for visiting... Made by{" "}
        <span className="font-semibold text-slate-700">Gopal Kundu</span>
      </span>
      <Link
        className="inline-flex items-center text-slate-550 hover:text-red-600 transition-colors"
        to="https://www.linkedin.com/in/gopalcodes/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedin className="w-5 h-5" />
      </Link>
    </footer>
  );
}
