import { useState } from "react";
import {
  QuestionMarkCircleIcon,
  ChatAlt2Icon,
  VideoCameraIcon,
  SearchIcon,
  MailIcon,
} from "@heroicons/react/outline";

export default function Help() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I start a new conversation?",
      answer:
        "Click on the 'Chats' section in the sidebar or click the compose button to select a user from your contacts to start a new chat.",
    },
    {
      id: 2,
      question: "How do I make a video call?",
      answer:
        "Open a chat with a user and click the video call icon in the chat header. The recipient will receive a call notification and can accept or decline the call.",
    },
    {
      id: 3,
      question: "Can I search for specific messages?",
      answer:
        "Use the search functionality to find messages, users, or conversations. Type in the search bar and select from the results.",
    },
    {
      id: 4,
      question: "How do I update my profile?",
      answer:
        "Click on your profile icon in the sidebar or go to the Profile section to update your display name and avatar.",
    },
    {
      id: 5,
      question: "Is my data secure?",
      answer:
        "Your data is encrypted and stored securely using Firebase. We use industry-standard security practices to protect your information.",
    },
    {
      id: 6,
      question: "Can I delete my account?",
      answer:
        "Currently, account deletion is not available through the app settings. Please contact our support team for assistance with account deletion.",
    },
  ];

  const features = [
    {
      icon: <ChatAlt2Icon className="w-8 h-8" />,
      title: "Real-time Messaging",
      description:
        "Send and receive messages instantly with real-time updates and notifications.",
    },
    {
      icon: <VideoCameraIcon className="w-8 h-8" />,
      title: "Video Calling",
      description:
        "Make high-quality video calls directly within the app with your contacts.",
    },
    {
      icon: <SearchIcon className="w-8 h-8" />,
      title: "Search & Filter",
      description:
        "Easily search through your conversations and find messages quickly.",
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-surface-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <QuestionMarkCircleIcon className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Help & Support
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions and learn how to use the app
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Features Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Getting Started
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-500 text-white font-semibold text-sm">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Create an Account
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Sign up with your email and create a profile with your
                    display name and avatar.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-500 text-white font-semibold text-sm">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Start Chatting
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Visit the Chats section to view all users and start messaging
                    with them.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-500 text-white font-semibold text-sm">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Make Video Calls
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Click the video call icon in any chat to initiate a video call
                    with that user.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-left font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </span>
                    <span
                      className={`text-primary-500 transition-transform ${
                        expandedFaq === faq.id ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Still Need Help?
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-start gap-4">
                <MailIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Contact Support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    If you can't find the answer you're looking for, please
                    contact our support team.
                  </p>
                  <a
                    href="mailto:support@letschat.com"
                    className="inline-block px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Email Support
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
