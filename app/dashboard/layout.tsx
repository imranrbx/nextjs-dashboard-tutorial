import SideNav from '@/app/ui/dashboard/sidenav';
import getServerSession from "next-auth";
import { authConfig } from "@/auth.config"
import { redirect } from 'next/navigation';
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = getServerSession(authConfig)
  const isLoggedIn = !!(await session.auth())?.user
  const user = (await session.auth())?.user
  if (!isLoggedIn) {
    redirect('/login')
  }
  if (user?.role !== "ADMIN") {
    redirect('/account/orders')
  }
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  )
}
export default DashboardLayout