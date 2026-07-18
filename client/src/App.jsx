import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";

function Home() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-24">
      <h1 className="text-6xl md:text-7xl font-extrabold">
        Chat<span className="text-blue-500">Sphere</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-400">
        A modern real-time chat application built with React, Node.js,
        Express, MongoDB and Socket.IO.
      </p>

      <div className="mt-10 flex gap-4">

        <a
          href="/signup"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
        >
          Get Started
        </a>

        <a
          href="/login"
          className="border border-gray-600 hover:border-blue-500 px-6 py-3 rounded-xl"
        >
          Login
        </a>

      </div>
    </section>
  );
}


function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route path="/chat" element={<Chat />} />

      </Routes>

    </div>
  );
}

export default App;
