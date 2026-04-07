import {
  SparklesIcon,
  ChatAlt2Icon,
  VideoCameraIcon,
  UserGroupIcon,
  GlobeIcon,
} from "@heroicons/react/outline";

export default function About() {
  const features = [
    {
      icon: <ChatAlt2Icon className="w-6 h-6" />,
      title: "Real-time Chat",
      description: "Instant messaging with real-time notifications and updates",
    },
    {
      icon: <VideoCameraIcon className="w-6 h-6" />,
      title: "Video Calling",
      description: "High-quality peer-to-peer video calls with your contacts",
    },
    {
      icon: <UserGroupIcon className="w-6 h-6" />,
      title: "User Management",
      description: "Easy profile management and user discovery",
    },
    {
      icon: <GlobeIcon className="w-6 h-6" />,
      title: "Global Community",
      description: "Connect with users from around the world",
    },
  ];

  const team = [
    {
      name: "Development Team",
      role: "Full Stack Development",
      description: "Building the core platform and ensuring quality",
    },
    {
      name: "Design Team",
      role: "UI/UX Design",
      description: "Creating intuitive and beautiful user interfaces",
    },
    {
      name: "Operations",
      role: "Infrastructure & Support",
      description: "Maintaining servers and supporting users",
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-surface-50 dark:bg-gray-950">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-2xl shadow-lg mb-6">
            LC
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Let's Chat
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            A modern real-time chat application for seamless communication
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Let's Chat is an open-source messaging platform that brings people
            together through real-time communication, video calling, and a
            community-driven approach to connection.
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Features Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <SparklesIcon className="w-8 h-8 text-primary-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Key Features
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Technology Stack */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Frontend
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• React.js - UI Framework</li>
                  <li>• Tailwind CSS - Styling</li>
                  <li>• Firebase Auth - Authentication</li>
                  <li>• React Router - Navigation</li>
                  <li>• Heroicons - Icons</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Backend
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Node.js - Runtime</li>
                  <li>• Express.js - Framework</li>
                  <li>• MongoDB - Database</li>
                  <li>• Firebase - Real-time Services</li>
                  <li>• WebRTC - Video Calling</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-xl mb-4 mx-auto">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-primary-500 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Mission Section */}
          <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
              At Let's Chat, we believe that communication should be simple,
              secure, and accessible to everyone. Our mission is to provide a
              modern platform that empowers people to connect with one another
              through real-time messaging and high-quality video calls.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              We are committed to building a community-driven platform that
              prioritizes user privacy, security, and an exceptional user
              experience.
            </p>
          </section>

          {/* Version Info */}
          <section className="text-center pb-12">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Version 1.0.0</span> • Built with
              ❤️ by the Let's Chat Team
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              © 2024 Let's Chat. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
