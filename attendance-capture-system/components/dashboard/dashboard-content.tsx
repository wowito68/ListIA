"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Clock, AlertCircle, CheckCircle2, CalendarDays } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const attendanceData = [
  { date: "Lun", presente: 32, ausente: 3 },
  { date: "Mar", presente: 30, ausente: 5 },
  { date: "Mié", presente: 33, ausente: 2 },
  { date: "Jue", presente: 31, ausente: 4 },
  { date: "Vie", presente: 29, ausente: 6 },
]

const weeklyTrend = [
  { week: "Sem 1", asistencia: 94 },
  { week: "Sem 2", asistencia: 91 },
  { week: "Sem 3", asistencia: 96 },
  { week: "Sem 4", asistencia: 93 },
  { week: "Sem 5", asistencia: 95 },
  { week: "Sem 6", asistencia: 92 },
]

const courseStats = [
  { name: "POO-501", students: 35, attendance: 94, trend: "up" },
  { name: "BDA-502", students: 28, attendance: 91, trend: "down" },
  { name: "IA-601", students: 22, attendance: 96, trend: "up" },
]

const upcomingEvents = [
  { title: "Clase POO", time: "8:00 AM", type: "class" },
  { title: "Examen Parcial", time: "10:00 AM", type: "exam" },
  { title: "Entrega Proyecto", time: "11:59 PM", type: "deadline" },
]

const chartConfig = {
  presente: {
    label: "Presente",
    color: "var(--color-primary)",
  },
  ausente: {
    label: "Ausente",
    color: "var(--color-destructive)",
  },
  asistencia: {
    label: "Asistencia",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function DashboardContent() {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Estudiantes Totales
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85</div>
              <p className="text-xs text-muted-foreground">
                En 3 grupos activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Asistencia Promedio
              </CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">93.5%</div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  +2.1%
                </Badge>
                <span className="text-xs text-muted-foreground">
                  vs mes anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Clases Esta Semana
              </CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                4 completadas hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas Activas
              </CardTitle>
              <AlertCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Estudiantes en riesgo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Asistencia Semanal</CardTitle>
              <CardDescription>
                Distribución de asistencia de los últimos 5 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={attendanceData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="presente"
                    fill="var(--color-presente)"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="ausente"
                    fill="var(--color-ausente)"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
              <CardDescription>
                Porcentaje de asistencia por semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={weeklyTrend} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[80, 100]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="asistencia"
                    fill="var(--color-asistencia)"
                    fillOpacity={0.3}
                    stroke="var(--color-asistencia)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Grupos Activos</CardTitle>
              <CardDescription>
                Estadísticas de asistencia por grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {courseStats.map((course) => (
                  <div key={course.name} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{course.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {course.students} alumnos
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {course.attendance}%
                        </span>
                        {course.trend === "up" ? (
                          <TrendingUp className="size-4 text-primary" />
                        ) : (
                          <TrendingUp className="size-4 rotate-180 text-destructive" />
                        )}
                      </div>
                    </div>
                    <Progress value={course.attendance} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Actividades programadas para hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${
                        event.type === "class"
                          ? "bg-primary/10 text-primary"
                          : event.type === "exam"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {event.type === "class" ? (
                        <CheckCircle2 className="size-5" />
                      ) : event.type === "exam" ? (
                        <AlertCircle className="size-5" />
                      ) : (
                        <CalendarDays className="size-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.time}
                      </p>
                    </div>
                    <Badge
                      variant={
                        event.type === "class"
                          ? "secondary"
                          : event.type === "exam"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {event.type === "class"
                        ? "Clase"
                        : event.type === "exam"
                        ? "Examen"
                        : "Entrega"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
