import { AppLayout } from "@/components/app-layout"
import { AttendanceModule } from "@/components/attendance/attendance-module"

export default function AsistenciaPage() {
  return (
    <AppLayout breadcrumbs={[{ title: "Clases", href: "/" }, { title: "Pasar Lista" }]}>
      <AttendanceModule />
    </AppLayout>
  )
}
