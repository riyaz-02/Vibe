import React from 'react';
import { Users, Target, Award, Globe, Shield, Zap, Heart, Lightbulb } from 'lucide-react';

const About: React.FC = () => {
  const team = [
    {
      name: 'Sk Riyaz',
      role: 'CTO & Founder',
      image: 'https://i.postimg.cc/4dDgnC44/riyaz-profile-1.jpg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Full Stack Developer, MLH 2024 Hackathon Winner, Final Year Computer Science Undergrad.'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Integrity',
      description: 'Highest standards of integrity in our processes and product design. Our north star metric is your continued trust.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We set out to create innovative products that are not just different but also sector-defining. Generating high, impactful returns.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'Our investment products deliver outcomes that align with your values of progress and purpose. These values bind our community into a force of good.',
      color: 'from-green-500 to-green-600'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Active Users' },
    { number: '₹100Cr+', label: 'Loans Facilitated' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="https://i.postimg.cc/3NkJPPCj/4310527d-e957-40f6-b9e8-eefdb06219f3-1.png" 
                alt="Vibe Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              About <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Vibe</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              We're revolutionizing peer-to-peer lending by connecting students globally through secure, 
              AI-powered financial solutions built for the future.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To democratize access to financial services for students worldwide by creating a transparent, 
                secure, and inclusive peer-to-peer lending ecosystem powered by cutting-edge technology.
              </p>
              <p className="text-lg text-gray-600">
                We believe that every student deserves access to financial opportunities, regardless of their 
                background or location. Through Vibe, we're building bridges between those who need financial 
                support and those who can provide it.
              </p>
            </div>
            
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Students collaborating"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Vibe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center group"
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <value.icon className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Our Impact</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Numbers that showcase the trust our community has placed in us
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate individuals working together to revolutionize student finance
            </p>
          </div>

          <div className="flex justify-center">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-sm"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <div className="flex justify-center mb-6">
              <img 
                src="https://i.postimg.cc/3NkJPPCj/4310527d-e957-40f6-b9e8-eefdb06219f3-1.png" 
                alt="Vibe Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ready to Join the Vibe?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Be part of a community that's changing how students access financial opportunities worldwide.
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;