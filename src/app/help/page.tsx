'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ServerIcon
} from '@heroicons/react/24/outline'

export default function HelpPage() {
  const { themeMode } = useTheme()
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources'>('faq')

  const faqs = [
    {
      question: 'How do I add a new vehicle to the fleet?',
      answer: 'Navigate to the Vehicles page and click the "Add Vehicle" button. Fill in all required information including registration number, make, model, and other details.'
    },
    {
      question: 'How do I track a vehicle in real-time?',
      answer: 'Go to the Live Tracking section or select a vehicle from the fleet map on the dashboard. You can see the current location, speed, and status of any vehicle.'
    },
    {
      question: 'How do I generate reports?',
      answer: 'Visit the Reports page and select the type of report you need (Vehicle Registration, Road-Worthy, Insurance, etc.). Choose your filters and click "Generate" to create the report.'
    },
    {
      question: 'How do I manage driver licenses?',
      answer: 'Go to the Drivers management page where you can view driver information, update license details, and track license expiration dates.'
    },
    {
      question: 'What is the fleet distribution chart showing?',
      answer: 'The fleet distribution chart shows the breakdown of vehicles by fuel type (Petrol vs Diesel) based on your fuel log data.'
    },
    {
      question: 'How do I add maintenance records?',
      answer: 'Navigate to the Maintenance page and click "Add Maintenance". Fill in the vehicle details, service type, cost, and date information.'
    },
    {
      question: 'How do I manage user permissions?',
      answer: 'As an admin, go to Settings > Permissions to manage user access levels and configure what each user role can do in the system.'
    },
    {
      question: 'How do I change my theme color and mode?',
      answer: 'Click the floating settings icon at the bottom right of the dashboard to access theme customization options including color schemes and dark/light mode.'
    }
  ]

  const resources = [
    {
      title: 'User Guide',
      description: 'Complete guide to using NeraFleet',
      icon: BookOpenIcon,
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video tutorials',
      icon: VideoCameraIcon,
      link: '#'
    },
    {
      title: 'API Documentation',
      description: 'Integration guide for developers',
      icon: DocumentTextIcon,
      link: '#'
    },
    {
      title: 'System Requirements',
      description: 'Check system requirements and compatibility',
      icon: ServerIcon,
      link: '#'
    }
  ]

  const getIconComponent = (Icon: any) => {
    return Icon
  }

  return (
    <HorizonDashboardLayout>
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600" />
              <h1 className={`text-3xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Help & Support
              </h1>
            </div>
            <p className={`text-lg ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Get help, ask questions, and find resources
            </p>
          </div>

          {/* Tabs */}
          <div className={`rounded-xl border border-gray-200 dark:border-gray-700 ${
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-sm mb-6`}>
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'faq'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'resources'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Resources
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'contact'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* FAQ Content */}
          {activeTab === 'faq' && (
            <div className={`rounded-xl border border-gray-200 dark:border-gray-700 ${
              themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-sm p-6`}>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 transition-colors"
                  >
                    <summary className="flex items-center justify-between cursor-pointer">
                      <span className={`font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {faq.question}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className={`mt-3 text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Resources Content */}
          {activeTab === 'resources' && (
            <div className={`rounded-xl border border-gray-200 dark:border-gray-700 ${
              themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-sm p-6`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resource, index) => {
                  const Icon = resource.icon
                  return (
                    <a
                      key={index}
                      href={resource.link}
                      className={`flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors ${
                        themeMode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {resource.title}
                        </h3>
                        <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {resource.description}
                        </p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Contact Content */}
          {activeTab === 'contact' && (
            <div className={`rounded-xl border border-gray-200 dark:border-gray-700 ${
              themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-sm p-6`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Get in Touch
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <PhoneIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Phone
                        </p>
                        <p className={`${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          +233 (0) 24 123 4567
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Email
                        </p>
                        <p className={`${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          support@nerafleet.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Support Hours
                        </p>
                        <p className={`${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Monday - Friday: 8:00 AM - 5:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Send a Message
                  </h3>
                  <form className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Name
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          themeMode === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          themeMode === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message
                      </label>
                      <textarea
                        rows={4}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          themeMode === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="How can we help you?"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 rounded-3xl font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </HorizonDashboardLayout>
  )
}

