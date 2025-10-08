'use client'

import { useState, useEffect } from 'react'
import { 
  Cog6ToothIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ServerIcon,
  CloudIcon,
  LockClosedIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  UserPlusIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  CogIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon,
  ClipboardDocumentIcon,
  HandRaisedIcon,
  BuildingOffice2Icon,
  TruckIcon as VehicleDispatchIcon,
  CalendarIcon,
  WrenchIcon,
  TagIcon as TagsIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: any
  items: SettingsItem[]
}

interface SettingsItem {
  id: string
  title: string
  description: string
  type: 'toggle' | 'input' | 'select' | 'button'
  value?: any
  options?: { value: string; label: string }[]
}

export default function SettingsPage() {
  const { themeMode } = useTheme()
  const [activeSection, setActiveSection] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      siteName: 'NeraFleet',
      siteDescription: 'Fleet Management System',
      timezone: 'GMT+0',
      language: 'en'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      loginAttempts: 5
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      maintenanceAlerts: true,
      fuelAlerts: true,
      insuranceAlerts: true
    },
    appearance: {
      theme: themeMode,
      sidebarCollapsed: false,
      compactMode: false,
      animations: true
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      backupFrequency: 'daily'
    }
  })

  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic application settings and preferences',
      icon: Cog6ToothIcon,
      items: [
        {
          id: 'siteName',
          title: 'Site Name',
          description: 'The name of your fleet management system',
          type: 'input',
          value: settings.general.siteName
        },
        {
          id: 'siteDescription',
          title: 'Site Description',
          description: 'A brief description of your system',
          type: 'input',
          value: settings.general.siteDescription
        },
        {
          id: 'timezone',
          title: 'Timezone',
          description: 'Default timezone for the application',
          type: 'select',
          value: settings.general.timezone,
          options: [
            { value: 'GMT+0', label: 'GMT+0 (UTC)' },
            { value: 'GMT+1', label: 'GMT+1 (CET)' },
            { value: 'GMT+2', label: 'GMT+2 (EET)' },
            { value: 'GMT+3', label: 'GMT+3 (MSK)' },
            { value: 'GMT-5', label: 'GMT-5 (EST)' },
            { value: 'GMT-8', label: 'GMT-8 (PST)' }
          ]
        },
        {
          id: 'language',
          title: 'Language',
          description: 'Default language for the interface',
          type: 'select',
          value: settings.general.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' }
          ]
        }
      ]
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Manage vehicle and equipment categories',
      icon: TagIcon,
      items: [
        {
          id: 'addCategory',
          title: 'Add New Category',
          description: 'Create a new vehicle or equipment category',
          type: 'button',
          value: 'Add Category'
        },
        {
          id: 'editCategory',
          title: 'Edit Categories',
          description: 'Modify existing categories',
          type: 'button',
          value: 'Edit Categories'
        }
      ]
    },
    {
      id: 'clusters',
      title: 'Clusters',
      description: 'Manage vehicle clusters and groupings',
      icon: CubeIcon,
      items: [
        {
          id: 'addCluster',
          title: 'Add New Cluster',
          description: 'Create a new vehicle cluster',
          type: 'button',
          value: 'Add Cluster'
        },
        {
          id: 'editCluster',
          title: 'Edit Clusters',
          description: 'Modify existing clusters',
          type: 'button',
          value: 'Edit Clusters'
        }
      ]
    },
    {
      id: 'groups',
      title: 'Groups',
      description: 'Manage user and vehicle groups',
      icon: UserGroupIcon,
      items: [
        {
          id: 'addGroup',
          title: 'Add New Group',
          description: 'Create a new user or vehicle group',
          type: 'button',
          value: 'Add Group'
        },
        {
          id: 'editGroup',
          title: 'Edit Groups',
          description: 'Modify existing groups',
          type: 'button',
          value: 'Edit Groups'
        }
      ]
    },
    {
      id: 'mechanics',
      title: 'Mechanics',
      description: 'Manage mechanic profiles and assignments',
      icon: WrenchScrewdriverIcon,
      items: [
        {
          id: 'addMechanic',
          title: 'Add New Mechanic',
          description: 'Register a new mechanic',
          type: 'button',
          value: 'Add Mechanic'
        },
        {
          id: 'editMechanic',
          title: 'Edit Mechanics',
          description: 'Modify mechanic profiles',
          type: 'button',
          value: 'Edit Mechanics'
        }
      ]
    },
    {
      id: 'permissions',
      title: 'Permissions',
      description: 'Manage user permissions and access control',
      icon: ShieldExclamationIcon,
      items: [
        {
          id: 'addPermission',
          title: 'Add New Permission',
          description: 'Create a new permission',
          type: 'button',
          value: 'Add Permission'
        },
        {
          id: 'editPermission',
          title: 'Edit Permissions',
          description: 'Modify existing permissions',
          type: 'button',
          value: 'Edit Permissions'
        }
      ]
    },
    {
      id: 'roles',
      title: 'Roles',
      description: 'Manage user roles and responsibilities',
      icon: UserCircleIcon,
      items: [
        {
          id: 'addRole',
          title: 'Add New Role',
          description: 'Create a new user role',
          type: 'button',
          value: 'Add Role'
        },
        {
          id: 'editRole',
          title: 'Edit Roles',
          description: 'Modify existing roles',
          type: 'button',
          value: 'Edit Roles'
        }
      ]
    },
    {
      id: 'sparePartDispatch',
      title: 'Spare Part Dispatch',
      description: 'Manage spare part dispatch operations',
      icon: DocumentArrowDownIcon,
      items: [
        {
          id: 'addDispatch',
          title: 'Add New Dispatch',
          description: 'Create a new spare part dispatch',
          type: 'button',
          value: 'Add Dispatch'
        },
        {
          id: 'editDispatch',
          title: 'Edit Dispatches',
          description: 'Modify existing dispatches',
          type: 'button',
          value: 'Edit Dispatches'
        }
      ]
    },
    {
      id: 'sparePartInventory',
      title: 'Spare Part Inventory',
      description: 'Manage spare part inventory levels',
      icon: ArchiveBoxIcon,
      items: [
        {
          id: 'addInventory',
          title: 'Add New Inventory Item',
          description: 'Add a new spare part to inventory',
          type: 'button',
          value: 'Add Item'
        },
        {
          id: 'editInventory',
          title: 'Edit Inventory',
          description: 'Modify inventory levels and details',
          type: 'button',
          value: 'Edit Inventory'
        }
      ]
    },
    {
      id: 'sparePartReceipt',
      title: 'Spare Part Receipt',
      description: 'Manage spare part receipts and deliveries',
      icon: DocumentArrowUpIcon,
      items: [
        {
          id: 'addReceipt',
          title: 'Add New Receipt',
          description: 'Record a new spare part receipt',
          type: 'button',
          value: 'Add Receipt'
        },
        {
          id: 'editReceipt',
          title: 'Edit Receipts',
          description: 'Modify existing receipts',
          type: 'button',
          value: 'Edit Receipts'
        }
      ]
    },
    {
      id: 'sparePartRequest',
      title: 'Spare Part Request',
      description: 'Manage spare part requests and approvals',
      icon: ClipboardDocumentIcon,
      items: [
        {
          id: 'addRequest',
          title: 'Add New Request',
          description: 'Create a new spare part request',
          type: 'button',
          value: 'Add Request'
        },
        {
          id: 'editRequest',
          title: 'Edit Requests',
          description: 'Modify existing requests',
          type: 'button',
          value: 'Edit Requests'
        }
      ]
    },
    {
      id: 'subsidiary',
      title: 'Subsidiary',
      description: 'Manage subsidiary companies and branches',
      icon: BuildingOffice2Icon,
      items: [
        {
          id: 'addSubsidiary',
          title: 'Add New Subsidiary',
          description: 'Register a new subsidiary company',
          type: 'button',
          value: 'Add Subsidiary'
        },
        {
          id: 'editSubsidiary',
          title: 'Edit Subsidiaries',
          description: 'Modify existing subsidiaries',
          type: 'button',
          value: 'Edit Subsidiaries'
        }
      ]
    },
    {
      id: 'supervisors',
      title: 'Supervisors',
      description: 'Manage supervisor profiles and assignments',
      icon: UserPlusIcon,
      items: [
        {
          id: 'addSupervisor',
          title: 'Add New Supervisor',
          description: 'Register a new supervisor',
          type: 'button',
          value: 'Add Supervisor'
        },
        {
          id: 'editSupervisor',
          title: 'Edit Supervisors',
          description: 'Modify supervisor profiles',
          type: 'button',
          value: 'Edit Supervisors'
        }
      ]
    },
    {
      id: 'tags',
      title: 'Tags',
      description: 'Manage tags for vehicles and equipment',
      icon: TagsIcon,
      items: [
        {
          id: 'addTag',
          title: 'Add New Tag',
          description: 'Create a new tag',
          type: 'button',
          value: 'Add Tag'
        },
        {
          id: 'editTag',
          title: 'Edit Tags',
          description: 'Modify existing tags',
          type: 'button',
          value: 'Edit Tags'
        }
      ]
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage user accounts and profiles',
      icon: UsersIcon,
      items: [
        {
          id: 'addUser',
          title: 'Add New User',
          description: 'Create a new user account',
          type: 'button',
          value: 'Add User'
        },
        {
          id: 'editUser',
          title: 'Edit Users',
          description: 'Modify existing user accounts',
          type: 'button',
          value: 'Edit Users'
        }
      ]
    },
    {
      id: 'companies',
      title: 'Companies',
      description: 'Manage company profiles and information',
      icon: BuildingOfficeIcon,
      items: [
        {
          id: 'addCompany',
          title: 'Add New Company',
          description: 'Register a new company',
          type: 'button',
          value: 'Add Company'
        },
        {
          id: 'editCompany',
          title: 'Edit Companies',
          description: 'Modify existing companies',
          type: 'button',
          value: 'Edit Companies'
        }
      ]
    },
    {
      id: 'vehicleDispatch',
      title: 'Vehicle Dispatch',
      description: 'Manage vehicle dispatch operations',
      icon: VehicleDispatchIcon,
      items: [
        {
          id: 'addVehicleDispatch',
          title: 'Add New Dispatch',
          description: 'Create a new vehicle dispatch',
          type: 'button',
          value: 'Add Dispatch'
        },
        {
          id: 'editVehicleDispatch',
          title: 'Edit Dispatches',
          description: 'Modify existing dispatches',
          type: 'button',
          value: 'Edit Dispatches'
        }
      ]
    },
    {
      id: 'vehicleMakes',
      title: 'Vehicle Makes',
      description: 'Manage vehicle manufacturers and makes',
      icon: TruckIcon,
      items: [
        {
          id: 'addVehicleMake',
          title: 'Add New Make',
          description: 'Add a new vehicle manufacturer',
          type: 'button',
          value: 'Add Make'
        },
        {
          id: 'editVehicleMake',
          title: 'Edit Makes',
          description: 'Modify existing vehicle makes',
          type: 'button',
          value: 'Edit Makes'
        }
      ]
    },
    {
      id: 'vehicleReservation',
      title: 'Vehicle Reservation',
      description: 'Manage vehicle reservations and bookings',
      icon: CalendarDaysIcon,
      items: [
        {
          id: 'addReservation',
          title: 'Add New Reservation',
          description: 'Create a new vehicle reservation',
          type: 'button',
          value: 'Add Reservation'
        },
        {
          id: 'editReservation',
          title: 'Edit Reservations',
          description: 'Modify existing reservations',
          type: 'button',
          value: 'Edit Reservations'
        }
      ]
    },
    {
      id: 'vehicleTypes',
      title: 'Vehicle Types',
      description: 'Manage vehicle types and classifications',
      icon: CogIcon,
      items: [
        {
          id: 'addVehicleType',
          title: 'Add New Type',
          description: 'Add a new vehicle type',
          type: 'button',
          value: 'Add Type'
        },
        {
          id: 'editVehicleType',
          title: 'Edit Types',
          description: 'Modify existing vehicle types',
          type: 'button',
          value: 'Edit Types'
        }
      ]
    },
    {
      id: 'workshops',
      title: 'Workshops',
      description: 'Manage workshop locations and services',
      icon: WrenchIcon,
      items: [
        {
          id: 'addWorkshop',
          title: 'Add New Workshop',
          description: 'Register a new workshop',
          type: 'button',
          value: 'Add Workshop'
        },
        {
          id: 'editWorkshop',
          title: 'Edit Workshops',
          description: 'Modify existing workshops',
          type: 'button',
          value: 'Edit Workshops'
        }
      ]
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Security and authentication preferences',
      icon: ShieldCheckIcon,
      items: [
        {
          id: 'twoFactorAuth',
          title: 'Two-Factor Authentication',
          description: 'Require 2FA for all user accounts',
          type: 'toggle',
          value: settings.security.twoFactorAuth
        },
        {
          id: 'sessionTimeout',
          title: 'Session Timeout',
          description: 'Minutes before session expires',
          type: 'input',
          value: settings.security.sessionTimeout
        },
        {
          id: 'passwordPolicy',
          title: 'Password Policy',
          description: 'Password strength requirements',
          type: 'select',
          value: settings.security.passwordPolicy,
          options: [
            { value: 'weak', label: 'Weak (6+ characters)' },
            { value: 'medium', label: 'Medium (8+ characters, mixed case)' },
            { value: 'strong', label: 'Strong (12+ characters, special chars)' }
          ]
        },
        {
          id: 'loginAttempts',
          title: 'Max Login Attempts',
          description: 'Maximum failed login attempts before lockout',
          type: 'input',
          value: settings.security.loginAttempts
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      description: 'Configure notification preferences',
      icon: BellIcon,
      items: [
        {
          id: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Send notifications via email',
          type: 'toggle',
          value: settings.notifications.emailNotifications
        },
        {
          id: 'pushNotifications',
          title: 'Push Notifications',
          description: 'Send browser push notifications',
          type: 'toggle',
          value: settings.notifications.pushNotifications
        },
        {
          id: 'maintenanceAlerts',
          title: 'Maintenance Alerts',
          description: 'Notify about upcoming maintenance',
          type: 'toggle',
          value: settings.notifications.maintenanceAlerts
        },
        {
          id: 'fuelAlerts',
          title: 'Fuel Alerts',
          description: 'Notify about fuel level warnings',
          type: 'toggle',
          value: settings.notifications.fuelAlerts
        },
        {
          id: 'insuranceAlerts',
          title: 'Insurance Alerts',
          description: 'Notify about insurance expiration',
          type: 'toggle',
          value: settings.notifications.insuranceAlerts
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance Settings',
      description: 'Customize the look and feel',
      icon: PaintBrushIcon,
      items: [
        {
          id: 'theme',
          title: 'Theme',
          description: 'Choose your preferred theme',
          type: 'select',
          value: settings.appearance.theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto (System)' }
          ]
        },
        {
          id: 'sidebarCollapsed',
          title: 'Collapsed Sidebar',
          description: 'Start with sidebar collapsed by default',
          type: 'toggle',
          value: settings.appearance.sidebarCollapsed
        },
        {
          id: 'compactMode',
          title: 'Compact Mode',
          description: 'Use compact spacing throughout the interface',
          type: 'toggle',
          value: settings.appearance.compactMode
        },
        {
          id: 'animations',
          title: 'Animations',
          description: 'Enable interface animations and transitions',
          type: 'toggle',
          value: settings.appearance.animations
        }
      ]
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Advanced system configuration',
      icon: ServerIcon,
      items: [
        {
          id: 'maintenanceMode',
          title: 'Maintenance Mode',
          description: 'Put the system in maintenance mode',
          type: 'toggle',
          value: settings.system.maintenanceMode
        },
        {
          id: 'debugMode',
          title: 'Debug Mode',
          description: 'Enable debug logging and error details',
          type: 'toggle',
          value: settings.system.debugMode
        },
        {
          id: 'logLevel',
          title: 'Log Level',
          description: 'Set the minimum log level',
          type: 'select',
          value: settings.system.logLevel,
          options: [
            { value: 'error', label: 'Error' },
            { value: 'warn', label: 'Warning' },
            { value: 'info', label: 'Info' },
            { value: 'debug', label: 'Debug' }
          ]
        },
        {
          id: 'backupFrequency',
          title: 'Backup Frequency',
          description: 'How often to create system backups',
          type: 'select',
          value: settings.system.backupFrequency,
          options: [
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ]
        }
      ]
    }
  ]

  const handleSettingChange = (section: string, itemId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [itemId]: value
      }
    }))
    setHasChanges(true)
    setSaveStatus('idle')
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Here you would typically save to your backend
      console.log('Saving settings:', settings)
      
      setSaveStatus('success')
      setHasChanges(false)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        general: {
          siteName: 'NeraFleet',
          siteDescription: 'Fleet Management System',
          timezone: 'GMT+0',
          language: 'en'
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordPolicy: 'strong',
          loginAttempts: 5
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          maintenanceAlerts: true,
          fuelAlerts: true,
          insuranceAlerts: true
        },
        appearance: {
          theme: themeMode,
          sidebarCollapsed: false,
          compactMode: false,
          animations: true
        },
        system: {
          maintenanceMode: false,
          debugMode: false,
          logLevel: 'info',
          backupFrequency: 'daily'
        }
      })
      setHasChanges(false)
      setSaveStatus('idle')
    }
  }

  const renderSettingItem = (item: SettingsItem, sectionId: string) => {
    const currentValue = settings[sectionId as keyof typeof settings][item.id as keyof typeof settings[typeof sectionId]]

    switch (item.type) {
      case 'toggle':
        return (
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.title}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
            </div>
            <div className="ml-4">
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentValue ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <input
                  type="checkbox"
                  checked={currentValue}
                  onChange={(e) => handleSettingChange(sectionId, item.id, e.target.checked)}
                  className="sr-only"
                />
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentValue ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </label>
        )

      case 'input':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              {item.title}
            </label>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.description}</div>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleSettingChange(sectionId, item.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-3xl text-sm ${
                themeMode === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-brand-500 focus:border-brand-500`}
            />
          </div>
        )

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              {item.title}
            </label>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.description}</div>
            <select
              value={currentValue}
              onChange={(e) => handleSettingChange(sectionId, item.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-3xl text-sm ${
                themeMode === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-brand-500 focus:border-brand-500`}
            >
              {item.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'button':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {item.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.description}</div>
            <button
              onClick={() => {
                // Handle button click - you can add specific logic here
                console.log(`Button clicked: ${item.id} in ${sectionId}`)
                // You could open modals, navigate to pages, etc.
              }}
              className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors text-sm font-medium"
            >
              {item.value}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <HorizonDashboardLayout>
      <div className={`space-y-6 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your application preferences and configuration</p>
          </div>
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                Unsaved changes
              </div>
            )}
            <button
              onClick={handleResetSettings}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving || !hasChanges}
              className={`px-4 py-2 rounded-3xl transition-colors flex items-center space-x-2 ${
                isSaving || !hasChanges
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-brand-500 text-white hover:bg-brand-600'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <XMarkIcon className="w-4 h-4" />
                  <span>Error</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {saveStatus === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-3xl p-4 flex items-center">
            <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-green-800 dark:text-green-200">Settings saved successfully!</span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-4 flex items-center">
            <XMarkIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
            <span className="text-red-800 dark:text-red-200">Failed to save settings. Please try again.</span>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className={`lg:col-span-1 p-4 rounded-2xl ${
          themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
        }`}>
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const IconComponent = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-3xl text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-brand-500 text-white'
                      : themeMode === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  <div>
                    <div className="text-sm font-medium">{section.title}</div>
                    <div className="text-xs opacity-75">{section.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className={`lg:col-span-3 p-6 rounded-2xl ${
          themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
        }`}>
          {settingsSections.map((section) => (
            activeSection === section.id && (
              <div key={section.id}>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{section.description}</p>
                </div>
                
                <div className="space-y-6">
                  {section.items.map((item) => (
                    <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                      {renderSettingItem(item, section.id)}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      </div>
    </HorizonDashboardLayout>
  )
}
