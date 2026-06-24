import { AppLayout } from "@/components/app-layout"
import { JustificationsModule } from "@/components/justifications/justifications-module"

export default function JustificantesPage() {
  return (
    <AppLayout breadcrumbs={[{ title: "Registros", href: "/" }, { title: "Justificantes" }]}>
      <JustificationsModule />
    </AppLayout>
  )
}
