import React from "react";
import Image from "next/image";

const screenshots = [
  {
    title: "Project Graph View",
    description: "Visualize your entire project as an interactive dependency graph.",
    media: "/graphView.png",
  },
  {
    title: "Kanban Board View",
    description: "Track task progress with customizable workflow stages.",
    media: "/board.png",
  },
  {
    title: "Task Detail Modal",
    description: "Manage task details, dependencies, and comments in one place.",
    media: "/taskDetail.png",
  },
  {
    title: "Real-Time Messaging",
    description: "Send and receive messages instantly within your project workspace.",
    media: "/videos/real-time-messaging.mp4",
  },
  {
    title: "Gantt View & Rescheduling",
    description: "Drag tasks on the Gantt chart to reschedule. Changes propagate through dependencies.",
    media: "/videos/rescheduling-feature.mp4",
  },
];

// simple helper to detect video files
const isVideo = (url: string) =>
  /\.(mp4|webm|ogg)$/.test(url.toLowerCase());

const ScreenshotSection: React.FC = () => {
  return (
    <section id="screenshots" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Visualize Your Workflow
          </h2>
          <p className="text-xl font-medium text-gray-700 mb-12 max-w-3xl mx-auto">
            See how our tool transforms complex project dependencies into
            intuitive, actionable visualizations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {screenshots.map(({ title, description, media }, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 sm:h-64 bg-gray-100">
                {isVideo(media) ? (
                  <video
                    src={media}
                    preload="none"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={media}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 hover:scale-105"
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {title}
                </h3>
                <p className="text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScreenshotSection;
