import { AppLayout } from "@/components/app-layout"
import { HistorialReportesModule } from "@/components/historial-reportes/historial-reportes-module"

export default function HistorialPage() {
  return (
    <AppLayout breadcrumbs={[{ title: "Registros", href: "/" }, { title: "Historial & Reportes" }]}>
      <HistorialReportesModule />
    </AppLayout>
  )
}
