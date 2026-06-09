import { AppLayout } from "@/components/app-layout"
import { SettingsModule } from "@/components/settings/settings-module"

export default function ConfiguracionPage() {
  return (
    <AppLayout breadcrumbs={[{ title: "Sistema", href: "/" }, { title: "Configuración" }]}>
      <SettingsModule />
    </AppLayout>
  )
}
