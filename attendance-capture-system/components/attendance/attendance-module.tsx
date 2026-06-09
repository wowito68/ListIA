"use client"

import { useState, useMemo } from "react"
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, Save, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AttendanceGrid } from "./attendance-grid"
import { KeyboardHelp } from "./keyboard-help"
import { SAMPLE_COURSES, SAMPLE_EVENTS } from "@/lib/sample-data"
import { cn } from "@/lib/utils"

const EVENT_DOT: Record<string, string> = {
  class: "bg-primary",
  exam: "bg-amber-400",
  deadline: "bg-destructive",
  holiday: "bg-muted-foreground",
}

export function AttendanceModule() {
  const [selectedCourseId, setSelectedCourseId] = useState(SAMPLE_COURSES[0].id)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const selectedCourse = SAMPLE_COURSES.find((c) => c.id === selectedCourseId)!

  const currentTime = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Calendar grid
  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
      }),
    [monthStart, monthEnd]
  )
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"]

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return SAMPLE_EVENTS.filter((e) => e.date === dateStr)
  }

  const selectedDateEvents = getEventsForDay(selectedDate)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const students = selectedCourse.students.map((s, index) => ({
    id: s.id,
    numero: index + 1,
    nombre: s.name,
    matricula: s.matricula,
  }))

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel: calendar ── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card/40">
        {/* Month nav */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-medium capitalize">
            {format(calendarMonth, "MMMM yyyy", { locale: es })}
          </span>
          <button
            onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 px-3 pt-2">
          {weekDays.map((d, i) => (
            <div
              key={i}
              className="text-center text-[10px] font-medium text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-3">
          {calendarDays.map((day, i) => {
            const inMonth = isSameMonth(day, calendarMonth)
            const isSelected = isSameDay(day, selectedDate)
            const isTodayDay = isToday(day)
            const events = getEventsForDay(day)

            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(day)
                  if (!isSameMonth(day, calendarMonth)) setCalendarMonth(day)
                }}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-lg py-1 transition-colors",
                  !inMonth && "opacity-30",
                  inMonth && !isSelected && "hover:bg-accent",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs",
                    isTodayDay && !isSelected && "font-semibold text-primary",
                    isSelected && "font-medium"
                  )}
                >
                  {format(day, "d")}
                </span>
                {/* Event dots */}
                {events.length > 0 && (
                  <div className="flex gap-0.5">
                    {events.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className={cn(
                          "h-1 w-1 rounded-full",
                          isSelected ? "bg-primary-foreground/70" : EVENT_DOT[ev.type]
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Today shortcut */}
        <div className="border-t border-border px-4 py-2">
          <button
            onClick={() => {
              setSelectedDate(new Date())
              setCalendarMonth(new Date())
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ir a hoy
          </button>
        </div>

        {/* Events for selected day */}
        <div className="flex-1 overflow-auto border-t border-border px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {format(selectedDate, "d 'de' MMMM", { locale: es })}
          </p>
          {selectedDateEvents.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {selectedDateEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-2 rounded-md border border-border bg-card px-2.5 py-2"
                >
                  <span
                    className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", EVENT_DOT[ev.type])}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{ev.title}</p>
                    {ev.description && (
                      <p className="truncate text-[10px] text-muted-foreground">{ev.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Sin eventos</p>
          )}
        </div>
      </aside>

      {/* ── Right panel: attendance ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 px-5 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-semibold text-foreground">
                  Control de Asistencia
                </h1>
                <Badge variant="secondary" className="font-normal text-xs">
                  <Clock className="mr-1 size-3" />
                  {currentTime}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground capitalize">
                {format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_COURSES.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <span className="font-medium">{course.code}</span>
                      <span className="ml-2 text-muted-foreground">{course.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <KeyboardHelp />
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="mr-2 size-3.5" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>

          {/* Course info bar */}
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              <span className="font-medium text-foreground">{selectedCourse.students.length}</span> estudiantes
            </span>
            <span className="h-3 w-px bg-border" />
            <span>{selectedCourse.section}</span>
            <span className="h-3 w-px bg-border" />
            <span>{selectedCourse.schedule}</span>
            <span className="h-3 w-px bg-border" />
            <span>{selectedCourse.room}</span>
          </div>
        </div>

        {/* Grid */}
        <AttendanceGrid students={students} />
      </div>
    </div>
  )
}
