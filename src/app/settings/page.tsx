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
  TagIcon as TagsIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import CategoriesModal from '@/components/CategoriesModal'
import ClustersModal from '@/components/ClustersModal'
import VehicleMakesModal from '@/components/VehicleMakesModal'
import VehicleModelsModal from '@/components/VehicleModelsModal'
import SubsidiaryModal from '@/components/SubsidiaryModal'
import GroupsModal from '@/components/GroupsModal'
import SupervisorsModal from '@/components/SupervisorsModal'
import WorkshopsModal from '@/components/WorkshopsModal'
import MechanicsModal from '@/components/MechanicsModal'
import PermissionsModal from '@/components/PermissionsModal'
import RolesModal from '@/components/RolesModal'
import TagsModal from '@/components/TagsModal'
import VehicleDispatchModal from '@/components/VehicleDispatchModal'
import VehicleReservationModal from '@/components/VehicleReservationModal'
import VehicleTypesModal from '@/components/VehicleTypesModal'
import SparePartDispatchModal from '@/components/SparePartDispatchModal'
import SparePartInventoryModal from '@/components/SparePartInventoryModal'
import SparePartRequestModal from '@/components/SparePartRequestModal'
import SparePartReceiptModal from '@/components/SparePartReceiptModal'
import CompaniesModal from '@/components/CompaniesModal'
import UsersModal from '@/components/UsersModal'

interface SettingCard {
  id: string
  title: string
  description: string
  icon: any
  modalComponent?: string
}

export default function SettingsPage() {
  const { themeMode } = useTheme()
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [showClustersModal, setShowClustersModal] = useState(false)
  const [showVehicleMakesModal, setShowVehicleMakesModal] = useState(false)
  const [showVehicleModelsModal, setShowVehicleModelsModal] = useState(false)
  const [showSubsidiaryModal, setShowSubsidiaryModal] = useState(false)
  const [showGroupsModal, setShowGroupsModal] = useState(false)
  const [showSupervisorsModal, setShowSupervisorsModal] = useState(false)
  const [showWorkshopsModal, setShowWorkshopsModal] = useState(false)
  const [showMechanicsModal, setShowMechanicsModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [showVehicleDispatchModal, setShowVehicleDispatchModal] = useState(false)
  const [showVehicleReservationModal, setShowVehicleReservationModal] = useState(false)
  const [showVehicleTypesModal, setShowVehicleTypesModal] = useState(false)
  const [showSparePartDispatchModal, setShowSparePartDispatchModal] = useState(false)
  const [showSparePartInventoryModal, setShowSparePartInventoryModal] = useState(false)
  const [showSparePartRequestModal, setShowSparePartRequestModal] = useState(false)
  const [showSparePartReceiptModal, setShowSparePartReceiptModal] = useState(false)
  const [showCompaniesModal, setShowCompaniesModal] = useState(false)
  const [showUsersModal, setShowUsersModal] = useState(false)

  const settingCards: SettingCard[] = [
    {
      id: 'general',
      title: 'General',
      description: 'Basic application settings and preferences',
      icon: Cog6ToothIcon,
      modalComponent: 'GeneralSettingsModal'
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Manage vehicle and equipment categories',
      icon: TagIcon,
      modalComponent: 'CategoriesModal'
    },
    {
      id: 'clusters',
      title: 'Clusters',
      description: 'Manage vehicle clusters and groupings',
      icon: CubeIcon,
      modalComponent: 'ClustersModal'
    },
    {
      id: 'groups',
      title: 'Groups',
      description: 'Manage user and vehicle groups',
      icon: UserGroupIcon,
      modalComponent: 'GroupsModal'
    },
    {
      id: 'mechanics',
      title: 'Mechanics',
      description: 'Manage mechanic profiles and assignments',
      icon: WrenchScrewdriverIcon,
      modalComponent: 'MechanicsModal'
    },
    {
      id: 'permissions',
      title: 'Permissions',
      description: 'Manage user permissions and access control',
      icon: ShieldExclamationIcon,
      modalComponent: 'PermissionsModal'
    },
    {
      id: 'roles',
      title: 'Roles',
      description: 'Manage user roles and responsibilities',
      icon: UserCircleIcon,
      modalComponent: 'RolesModal'
    },
    {
      id: 'sparePartDispatch',
      title: 'Dispatch',
      description: 'Manage spare part dispatch operations',
      icon: DocumentArrowDownIcon,
      modalComponent: 'SparePartDispatchModal'
    },
    {
      id: 'sparePartInventory',
      title: 'Inventory',
      description: 'Manage spare part inventory levels',
      icon: ArchiveBoxIcon,
      modalComponent: 'SparePartInventoryModal'
    },
    {
      id: 'sparePartReceipt',
      title: 'Receipt',
      description: 'Manage spare part receipts and deliveries',
      icon: DocumentArrowUpIcon,
      modalComponent: 'SparePartReceiptModal'
    },
    {
      id: 'sparePartRequest',
      title: 'Request',
      description: 'Manage spare part requests and approvals',
      icon: ClipboardDocumentIcon,
      modalComponent: 'SparePartRequestModal'
    },
    {
      id: 'subsidiary',
      title: 'Subsidiary',
      description: 'Manage subsidiary companies and branches',
      icon: BuildingOffice2Icon,
      modalComponent: 'SubsidiaryModal'
    },
    {
      id: 'supervisors',
      title: 'Supervisors',
      description: 'Manage supervisor profiles and assignments',
      icon: UserPlusIcon,
      modalComponent: 'SupervisorsModal'
    },
    {
      id: 'tags',
      title: 'Tags',
      description: 'Manage tags for vehicles and equipment',
      icon: TagsIcon,
      modalComponent: 'TagsModal'
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage user accounts and profiles',
      icon: UsersIcon,
      modalComponent: 'UsersModal'
    },
    {
      id: 'companies',
      title: 'Companies',
      description: 'Manage company profiles and information',
      icon: BuildingOfficeIcon,
      modalComponent: 'CompaniesModal'
    },
    {
      id: 'vehicleDispatch',
      title: 'Dispatch',
      description: 'Manage vehicle dispatch operations',
      icon: VehicleDispatchIcon,
      modalComponent: 'VehicleDispatchModal'
    },
    {
      id: 'vehicleMakes',
      title: 'Makes',
      description: 'Manage vehicle manufacturers and makes',
      icon: TruckIcon,
      modalComponent: 'VehicleMakesModal'
    },
    {
      id: 'vehicleModels',
      title: 'Models',
      description: 'Manage vehicle models and variants',
      icon: TruckIcon,
      modalComponent: 'VehicleModelsModal'
    },
    {
      id: 'vehicleReservation',
      title: 'Reservation',
      description: 'Manage vehicle reservations and bookings',
      icon: CalendarDaysIcon,
      modalComponent: 'VehicleReservationModal'
    },
    {
      id: 'vehicleTypes',
      title: 'Types',
      description: 'Manage vehicle types and classifications',
      icon: CogIcon,
      modalComponent: 'VehicleTypesModal'
    },
    {
      id: 'workshops',
      title: 'Workshops',
      description: 'Manage workshop locations and services',
      icon: WrenchIcon,
      modalComponent: 'WorkshopsModal'
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Security and authentication preferences',
      icon: ShieldCheckIcon,
      modalComponent: 'SecuritySettingsModal'
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      description: 'Configure notification preferences',
      icon: BellIcon,
      modalComponent: 'NotificationSettingsModal'
    },
    {
      id: 'appearance',
      title: 'Appearance Settings',
      description: 'Customize the look and feel',
      icon: PaintBrushIcon,
      modalComponent: 'AppearanceSettingsModal'
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Advanced system configuration',
      icon: ServerIcon,
      modalComponent: 'SystemSettingsModal'
    }
  ]

  const handleSettingClick = (settingId: string) => {
    if (settingId === 'categories') {
      setShowCategoriesModal(true)
    } else if (settingId === 'clusters') {
      setShowClustersModal(true)
    } else if (settingId === 'vehicleMakes') {
      setShowVehicleMakesModal(true)
    } else if (settingId === 'vehicleModels') {
      setShowVehicleModelsModal(true)
    } else if (settingId === 'subsidiary') {
      setShowSubsidiaryModal(true)
    } else if (settingId === 'groups') {
      setShowGroupsModal(true)
    } else if (settingId === 'supervisors') {
      setShowSupervisorsModal(true)
    } else if (settingId === 'workshops') {
      setShowWorkshopsModal(true)
    } else if (settingId === 'mechanics') {
      setShowMechanicsModal(true)
    } else if (settingId === 'permissions') {
      setShowPermissionsModal(true)
    } else if (settingId === 'roles') {
      setShowRolesModal(true)
    } else if (settingId === 'tags') {
      setShowTagsModal(true)
    } else if (settingId === 'vehicleDispatch') {
      setShowVehicleDispatchModal(true)
    } else if (settingId === 'vehicleReservation') {
      setShowVehicleReservationModal(true)
    } else if (settingId === 'vehicleTypes') {
      setShowVehicleTypesModal(true)
    } else if (settingId === 'sparePartDispatch') {
      setShowSparePartDispatchModal(true)
    } else if (settingId === 'sparePartInventory') {
      setShowSparePartInventoryModal(true)
    } else if (settingId === 'sparePartRequest') {
      setShowSparePartRequestModal(true)
    } else if (settingId === 'sparePartReceipt') {
      setShowSparePartReceiptModal(true)
    } else if (settingId === 'companies') {
      setShowCompaniesModal(true)
    } else if (settingId === 'users') {
      setShowUsersModal(true)
    } else {
      setSelectedSetting(settingId)
      // Here you would open the appropriate modal
      console.log(`Opening modal for: ${settingId}`)
    }
  }

  return (
    <HorizonDashboardLayout>
      <div className={`space-y-6 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Settings Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your application preferences and configuration</p>
          </div>
          <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>

        {/* Settings Grid */}
        <div className="space-y-12">
          {/* Fleet Management Section */}
          <div>
            <div className="flex items-center mb-6">
              <h2 className={`text-lg font-semibold flex-shrink-0 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Fleet Management
              </h2>
              <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ml-0">
              {settingCards.filter(card => 
                ['general', 'categories', 'clusters', 'groups', 'mechanics', 'permissions', 'roles', 'tags'].includes(card.id)
              ).map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSettingClick(card.id)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      themeMode === 'dark' 
                        ? 'bg-navy-800 hover:bg-navy-700 border border-navy-700' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${
                        themeMode === 'dark' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 flex justify-between items-center ${
                          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          <span>{card.title}</span>
                          <button
                            onClick={() => handleSettingClick(card.id)}
                            className={`text-xs font-medium hover:underline flex items-center gap-1 ${
                              themeMode === 'dark' ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'
                            }`}
                          >
                            Manage
                            <ChevronRightIcon className="w-3 h-3" />
                          </button>
                        </h3>
                        <p className={`text-sm ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vehicle Operations Section */}
          <div>
            <div className="flex items-center mb-6">
              <h2 className={`text-lg font-semibold flex-shrink-0 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Vehicle Operations
              </h2>
              <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ml-0">
              {settingCards.filter(card => 
                ['vehicleDispatch', 'vehicleMakes', 'vehicleModels', 'vehicleReservation', 'vehicleTypes'].includes(card.id)
              ).map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSettingClick(card.id)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      themeMode === 'dark' 
                        ? 'bg-navy-800 hover:bg-navy-700 border border-navy-700' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${
                        themeMode === 'dark' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 flex justify-between items-center ${
                          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          <span>{card.title}</span>
                          <button
                            onClick={() => handleSettingClick(card.id)}
                            className={`text-xs font-medium hover:underline flex items-center gap-1 ${
                              themeMode === 'dark' ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'
                            }`}
                          >
                            Manage
                            <ChevronRightIcon className="w-3 h-3" />
                          </button>
                        </h3>
                        <p className={`text-sm ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Spare Parts Management Section */}
          <div>
            <div className="flex items-center mb-6">
              <h2 className={`text-lg font-semibold flex-shrink-0 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Spare Parts Management
              </h2>
              <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ml-0">
              {settingCards.filter(card => 
                ['sparePartDispatch', 'sparePartInventory', 'sparePartReceipt', 'sparePartRequest'].includes(card.id)
              ).map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSettingClick(card.id)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      themeMode === 'dark' 
                        ? 'bg-navy-800 hover:bg-navy-700 border border-navy-700' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${
                        themeMode === 'dark' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 flex justify-between items-center ${
                          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          <span>{card.title}</span>
                          <button
                            onClick={() => handleSettingClick(card.id)}
                            className={`text-xs font-medium hover:underline flex items-center gap-1 ${
                              themeMode === 'dark' ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'
                            }`}
                          >
                            Manage
                            <ChevronRightIcon className="w-3 h-3" />
                          </button>
                        </h3>
                        <p className={`text-sm ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* User & Company Management Section */}
          <div>
            <div className="flex items-center mb-6">
              <h2 className={`text-lg font-semibold flex-shrink-0 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                User & Company Management
              </h2>
              <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ml-0">
              {settingCards.filter(card => 
                ['subsidiary', 'supervisors', 'users', 'companies'].includes(card.id)
              ).map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSettingClick(card.id)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      themeMode === 'dark' 
                        ? 'bg-navy-800 hover:bg-navy-700 border border-navy-700' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${
                        themeMode === 'dark' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 flex justify-between items-center ${
                          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          <span>{card.title}</span>
                          <button
                            onClick={() => handleSettingClick(card.id)}
                            className={`text-xs font-medium hover:underline flex items-center gap-1 ${
                              themeMode === 'dark' ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'
                            }`}
                          >
                            Manage
                            <ChevronRightIcon className="w-3 h-3" />
                          </button>
                        </h3>
                        <p className={`text-sm ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* System Configuration Section */}
          <div>
            <div className="flex items-center mb-6">
              <h2 className={`text-lg font-semibold flex-shrink-0 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                System Configuration
              </h2>
              <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ml-0">
              {settingCards.filter(card => 
                ['workshops'].includes(card.id)
              ).map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSettingClick(card.id)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      themeMode === 'dark' 
                        ? 'bg-navy-800 hover:bg-navy-700 border border-navy-700' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${
                        themeMode === 'dark' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 flex justify-between items-center ${
                          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          <span>{card.title}</span>
                          <button
                            onClick={() => handleSettingClick(card.id)}
                            className={`text-xs font-medium hover:underline flex items-center gap-1 ${
                              themeMode === 'dark' ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'
                            }`}
                          >
                            Manage
                            <ChevronRightIcon className="w-3 h-3" />
                          </button>
                        </h3>
                        <p className={`text-sm ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modal Placeholder */}
        {selectedSetting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-2xl max-w-md w-full mx-4 ${
              themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {settingCards.find(card => card.id === selectedSetting)?.title}
                </h2>
                <button
                  onClick={() => setSelectedSetting(null)}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-sm mb-6 ${
                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {settingCards.find(card => card.id === selectedSetting)?.description}
              </p>
              <div className="text-center">
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Modal functionality will be implemented here
                </p>
                <button
                  onClick={() => setSelectedSetting(null)}
                  className={`mt-4 px-4 py-2 rounded-2xl transition-colors ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Modal */}
        <CategoriesModal
          isOpen={showCategoriesModal}
          onClose={() => setShowCategoriesModal(false)}
        />

        {/* Clusters Modal */}
        <ClustersModal
          isOpen={showClustersModal}
          onClose={() => setShowClustersModal(false)}
        />

        {/* Vehicle Makes Modal */}
        <VehicleMakesModal
          isOpen={showVehicleMakesModal}
          onClose={() => setShowVehicleMakesModal(false)}
        />

        {/* Vehicle Models Modal */}
        <VehicleModelsModal
          isOpen={showVehicleModelsModal}
          onClose={() => setShowVehicleModelsModal(false)}
        />

        {/* Subsidiary Modal */}
        <SubsidiaryModal
          isOpen={showSubsidiaryModal}
          onClose={() => setShowSubsidiaryModal(false)}
        />
        <GroupsModal
          isOpen={showGroupsModal}
          onClose={() => setShowGroupsModal(false)}
        />
        <SupervisorsModal
          isOpen={showSupervisorsModal}
          onClose={() => setShowSupervisorsModal(false)}
        />
        <WorkshopsModal
          isOpen={showWorkshopsModal}
          onClose={() => setShowWorkshopsModal(false)}
        />
        <MechanicsModal
          isOpen={showMechanicsModal}
          onClose={() => setShowMechanicsModal(false)}
        />
        <PermissionsModal
          isOpen={showPermissionsModal}
          onClose={() => setShowPermissionsModal(false)}
        />
        <RolesModal
          isOpen={showRolesModal}
          onClose={() => setShowRolesModal(false)}
        />
        <TagsModal
          isOpen={showTagsModal}
          onClose={() => setShowTagsModal(false)}
        />
        <VehicleDispatchModal
          isOpen={showVehicleDispatchModal}
          onClose={() => setShowVehicleDispatchModal(false)}
        />
        <VehicleReservationModal
          isOpen={showVehicleReservationModal}
          onClose={() => setShowVehicleReservationModal(false)}
        />
        <VehicleTypesModal
          isOpen={showVehicleTypesModal}
          onClose={() => setShowVehicleTypesModal(false)}
        />
        <SparePartDispatchModal
          isOpen={showSparePartDispatchModal}
          onClose={() => setShowSparePartDispatchModal(false)}
        />
        <SparePartInventoryModal
          isOpen={showSparePartInventoryModal}
          onClose={() => setShowSparePartInventoryModal(false)}
        />
        <SparePartRequestModal
          isOpen={showSparePartRequestModal}
          onClose={() => setShowSparePartRequestModal(false)}
        />
        <SparePartReceiptModal
          isOpen={showSparePartReceiptModal}
          onClose={() => setShowSparePartReceiptModal(false)}
        />
        <CompaniesModal
          isOpen={showCompaniesModal}
          onClose={() => setShowCompaniesModal(false)}
        />
        <UsersModal
          isOpen={showUsersModal}
          onClose={() => setShowUsersModal(false)}
        />
      </div>
    </HorizonDashboardLayout>
  )
}
