import React from 'react';

const steps = [
  {
    number: 1,
    title: "Create Project & Add Tasks",
    description: "Start by creating a project and adding all your tasks with descriptions, assignees, and deadlines.",
    color: "bg-primary-400"
  },
  {
    number: 2,
    title: "Define Task Dependencies",
    description: "Establish relationships between tasks by defining which tasks depend on others to be completed first.",
    color: "bg-secondary-400"
  },
  {
    number: 3,
    title: "Visualize & Optimize",
    description: "Our system automatically generates an optimized visual graph of your project's task dependencies.",
    color: "bg-primary-400"
  },
  {
    number: 4,
    title: "Execute with Confidence",
    description: "Track progress, identify bottlenecks, and adapt your project plan as tasks are completed.",
    color: "bg-secondary-400"
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
          <p className="text-xl font-medium text-gray-700 mb-12 max-w-3xl mx-auto">
            Getting started with our project management tool is easy. Follow these simple steps 
            to transform your project planning experience.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-10 pb-12 last:pb-0">
              {/* Vertical line */}
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
              )}
              
              {/* Step circle */}
              <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${step.color} flex items-center justify-center text-white font-medium`}>
                {step.number}
              </div>
              
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;