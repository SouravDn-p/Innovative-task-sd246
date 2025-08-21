"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { loginStart, loginSuccess, loginFailure } from "@/redux/slice/authSlice"

export default function Register() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = async (data) => {
    setApiError(null)
    dispatch(loginStart())

    try {
      // Register API call
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (res.ok) {
        // Optional: auto-login after register
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        })
        const loginData = await loginRes.json()

        if (loginRes.ok) {
          dispatch(loginSuccess({ user: loginData.user, token: loginData.token }))
          router.push("/user")
        } else {
          dispatch(loginFailure(loginData.error))
          setApiError(loginData.error)
        }
      } else {
        dispatch(loginFailure(result.error))
        setApiError(result.error)
      }
    } catch (err) {
      dispatch(loginFailure("Network error"))
      setApiError("Network error")
    }
  }

  const handleGoogleRegister = async () => {
    try {
      await signIn("google", { callbackUrl: "/user" })
    } catch (err) {
      setApiError("Google login failed")
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-600 p-6">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Account</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Your Name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="********"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {apiError && <p className="text-red-500 text-center mt-4">{apiError}</p>}

        <div className="my-6 text-center text-gray-400">OR</div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGoogleRegister}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            Register with Google
          </button>
        </div>

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-green-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}

export { Register as RegisterForm }
