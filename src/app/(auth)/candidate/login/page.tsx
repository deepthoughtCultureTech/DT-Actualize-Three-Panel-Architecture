"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, Mail, User, Phone } from "lucide-react";

export default function CandidateAuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockInfo, setBlockInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBlockInfo(null);

    try {
      const url = isRegister
        ? "/api/candidate/auth/register"
        : "/api/candidate/auth/login";

      const body = isRegister ? { name, email, password } : { email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "account_blocked") {
          setBlockInfo(data); // ✅ Contains adminContacts directly
        } else {
          setError(
            data.error || (isRegister ? "Registration failed" : "Login failed")
          );
        }
        setLoading(false);
        return;
      }

      // ✅ Handle registration -> auto-login
      if (isRegister) {
        const loginRes = await fetch("/api/candidate/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          if (loginData.error === "account_blocked") {
            setBlockInfo(loginData); // ✅ Contains adminContacts directly
          } else {
            setError(loginData.error || "Login failed after registration");
          }
          setLoading(false);
          return;
        }

        localStorage.setItem("token", loginData.token);
      } else {
        localStorage.setItem("token", data.token);
      }

      router.push("/candidate/dashboard");
    } catch (err) {
      console.error("Auth error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 mx-4">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          {isRegister ? "Candidate Register" : "Candidate Login"}
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          {isRegister ? "Create your account" : "Access your dashboard"}
        </p>

        {/* ✅ Block Message with Admin Contacts */}
        {blockInfo && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-orange-900 text-base mb-2">
              Account Blocked
            </h3>
            <p className="text-orange-800 text-sm mb-3 leading-relaxed">
              {blockInfo.message}
            </p>

            <div className="bg-white rounded-lg p-3 mb-3">
              <div className="space-y-1">
                <div className="text-orange-700">
                  <p className="text-xs">
                    <strong>Reason:</strong> {blockInfo.reason}
                  </p>
                </div>
                {/* <div className="text-orange-700">
                  <p className="text-xs">
                    <strong>Time remaining:</strong>{" "}
                    <span className="font-mono font-bold">
                      {blockInfo.timeRemaining?.hours}h{" "}
                      {blockInfo.timeRemaining?.minutes}m
                    </span>
                  </p>
                </div> */}
              </div>
            </div>

            {/* <div className="bg-orange-100 rounded-lg p-2.5 mb-3">
              <p className="text-xs text-orange-800">
                <strong>You can login again at:</strong>
                <br />
                <span className="font-mono text-xs">
                  {new Date(blockInfo.blockedUntil).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div> */}

            {/* ✅ Admin Contacts - directly from blockInfo */}
            {/* ✅ Show ONLY FIRST admin */}
            {blockInfo.adminContacts && blockInfo.adminContacts.length > 0 && (
              <div className="p-3 flex items-center">
                <h4 className="text-sm font-bold mb-2 mr-2">Contact Admin:</h4>
                {blockInfo.adminContacts[0] && ( // ✅ Only first admin
                  <div className="rounded p-2">
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <User className="w-3 h-3" />
                      <span className="font-semibold">
                        {blockInfo.adminContacts[0].name}
                      </span>
                    </div>
                    {blockInfo.adminContacts[0].email && (
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <Mail className="w-3 h-3" />
                        <a
                          href={`mailto:${blockInfo.adminContacts[0].email}`}
                          className="hover:underline"
                        >
                          {blockInfo.adminContacts[0].email}
                        </a>
                      </div>
                    )}
                    {blockInfo.adminContacts[0].phone && (
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="w-3 h-3" />
                        <a
                          href={`tel:${blockInfo.adminContacts[0].phone}`}
                          className="hover:underline"
                        >
                          {blockInfo.adminContacts[0].phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Regular Error */}
        {error && !blockInfo && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="John Doe"
                required={isRegister}
                disabled={!!blockInfo}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="your.email@example.com"
              required
              disabled={!!blockInfo}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="••••••••"
              required
              disabled={!!blockInfo}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!blockInfo}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-white font-semibold transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isRegister ? "Registering..." : "Logging in..."}
              </span>
            ) : isRegister ? (
              "Register"
            ) : (
              "Login"
            )}
          </button>
        </form>

        {blockInfo && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Please wait for the block period to end or contact admin for
              assistance.
            </p>
          </div>
        )}

        {!blockInfo && (
          <p className="mt-5 text-center text-sm text-gray-600">
            {isRegister ? "Already registered?" : "New candidate?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setBlockInfo(null);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition"
            >
              {isRegister ? "Login here" : "Register here"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
