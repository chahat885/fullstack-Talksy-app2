import React from "react";
import { MessageSquareHeart, Image, Zap, Users } from "lucide-react";

const features = [
  {
    title: "One-to-One Messaging",
    icon: <MessageSquareHeart className="w-6 h-6 text-primary" />,
    description: "Chat privately with anyone in real-time, fast and easily.",
  },
  {
    title: "Send and Receive Images",
    icon: <Image className="w-6 h-6 text-primary" />,
    description: "Share images effortlessly with just a few clicks.",
  },
  {
    title: "Real-Time Communication",
    icon: <Zap className="w-6 h-6 text-primary" />,
    description: "Built with Socket.io for instant and smooth messaging.",
  },
  {
    title: "Minimal & Clean UI",
    icon: <Users className="w-6 h-6 text-primary" />,
    description: "Designed to be distraction-free and fast across all devices.",
  },
];

const About = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-4xl w-full bg-base-100 rounded-xl shadow-md p-10 space-y-10 text-center">
        <h1 className="text-4xl font-bold text-primary">About Talksy</h1>
        <p className="text-base-content/80 max-w-3xl mx-auto">
          <strong>Talksy</strong> is a modern chat application for real-time, one-on-one conversations. Whether you're chatting with friends, family, or colleagues, Chatty makes communication smooth, expressive, and simple.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 text-left">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-base-200 p-6 rounded-xl shadow flex items-start gap-4"
            >
              {feature.icon}
              <div>
                <h3 className="font-semibold text-lg text-base-content">{feature.title}</h3>
                <p className="text-sm text-base-content/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-sm text-base-content/60 ">
        &copy; {currentYear} Talksy. All rights reserved. | Contact:{" "}
        <a
          href="mailto:talksy.app.contact@gmail.com"
          className="text-primary hover:underline"
        >
          <span >talksy.app.contact@gmail.com</span>
        </a>
      </footer>
    </div>
  );
};

export default About;
