import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-gray-900 border-b border-gray-800">
      <Link to="/" className="text-3xl font-bold text-blue-500">
        ChatSphere
      </Link>

      <div className="flex gap-6">
        <Link
          to="/login"
          className="hover:text-blue-400 transition"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
        >
          Signup
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
