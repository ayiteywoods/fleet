import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import FleetDashboard from '@/components/FleetDashboard'

export default function Home() {
  return (
    <HorizonDashboardLayout>
      <FleetDashboard />
    </HorizonDashboardLayout>
  )
}
