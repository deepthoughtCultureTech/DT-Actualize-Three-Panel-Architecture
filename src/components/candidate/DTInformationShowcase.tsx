"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, ArrowRight, Play, ExternalLink } from "lucide-react";

interface DTShowcaseProps {
  onContinue?: () => void;
}

interface Opportunity {
  id: string;
  title: string;
  location: string;
  description: string;
  tags: string[];
  type: string;
}

export default function DTInformationShowcase({ onContinue }: DTShowcaseProps) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock opportunities data - in production, this would come from an API
  const mockOpportunities: Opportunity[] = [
    {
      id: "1",
      title: "Software Engineer",
      location: "Bangalore, India",
      description: "Join our engineering team to build scalable solutions",
      tags: ["Remote", "Full-time"],
      type: "Engineering",
    },
    {
      id: "2",
      title: "Product Manager",
      location: "Mumbai, India",
      description: "Lead product strategy and development",
      tags: ["Hybrid", "Full-time"],
      type: "Product",
    },
    {
      id: "3",
      title: "Data Scientist Intern",
      location: "Delhi, India",
      description: "Work on AI/ML projects with our data team",
      tags: ["On-site", "Internship"],
      type: "Data Science",
    },
  ];

  useEffect(() => {
    // Load opportunities based on location filter
    if (selectedLocation) {
      const filtered = mockOpportunities.filter((opp) =>
        opp.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
      setOpportunities(filtered);
    } else {
      setOpportunities(mockOpportunities);
    }
  }, [selectedLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedLocation(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - DT Impression Showcase */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Welcome to DeepThought
              </h1>
              <p className="text-gray-700 text-lg leading-relaxed">
                DeepThought is a platform that enables learning, collaboration, and growth.
                We believe in empowering individuals to reach their full potential through
                structured processes and meaningful opportunities.
              </p>
            </motion.div>

            {/* Culture & Values */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Culture & Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: "🎯", title: "Focus", desc: "Deep work and meaningful impact" },
                  { icon: "🤝", title: "Collaboration", desc: "Together we achieve more" },
                  { icon: "📚", title: "Learning", desc: "Continuous growth mindset" },
                ].map((value, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center"
                  >
                    <div className="text-3xl mb-2">{value.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Media & Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Learn More About Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="#"
                  className="group flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold">Introduction Video</div>
                    <div className="text-sm text-blue-100">Watch our story</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <ExternalLink className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-gray-900">About DT Ecosystem</div>
                    <div className="text-sm text-gray-600">Explore our platform</div>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Section - Opportunity Discovery Grid */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Browse by Location */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Browse Opportunities
                </h3>
                
                {/* Location Search */}
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by location..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Search Opportunities
                  </button>
                </form>

                {/* Quick Filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Remote", "On-site", "Hybrid", "Internship", "Full-time"].map((filter) => (
                    <button
                      key={filter}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-colors"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Opportunity Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4 max-h-[600px] overflow-y-auto"
              >
                {opportunities.map((opp, idx) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{opp.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {opp.location}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">{opp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {opp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={onContinue}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  Explore New Opportunities
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
