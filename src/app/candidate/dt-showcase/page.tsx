"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  location: string;
  type: string; // "Remote" | "On-site" | "Hybrid"
  domain: string;
  description: string;
  tags: string[];
}

export default function DTShowcasePage() {
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [opportunities] = useState<Opportunity[]>([
    {
      id: "1",
      title: "Software Engineer - Full Stack",
      location: "Bangalore, India",
      type: "Hybrid",
      domain: "Technology",
      description: "Build scalable web applications using modern technologies",
      tags: ["Full-time", "Hybrid", "Tech"],
    },
    {
      id: "2",
      title: "Data Scientist",
      location: "Mumbai, India",
      type: "Remote",
      domain: "Analytics",
      description: "Work with large datasets to derive actionable insights",
      tags: ["Full-time", "Remote", "Analytics"],
    },
    {
      id: "3",
      title: "Product Manager",
      location: "Delhi, India",
      type: "On-site",
      domain: "Product",
      description: "Lead product strategy and execution",
      tags: ["Full-time", "On-site", "Product"],
    },
  ]);

  const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities);

  useEffect(() => {
    let filtered = opportunities;

    // Filter by location
    if (locationSearch) {
      filtered = filtered.filter((opp) =>
        opp.location.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }

    // Filter by type
    if (selectedFilter !== "all") {
      filtered = filtered.filter((opp) => opp.type.toLowerCase() === selectedFilter);
    }

    setFilteredOpportunities(filtered);
  }, [locationSearch, selectedFilter, opportunities]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Section - DT Impression Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl bg-white p-6 shadow-lg md:p-8">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="mb-4 text-4xl font-bold text-blue-900">
                  Welcome to DT
                </h1>
                <p className="text-lg text-slate-700">
                  DeepThought is a platform that empowers individuals to showcase their
                  skills, learn continuously, and discover opportunities that match their
                  aspirations.
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                  Our Mission
                </h2>
                <p className="mb-4 text-slate-600">
                  To bridge the gap between talent and opportunity by creating a
                  transparent, skill-based ecosystem where merit is the only currency.
                </p>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    We believe in democratizing access to opportunities and enabling
                    everyone to realize their full potential.
                  </p>
                </div>
              </div>

              {/* Culture & Values */}
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                  DT Culture & Values
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Excellence</h3>
                      <p className="text-sm text-slate-600">
                        Pursuing the highest standards in everything we do
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="rounded-full bg-purple-100 p-2">
                      <svg
                        className="h-5 w-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Collaboration</h3>
                      <p className="text-sm text-slate-600">
                        Working together to achieve common goals
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Innovation</h3>
                      <p className="text-sm text-slate-600">
                        Embracing new ideas and creative solutions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="rounded-full bg-amber-100 p-2">
                      <svg
                        className="h-5 w-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Learning</h3>
                      <p className="text-sm text-slate-600">
                        Continuous growth and skill development
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media & Links */}
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                  Learn More About DT
                </h2>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:bg-slate-50"
                  >
                    <div className="rounded bg-red-100 p-2">
                      <svg
                        className="h-5 w-5 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Watch Our Story</p>
                      <p className="text-sm text-slate-500">
                        Discover how DT is transforming careers
                      </p>
                    </div>
                  </a>

                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:bg-slate-50"
                  >
                    <div className="rounded bg-blue-100 p-2">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">About DT</p>
                      <p className="text-sm text-slate-500">
                        Learn about our mission and vision
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Section - Opportunity Discovery Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-4 rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Discover Opportunities
              </h2>

              {/* Location Search */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Browse by Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter city, state, or country"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Work Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {["all", "remote", "on-site", "hybrid"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        selectedFilter === filter
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opportunity Cards */}
              <div className="space-y-3">
                {filteredOpportunities.length > 0 ? (
                  filteredOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100 hover:shadow-md"
                      onClick={() => router.push(`/candidate/processes/${opp.id}`)}
                    >
                      <h3 className="mb-1 font-semibold text-slate-900">
                        {opp.title}
                      </h3>
                      <div className="mb-2 flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {opp.location}
                        </span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                          {opp.type}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-600">
                        {opp.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500">
                    No opportunities found
                  </p>
                )}
              </div>

              {/* Explore CTA */}
              <button
                onClick={() => router.push("/candidate/processes")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
              >
                Explore All Opportunities
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
