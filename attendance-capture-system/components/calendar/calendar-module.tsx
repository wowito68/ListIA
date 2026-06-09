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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SAMPLE_EVENTS, SAMPLE_COURSES } from "@/lib/sample-data"
import type { CalendarEvent } from "@/lib/types"

const EVENT_COLORS = {
  class: "bg-primary/20 text-primary border-primary/30",
  exam: "bg-warning/20 text-warning border-warning/30",
  deadline: "bg-destructive/20 text-destructive border-destructive/30",
  holiday: "bg-muted text-muted-foreground border-muted-foreground/30",
}

const EVENT_LABELS = {
  class: "Clase",
  exam: "Examen",
  deadline: "Entrega",
  holiday: "Festivo",
}

export function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  )

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    const dateStr = format(date, "yyyy-MM-dd")
    return SAMPLE_EVENTS.filter((event) => event.date === dateStr)
  }

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : []

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 md:p-6">
      <div className="grid h-full gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b pb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid flex-1 grid-cols-7 grid-rows-6">
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "group relative flex min-h-[80px] flex-col border-b border-r p-1 text-left transition-colors hover:bg-accent",
                      !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                      isSelected && "bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full text-sm",
                        isTodayDate &&
                          "bg-primary font-medium text-primary-foreground",
                        isSelected && !isTodayDate && "bg-accent-foreground/10"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-xs",
                            EVENT_COLORS[event.type]
                          )}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} más
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Selected Day Events */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                {selectedDate
                  ? format(selectedDate, "d 'de' MMMM", { locale: es })
                  : "Selecciona una fecha"}
              </CardTitle>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {selectedDateEvents.map((event) => {
                    const course = SAMPLE_COURSES.find(
                      (c) => c.id === event.courseId
                    )
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded-lg border p-3",
                          EVENT_COLORS[event.type]
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {EVENT_LABELS[event.type]}
                          </Badge>
                        </div>
                        {course && (
                          <p className="mt-1 text-sm opacity-80">
                            {course.code} - {course.name}
                          </p>
                        )}
                        {event.description && (
                          <p className="mt-1 text-sm opacity-70">
                            {event.description}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay eventos para este día
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {SAMPLE_EVENTS.filter(
                  (e) => new Date(e.date) >= new Date()
                )
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{event.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.date), "d MMM", { locale: es })}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          event.type === "class" && "bg-primary",
                          event.type === "exam" && "bg-warning",
                          event.type === "deadline" && "bg-destructive",
                          event.type === "holiday" && "bg-muted-foreground"
                        )}
                      />
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
