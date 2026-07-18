import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    console.log("Signup button clicked");

    try {
      const res = await fetch(
        "https://chatsphere-backend-518s.onrender.com/api/auth/register"
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      console.log("Status:", res.status);

      const data = await res.json();

      console.log("Response:", data);

      if (data.success) {

        localStorage.setItem("token", data.token);

        alert("Signup Successful 🚀");

        navigate("/login");

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.error("Signup Error:", error);

      alert(error.message);

    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">

      <form
        onSubmit={handleSignup}
        className="bg-gray-900 p-8 rounded-2xl w-96"
      >

        <h1 className="text-3xl font-bold text-center text-blue-500">
          Create Account
        </h1>

        <input
          name="name"
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full mt-6 p-3 rounded bg-gray-800 outline-none"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mt-4 p-3 rounded bg-gray-800 outline-none"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mt-4 p-3 rounded bg-gray-800 outline-none"
        />

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 py-3 rounded-lg hover:bg-blue-700"
        >
          Signup
        </button>

      </form>

    </div>
  );
}

export default Signup;
