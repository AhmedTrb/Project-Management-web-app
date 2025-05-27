import React from 'react';

const features = [
  {
    title: "Interactive Dependency Graph",
    description: "Visualize tasks as nodes and dependencies as edges. Drag, zoom, and explore your project structure.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
    color: "bg-primary-100 text-primary-600"
  },
  {
    title: "Automated Task Sequencing",
    description: "Kahn's algorithm automatically determines optimal task execution order and identifies circular dependencies.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 8l4 4-4 4M7 16l-4-4 4-4M13 6l-2 12" />
      </svg>
    ),
    color: "bg-secondary-100 text-secondary-600"
  },
  {
    title: "Secure Team Collaboration",
    description: "Role-based access control with JWT authentication. Invite team members and manage permissions.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
    color: "bg-gray-100 text-gray-700"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-8 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="font-bold text-[4rem] md:text-4xl mb-4">Features</h2>
          <p className="font-light text-xl md:text-xl text-gray-600 max-w-2xl mx-auto">
            Our graph-based project management tool provides powerful features to help you visualize, 
            organize, and optimize your projects.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] border border-gray-200 bg-white"
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-600">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;