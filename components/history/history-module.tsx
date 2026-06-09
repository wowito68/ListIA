"use client"

import { useState, useMemo } from "react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Download, Filter, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { SAMPLE_COURSES, SAMPLE_STUDENTS, generateAttendanceHistory } from "@/lib/sample-data"

const STATUS_DISPLAY = {
  present: { label: "Presente", className: "bg-primary/10 text-primary" },
  absent: { label: "Ausente", className: "bg-destructive/10 text-destructive" },
  late: { label: "Tardanza", className: "bg-warning/10 text-warning" },
  justified: { label: "Justificado", className: "bg-secondary text-secondary-foreground" },
}

export function HistoryModule() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7")

  // Generate mock history data
  const historyData = useMemo(
    () => generateAttendanceHistory(SAMPLE_STUDENTS, parseInt(selectedPeriod)),
    [selectedPeriod]
  )

  // Get unique dates
  const dates = useMemo(() => {
    const uniqueDates = [...new Set(historyData.map((r) => r.date))]
    return uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [historyData])

  // Filter students
  const filteredStudents = useMemo(() => {
    return SAMPLE_STUDENTS.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricula.includes(searchQuery)
    )
  }, [searchQuery])

  // Calculate stats for a student
  const getStudentStats = (studentId: string) => {
    const studentRecords = historyData.filter((r) => r.studentId === studentId)
    const total = studentRecords.length
    const present = studentRecords.filter((r) => r.status === "present").length
    const absent = studentRecords.filter((r) => r.status === "absent").length
    const late = studentRecords.filter((r) => r.status === "late").length
    const justified = studentRecords.filter((r) => r.status === "justified").length
    const attendanceRate = total > 0 ? Math.round(((present + late + justified) / total) * 100) : 0
    return { total, present, absent, late, justified, attendanceRate }
  }

  // Get status for a specific student and date
  const getStatusForDate = (studentId: string, date: string) => {
    const record = historyData.find(
      (r) => r.studentId === studentId && r.date === date
    )
    return record?.status || null
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 md:p-6">
      <div className="flex flex-col gap-4">
        {/* Header & Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Historial de Asistencia</h2>
            <p className="text-sm text-muted-foreground">
              Consulta y analiza el registro histórico de asistencia
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-9"
              />
            </div>

            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {SAMPLE_COURSES.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 size-4" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Última semana</SelectItem>
                <SelectItem value="14">Últimas 2 semanas</SelectItem>
                <SelectItem value="30">Último mes</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="mr-2 size-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Promedio General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">93.5%</div>
              <p className="text-xs text-muted-foreground">Asistencia</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dates.length}</div>
              <p className="text-xs text-muted-foreground">Días registrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estudiantes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{SAMPLE_STUDENTS.length}</div>
              <p className="text-xs text-muted-foreground">En el período</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">3</div>
              <p className="text-xs text-muted-foreground">Estudiantes en riesgo</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance Table */}
      <Card className="mt-4 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="sticky left-0 z-10 w-[200px] bg-card">
                  Estudiante
                </TableHead>
                <TableHead className="w-[80px] text-center">%</TableHead>
                {dates.slice(0, 7).map((date) => (
                  <TableHead key={date} className="w-[80px] text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs">
                        {format(new Date(date), "EEE", { locale: es })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(date), "d")}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const stats = getStudentStats(student.id)
                return (
                  <TableRow key={student.id}>
                    <TableCell className="sticky left-0 z-10 bg-card font-medium">
                      <div className="flex flex-col">
                        <span className="truncate">{student.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {student.matricula}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={stats.attendanceRate >= 80 ? "default" : "destructive"}
                        className="font-mono"
                      >
                        {stats.attendanceRate}%
                      </Badge>
                    </TableCell>
                    {dates.slice(0, 7).map((date) => {
                      const status = getStatusForDate(student.id, date)
                      if (!status) return <TableCell key={date} />
                      const display = STATUS_DISPLAY[status]
                      return (
                        <TableCell key={date} className="text-center">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", display.className)}
                          >
                            {status === "present" ? "P" : 
                             status === "absent" ? "A" :
                             status === "late" ? "T" : "J"}
                          </Badge>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}
