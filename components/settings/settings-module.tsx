"use client"

import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SAMPLE_COURSES } from "@/lib/sample-data"
import { ScheduleGrid } from "./schedule-grid"

export function SettingsModule() {
  return (
    <div className="flex h-full flex-col overflow-auto p-4 md:p-6">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <CalendarDays className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Horario Semanal</h2>
            <p className="text-sm text-muted-foreground">
              Haz clic en las celdas para marcar tus clases por materia y bloque
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cuadrícula de Horario</CardTitle>
            <CardDescription className="text-xs">
              Selecciona una materia y luego toca los bloques de tiempo correspondientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            <ScheduleGrid
              courses={SAMPLE_COURSES.map((c) => ({
                id: c.id,
                name: c.name,
                code: c.code,
              }))}
              initialSlots={[
                { day: "Lunes",     time: "08:40", courseId: "1", courseName: "POO-501", color: "bg-primary/20 border-primary/50 text-primary" },
                { day: "Miércoles", time: "08:40", courseId: "1", courseName: "POO-501", color: "bg-primary/20 border-primary/50 text-primary" },
                { day: "Martes",    time: "10:20", courseId: "2", courseName: "BDA-502", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
                { day: "Jueves",    time: "10:20", courseId: "2", courseName: "BDA-502", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
                { day: "Viernes",   time: "14:00", courseId: "3", courseName: "IA-601",  color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
                { day: "Viernes",   time: "14:50", courseId: "3", courseName: "IA-601",  color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
              ]}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
