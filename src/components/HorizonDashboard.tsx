'use client'

import { useState } from 'react'
import { 
  Truck, 
  Users, 
  Fuel, 
  Wrench, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn, horizonClasses } from '@/lib/horizonUtils'

export default function HorizonDashboard() {
  const { themeMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    {
      title: 'Total Vehicles',
      value: '24',
      change: '+2.5%',
      changeType: 'positive',
      icon: Truck,
      color: 'bg-brand-500'
    },
    {
      title: 'Active Drivers',
      value: '18',
      change: '+1.2%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-brand-500'
    },
    {
      title: 'Fuel Consumption',
      value: '1,240L',
      change: '-3.1%',
      changeType: 'negative',
      icon: Fuel,
      color: 'bg-brand-500'
    },
    {
      title: 'Pending Repairs',
      value: '7',
      change: '+0.8%',
      changeType: 'positive',
      icon: Wrench,
      color: 'bg-brand-500'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'maintenance',
      title: 'Vehicle GE 1245-19 maintenance completed',
      time: '2 hours ago',
      status: 'completed',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'fuel',
      title: 'Fuel refill for Vehicle ABC 123',
      time: '4 hours ago',
      status: 'completed',
      icon: Fuel
    },
    {
      id: 3,
      type: 'repair',
      title: 'Repair request for Vehicle XYZ 789',
      time: '6 hours ago',
      status: 'pending',
      icon: Clock
    },
    {
      id: 4,
      type: 'alert',
      title: 'Maintenance due for Vehicle DEF 456',
      time: '1 day ago',
      status: 'warning',
      icon: AlertTriangle
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your fleet.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            themeMode === 'dark' 
              ? 'bg-navy-700 text-white hover:bg-navy-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            Export Report
          </button>
          <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            themeMode === 'dark' 
              ? 'bg-brand-500 text-white hover:bg-brand-600' 
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}>
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className={`p-6 rounded-xl border ${
              themeMode === 'dark' 
                ? 'bg-navy-800 border-navy-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className={cn('p-3 rounded-full', stat.color)}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-semibold text-navy-700 dark:text-white">{stat.value}</p>
                  <p className={cn(
                    'text-sm mt-1',
                    stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {stat.change} from last month
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className={`p-6 rounded-xl border ${
          themeMode === 'dark' 
            ? 'bg-navy-800 border-navy-700' 
            : 'bg-white border-gray-200'
        } lg:col-span-2`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-navy-700 dark:text-white">Recent Activities</h2>
            <button className="text-sm text-brand-500 hover:text-brand-600 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-lightPrimary dark:hover:bg-navy-700 transition-colors">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    activity.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                    activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-gray-100 dark:bg-navy-700'
                  )}>
                    <IconComponent className={cn(
                      'w-4 h-4',
                      activity.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      activity.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-600 dark:text-gray-400'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl border ${
          themeMode === 'dark' 
            ? 'bg-navy-800 border-navy-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-lg font-semibold text-navy-700 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className={`w-full justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              themeMode === 'dark' 
                ? 'bg-brand-500 text-white hover:bg-brand-600' 
                : 'bg-brand-500 text-white hover:bg-brand-600'
            } flex items-center`}>
              <Truck className="w-4 h-4 mr-2" />
              Add Vehicle
            </button>
            <button className={`w-full justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              themeMode === 'dark' 
                ? 'bg-navy-700 text-white hover:bg-navy-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } flex items-center`}>
              <Users className="w-4 h-4 mr-2" />
              Add Driver
            </button>
            <button className={`w-full justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              themeMode === 'dark' 
                ? 'bg-navy-700 text-white hover:bg-navy-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } flex items-center`}>
              <Fuel className="w-4 h-4 mr-2" />
              Log Fuel
            </button>
            <button className={`w-full justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              themeMode === 'dark' 
                ? 'bg-navy-700 text-white hover:bg-navy-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } flex items-center`}>
              <Wrench className="w-4 h-4 mr-2" />
              Schedule Repair
            </button>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className={`p-6 rounded-xl border ${
        themeMode === 'dark' 
          ? 'bg-navy-800 border-navy-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-navy-700 dark:text-white">Fleet Performance</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                activeTab === 'overview' 
                  ? 'bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-navy-700 dark:hover:text-white'
              )}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('trends')}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                activeTab === 'trends' 
                  ? 'bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-navy-700 dark:hover:text-white'
              )}
            >
              Trends
            </button>
          </div>
        </div>
        <div className="h-64 bg-lightPrimary dark:bg-navy-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Performance chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
