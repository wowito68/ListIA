"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle2, CalendarDays, BookOpen, Star } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const attendanceData = [
  { date: "Lun", presente: 32, ausente: 3 },
  { date: "Mar", presente: 30, ausente: 5 },
  { date: "Mié", presente: 33, ausente: 2 },
  { date: "Jue", presente: 31, ausente: 4 },
  { date: "Vie", presente: 29, ausente: 6 },
]

const weeklyTrend = [
  { week: "S1", asistencia: 94 },
  { week: "S2", asistencia: 91 },
  { week: "S3", asistencia: 96 },
  { week: "S4", asistencia: 93 },
  { week: "S5", asistencia: 95 },
  { week: "S6", asistencia: 92 },
]

const courseStats = [
  { name: "POO-501", subject: "Programación Orientada a Objetos", students: 35, attendance: 94, trend: "up" },
  { name: "BDA-502", subject: "Base de Datos Avanzada", students: 28, attendance: 91, trend: "down" },
  { name: "IA-601",  subject: "Inteligencia Artificial", students: 22, attendance: 96, trend: "up" },
]

const upcomingEvents = [
  { title: "Clase POO", time: "8:00 AM", type: "class" },
  { title: "Examen Parcial", time: "10:00 AM", type: "exam" },
  { title: "Entrega Proyecto", time: "11:59 PM", type: "deadline" },
]

const chartConfig = {
  presente: { label: "Presente", color: "var(--color-primary)" },
  ausente:  { label: "Ausente",  color: "var(--color-destructive)" },
  asistencia: { label: "Asistencia", color: "var(--color-primary)" },
} satisfies ChartConfig

const today = new Date()
const hour = today.getHours()
const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"

export function DashboardContent() {
  return (
    <div className="flex-1 overflow-auto">
      {/* ── Hero greeting ── */}
      <div className="bg-card/60 border-b border-border px-4 py-4 md:px-6 md:py-5">
        <p className="text-xs text-muted-foreground capitalize">
          {format(today, "EEEE, d 'de' MMMM yyyy", { locale: es })}
        </p>
        <h1 className="text-lg font-semibold text-foreground mt-0.5">
          {greeting}, Profesor 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Aquí está el resumen de tus grupos de hoy.
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">

        {/* ── Stat Cards 2×2 en móvil, 4 en fila en desktop ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10" />
            <CardHeader className="pb-1 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Estudiantes</CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                  <Users className="size-3.5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-3xl font-bold text-foreground">85</div>
              <p className="text-xs text-muted-foreground mt-0.5">3 grupos activos</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/10" />
            <CardHeader className="pb-1 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Asistencia</CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-3xl font-bold text-foreground">93.5%</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 rounded px-1 py-0.5">+2.1%</span>
                <span className="text-xs text-muted-foreground">vs mes ant.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/20 to-blue-500/5">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-500/10" />
            <CardHeader className="pb-1 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Clases Hoy</CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
                  <BookOpen className="size-3.5 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-3xl font-bold text-foreground">4</div>
              <p className="text-xs text-muted-foreground mt-0.5">de 12 esta semana</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500/20 to-red-500/5">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-red-500/10" />
            <CardHeader className="pb-1 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">En Riesgo</CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15">
                  <AlertCircle className="size-3.5 text-red-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-3xl font-bold text-foreground">3</div>
              <p className="text-xs text-muted-foreground mt-0.5">estudiantes críticos</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Asistencia Semanal</CardTitle>
              <CardDescription className="text-xs">Distribución de los últimos 5 días</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] md:h-[250px] w-full">
                <BarChart data={attendanceData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="presente" fill="var(--color-presente)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="ausente"  fill="var(--color-ausente)"  radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tendencia Mensual</CardTitle>
              <CardDescription className="text-xs">% de asistencia por semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] md:h-[250px] w-full">
                <AreaChart data={weeklyTrend} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[80, 100]} className="text-xs" />
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

        {/* ── Bottom Row ── */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Course Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Grupos Activos</CardTitle>
              <CardDescription className="text-xs">Estadísticas por grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {courseStats.map((course) => (
                  <div key={course.name} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm text-foreground">{course.name}</span>
                        <span className="text-[11px] text-muted-foreground truncate">{course.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className="text-sm font-bold">{course.attendance}%</span>
                        {course.trend === "up"
                          ? <TrendingUp className="size-3.5 text-emerald-500" />
                          : <TrendingDown className="size-3.5 text-red-500" />
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={course.attendance} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground tabular-nums w-16 text-right">
                        {course.students} alumnos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Próximos Eventos</CardTitle>
              <CardDescription className="text-xs">Actividades programadas para hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:bg-accent/30"
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        event.type === "class"
                          ? "bg-primary/10 text-primary"
                          : event.type === "exam"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {event.type === "class" ? (
                        <CheckCircle2 className="size-4" />
                      ) : event.type === "exam" ? (
                        <Star className="size-4" />
                      ) : (
                        <CalendarDays className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="size-3" />
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
                      className="text-[10px] shrink-0"
                    >
                      {event.type === "class" ? "Clase" : event.type === "exam" ? "Examen" : "Entrega"}
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
