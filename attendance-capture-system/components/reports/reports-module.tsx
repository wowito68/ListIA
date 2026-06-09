"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Printer, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { SAMPLE_COURSES, SAMPLE_STUDENTS } from "@/lib/sample-data"

const attendanceByWeek = [
  { week: "Sem 1", present: 94, absent: 4, late: 2 },
  { week: "Sem 2", present: 91, absent: 6, late: 3 },
  { week: "Sem 3", present: 96, absent: 2, late: 2 },
  { week: "Sem 4", present: 93, absent: 5, late: 2 },
]

const statusDistribution = [
  { name: "Presente", value: 85, color: "var(--color-primary)" },
  { name: "Ausente", value: 8, color: "var(--color-destructive)" },
  { name: "Tardanza", value: 5, color: "var(--color-warning)" },
  { name: "Justificado", value: 2, color: "var(--color-muted)" },
]

const chartConfig = {
  present: { label: "Presente", color: "var(--color-primary)" },
  absent: { label: "Ausente", color: "var(--color-destructive)" },
  late: { label: "Tardanza", color: "var(--color-warning)" },
} satisfies ChartConfig

const reportTypes = [
  {
    id: "attendance-summary",
    title: "Resumen de Asistencia",
    description: "Resumen general de asistencia por grupo y período",
    icon: BarChart3,
  },
  {
    id: "student-report",
    title: "Reporte Individual",
    description: "Historial detallado de asistencia por estudiante",
    icon: FileText,
  },
  {
    id: "group-report",
    title: "Reporte de Grupo",
    description: "Estadísticas completas del grupo seleccionado",
    icon: FileSpreadsheet,
  },
]

// Mock data for students at risk
const studentsAtRisk = [
  { id: "5", name: "Rodríguez Sánchez, Lucía Fernanda", attendance: 72, absences: 8 },
  { id: "12", name: "Morales Ruiz, Emiliano", attendance: 75, absences: 7 },
  { id: "28", name: "Ibarra Contreras, Rodrigo", attendance: 78, absences: 6 },
]

export function ReportsModule() {
  const [selectedCourse, setSelectedCourse] = useState(SAMPLE_COURSES[0].id)
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const course = SAMPLE_COURSES.find((c) => c.id === selectedCourse)!

  return (
    <div className="flex h-full flex-col overflow-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Reportes y Análisis</h2>
            <p className="text-sm text-muted-foreground">
              Genera reportes detallados y analiza tendencias de asistencia
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar grupo" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_COURSES.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Cuatrimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Export Buttons */}
        <div className="flex flex-wrap gap-3">
          {reportTypes.map((report) => (
            <Card
              key={report.id}
              className="flex flex-1 min-w-[200px] cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-accent"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <report.icon className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{report.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {report.description}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="size-4" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="flex-1">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Weekly Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Asistencia Semanal</CardTitle>
                  <CardDescription>
                    Distribución de asistencia por semana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={attendanceByWeek} accessibilityLayer>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="week" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="present" fill="var(--color-present)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" fill="var(--color-absent)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="late" fill="var(--color-late)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Distribution Pie */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Estados</CardTitle>
                  <CardDescription>
                    Porcentaje por tipo de asistencia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {statusDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Asistencia</CardTitle>
                <CardDescription>
                  Análisis de patrones a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">
                        Promedio del Período
                      </div>
                      <div className="mt-1 text-2xl font-bold">93.5%</div>
                      <Badge variant="secondary" className="mt-2">
                        +2.1% vs anterior
                      </Badge>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">
                        Mejor Día
                      </div>
                      <div className="mt-1 text-2xl font-bold">Miércoles</div>
                      <span className="text-sm text-muted-foreground">96% promedio</span>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">
                        Ausencias Totales
                      </div>
                      <div className="mt-1 text-2xl font-bold">47</div>
                      <span className="text-sm text-muted-foreground">
                        En {course.students.length} estudiantes
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Visualización detallada de tendencias disponible en el reporte completo
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Estudiantes en Riesgo</CardTitle>
                <CardDescription>
                  Estudiantes con asistencia por debajo del 80%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {studentsAtRisk.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.absences} ausencias en el período
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <div className="mb-1 flex justify-between text-sm">
                            <span>Asistencia</span>
                            <span className="font-medium">{student.attendance}%</span>
                          </div>
                          <Progress value={student.attendance} className="h-2" />
                        </div>
                        <Badge variant="destructive">En riesgo</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline">
                    <Printer className="mr-2 size-4" />
                    Imprimir Lista
                  </Button>
                  <Button>
                    <Download className="mr-2 size-4" />
                    Exportar Reporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
