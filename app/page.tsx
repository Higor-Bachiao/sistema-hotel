import { Suspense } from "react"
import HotelDashboard from "@/components/hotel-dashboard"
import { AuthProvider } from "@/contexts/auth-context"
import { HotelProvider } from "@/contexts/hotel-context"
import LoadingWrapper from "@/components/loading-wrapper"

export default function Home() {
  return (
    <LoadingWrapper>
      <AuthProvider>
        <HotelProvider>
          <div className="min-h-screen bg-gray-50">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <HotelDashboard />
            </Suspense>
          </div>
        </HotelProvider>
      </AuthProvider>
    </LoadingWrapper>
  )
}
