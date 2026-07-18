import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await fetch(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );


      const data = await res.json();

      console.log(data);


      if (data.success) {

        localStorage.setItem("token", data.token);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );


        alert("Login Successful 🚀");


        // Login ke baad Chat page open hoga
        navigate("/chat");


      } else {

        alert(data.message);

      }


    } catch (error) {

      console.log(error);

      alert("Backend connection failed");

    }

  };


  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">

      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-2xl w-96"
      >

        <h1 className="text-3xl font-bold text-center text-blue-500">
          Login
        </h1>


        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mt-6 p-3 rounded bg-gray-800 outline-none"
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
          Login
        </button>


      </form>

    </div>
  );
}

export default Login;
