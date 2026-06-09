"use client"

import { useState, useMemo, useEffect } from "react"
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
  subDays,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, Save, Users, AlertTriangle, Plus, WifiOff, Wifi, Maximize2, Minimize2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AttendanceGrid } from "./attendance-grid"
import { KeyboardHelp } from "./keyboard-help"
import { SAMPLE_COURSES, SAMPLE_EVENTS } from "@/lib/sample-data"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const EVENT_DOT: Record<string, string> = {
  class: "bg-blue-500",
  exam: "bg-amber-400",
  deadline: "bg-destructive",
  holiday: "bg-muted-foreground",
}

export function AttendanceModule() {
  const [selectedCourseId, setSelectedCourseId] = useState(SAMPLE_COURSES[0].id)
  const [events, setEvents] = useState(SAMPLE_EVENTS)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", description: "", type: "exam" as const })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isPreSaveDialogOpen, setIsPreSaveDialogOpen] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number | null>(null)
  const [currentStats, setCurrentStats] = useState({ asistencias: 0, noAsistencias: 0, retardos: 0, sinMarcar: 0, total: 0 })
  const [isOffline, setIsOffline] = useState(false)
  const [savedDates, setSavedDates] = useState<string[]>([
    format(subDays(new Date(), 1), "yyyy-MM-dd"),
    format(subDays(new Date(), 2), "yyyy-MM-dd"),
  ])
  const isMobile = useIsMobile()
  const [isFocusMode, setIsFocusMode] = useState(false)

  // Enable focus mode by default on mobile
  useEffect(() => {
    if (isMobile) setIsFocusMode(true)
  }, [isMobile])

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

  useEffect(() => {
    // Check initial status
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine)
    }

    const handleOnline = () => {
      setIsOffline(false)
      toast.success("Conexión restaurada", { description: "Sincronizando datos..." })
    }
    const handleOffline = () => {
      setIsOffline(true)
      toast.error("Sin conexión a internet", { description: "Trabajando en modo local. Los cambios se sincronizarán después." })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return events.filter(
      (e) => e.date === dateStr && (e.courseId === selectedCourseId || e.type === "holiday")
    )
  }

  const selectedDateEvents = getEventsForDay(selectedDate)

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) return
    const event = {
      id: Math.random().toString(),
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type as any,
      date: format(selectedDate, "yyyy-MM-dd"),
      courseId: newEvent.type === "holiday" ? undefined : selectedCourseId,
    }
    setEvents([...events, event])
    setIsEventDialogOpen(false)
    setNewEvent({ title: "", description: "", type: "exam" })
  }

  const handleSave = async () => {
    setIsPreSaveDialogOpen(true)
  }

  const handleConfirmPreSave = async () => {
    setIsPreSaveDialogOpen(false)
    if (!isToday(selectedDate)) {
      setIsConfirmDialogOpen(true)
      return
    }
    await performSave()
  }

  const handleDateSelect = (date: Date) => {
    if (hasUnsavedChanges) {
      setPendingDate(date)
      setIsConfirmDialogOpen(true)
    } else {
      setSelectedDate(date)
      setCalendarMonth(date)
    }
  }

  const performSave = async (silent = false) => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSaving(false)
    setIsConfirmDialogOpen(false)
    setHasUnsavedChanges(false)
    setPendingDate(null)
    setLastSavedAt(new Date())
    
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    if (!savedDates.includes(dateStr)) {
      setSavedDates((prev) => [...prev, dateStr])
    }

    if (!silent) {
      toast.success("Asistencia guardada", {
        description: `${format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} — registro guardado correctamente.`,
        duration: 4000,
      })
    } else {
      toast("Auto-guardado", {
        description: "Los cambios se guardaron automáticamente.",
        duration: 2500,
        icon: "💾",
      })
    }
  }

  const handleDiscardAndNavigate = () => {
    if (pendingDate) {
      setSelectedDate(pendingDate)
      setCalendarMonth(pendingDate)
      setHasUnsavedChanges(false)
      setPendingDate(null)
    }
    setIsConfirmDialogOpen(false)
  }

  // Auto-save every 3 minutes when there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setAutoSaveCountdown(null)
      return
    }

    const INTERVAL_SEC = 180
    setAutoSaveCountdown(INTERVAL_SEC)

    const tick = setInterval(() => {
      setAutoSaveCountdown(prev => {
        if (prev === null || prev <= 1) {
          performSave(true)
          return INTERVAL_SEC
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, selectedDate])

  // Update hasUnsavedChanges when date changes
  useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    setHasUnsavedChanges(!savedDates.includes(dateStr))
  }, [selectedDate, savedDates])

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (!isSaving) {
          handleSave()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedDate, isSaving])

  // Mock accumulated absences — seeded from student id for consistency
  const MOCK_FALTAS: Record<string, number> = {
    "1": 1, "2": 0, "3": 3, "4": 2, "5": 4,
    "6": 0, "7": 1, "8": 3, "9": 0, "10": 2,
    "11": 5, "12": 0, "13": 1, "14": 3, "15": 0,
    "16": 2, "17": 0, "18": 1, "19": 4, "20": 0,
    "21": 1, "22": 0, "23": 3, "24": 2, "25": 0,
    "26": 1, "27": 0, "28": 2, "29": 1, "30": 3,
    "31": 0, "32": 4, "33": 1, "34": 0, "35": 2,
  }

  const students = [...selectedCourse.students]
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
    .map((s, index) => ({
      id: s.id,
      numero: index + 1,
      nombre: s.name,
      matricula: s.matricula,
      faltasAcumuladas: MOCK_FALTAS[s.id] ?? 0,
    }))

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Left panel: calendar ── */}
      {!isFocusMode && (
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card/40 transition-all duration-300">
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
            const dateStr = format(day, "yyyy-MM-dd")
            const isSaved = savedDates.includes(dateStr)

            return (
              <button
                key={i}
                onClick={() => {
                  handleDateSelect(day)
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
                {/* Event dots & Saved indicator */}
                {(events.length > 0 || isSaved) && (
                  <div className="flex gap-0.5">
                    {isSaved && (
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isSelected ? "bg-emerald-300" : "bg-emerald-500"
                        )}
                        title="Asistencia registrada"
                      />
                    )}
                    {events.slice(0, isSaved ? 2 : 3).map((ev) => (
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
        <div className="flex-1 flex flex-col overflow-auto border-t border-border px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </p>
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex h-6 items-center gap-1 rounded bg-secondary/80 px-2 text-[10px] font-medium text-foreground hover:bg-secondary transition-colors border border-border">
                  <Plus className="size-3" />
                  Añadir
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Añadir evento al {format(selectedDate, "d 'de' MMMM", { locale: es })}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Ej. Examen Parcial"
                      autoFocus
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo de evento</Label>
                    <Select value={newEvent.type} onValueChange={(val: any) => setNewEvent({ ...newEvent, type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exam">Examen</SelectItem>
                        <SelectItem value="deadline">Entrega / Fecha límite</SelectItem>
                        <SelectItem value="holiday">Día Festivo (Aplica a todos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Descripción (Opcional)</Label>
                    <Textarea
                      id="desc"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateEvent} disabled={!newEvent.title.trim()}>Guardar evento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
      )}

      {/* ── Right panel: attendance ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 px-5 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-base font-semibold text-foreground">
                    Control de Asistencia
                  </h1>
                  <Badge variant="secondary" className="font-normal text-xs">
                    <Clock className="mr-1 size-3" />
                    {currentTime}
                  </Badge>
                </div>
                {isOffline && (
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
                    <WifiOff className="h-3 w-3" />
                    <span>Sin conexión (Modo Local)</span>
                  </div>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="text-sm text-muted-foreground capitalize">
                  {format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </p>
                {isToday(selectedDate) && (
                  <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20 font-medium text-[10px] uppercase tracking-wider px-1.5 py-0">
                    Hoy
                  </Badge>
                )}
              </div>
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
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0"
                onClick={() => setIsFocusMode(!isFocusMode)}
                title={isFocusMode ? "Salir de modo concentración" : "Modo concentración"}
              >
                {isFocusMode ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving} 
                size="sm"
                className="relative"
              >
                {hasUnsavedChanges && !isSaving && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-background" />
                )}
                <Save className="mr-2 size-3.5" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>

              {/* Auto-save indicator */}
              {hasUnsavedChanges && autoSaveCountdown !== null && !isSaving && (
                <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                  Auto en {Math.floor(autoSaveCountdown / 60)}:{String(autoSaveCountdown % 60).padStart(2, "0")}
                </span>
              )}
              {lastSavedAt && !hasUnsavedChanges && (
                <span className="text-[10px] text-emerald-600/70 dark:text-emerald-500/60">
                  Guardado {format(lastSavedAt, "HH:mm")}
                </span>
              )}
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

          {/* Warning Banner */}
          {!isToday(selectedDate) && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
              <div className="flex items-center gap-2.5 text-sm text-amber-700 dark:text-amber-500">
                <AlertTriangle className="size-4" />
                <p>
                  Estás editando el registro del <span className="font-semibold">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</span> — no es la clase de hoy.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 border-amber-500/20 bg-background text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:bg-background dark:text-amber-500 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                onClick={() => {
                  setSelectedDate(new Date())
                  setCalendarMonth(new Date())
                }}
              >
                Ir a hoy
              </Button>
            </div>
          )}
        </div>

        {/* Grid */}
        <AttendanceGrid 
          students={students} 
          hasUnsavedChanges={hasUnsavedChanges}
          onAttendanceChange={() => setHasUnsavedChanges(true)}
          onStatsChange={setCurrentStats}
        />
        
        {/* Pre-Save Confirmation Dialog */}
        <AlertDialog open={isPreSaveDialogOpen} onOpenChange={setIsPreSaveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resumen de Asistencia</AlertDialogTitle>
              <AlertDialogDescription>
                Revisa los datos antes de guardar el registro para el <span className="font-semibold text-foreground">{format(selectedDate, "d 'de' MMMM", { locale: es })}</span>.
              </AlertDialogDescription>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{currentStats.asistencias}</div>
                  <div className="text-xs font-medium text-emerald-600/80 dark:text-emerald-500/80">Asistencias</div>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-500">{currentStats.noAsistencias}</div>
                  <div className="text-xs font-medium text-red-600/80 dark:text-red-500/80">Faltas</div>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{currentStats.retardos}</div>
                  <div className="text-xs font-medium text-amber-600/80 dark:text-amber-500/80">Retardos</div>
                </div>
                <div className={cn("rounded-lg border p-3 text-center", currentStats.sinMarcar > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-muted/50")}>
                  <div className={cn("text-2xl font-bold", currentStats.sinMarcar > 0 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground")}>{currentStats.sinMarcar}</div>
                  <div className="text-xs font-medium text-muted-foreground">Pendientes</div>
                </div>
              </div>
              {currentStats.sinMarcar > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/15 px-3 py-2 text-sm text-amber-700 dark:text-amber-500">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <p>Faltan <strong>{currentStats.sinMarcar}</strong> alumnos por marcar. ¿Estás seguro de que deseas guardar el registro incompleto?</p>
                </div>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel>Volver a la lista</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPreSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Confirmar y Guardar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              {pendingDate ? (
                <>
                  <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tienes cambios sin guardar en el registro del <span className="font-semibold text-foreground">{format(selectedDate, "d 'de' MMMM", { locale: es })}</span>. ¿Qué deseas hacer?
                  </AlertDialogDescription>
                </>
              ) : (
                <>
                  <AlertDialogTitle>¿Guardar en una fecha distinta a hoy?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vas a guardar la asistencia para el <span className="font-semibold text-foreground">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</span>, no para hoy. ¿Estás seguro de continuar?
                  </AlertDialogDescription>
                </>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              {pendingDate ? (
                <>
                  <AlertDialogCancel onClick={() => { setPendingDate(null) }}>Cancelar</AlertDialogCancel>
                  <button
                    onClick={handleDiscardAndNavigate}
                    className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/80"
                  >
                    Descartar cambios
                  </button>
                  <AlertDialogAction onClick={async () => { await performSave(); if(pendingDate){setSelectedDate(pendingDate); setCalendarMonth(pendingDate); setPendingDate(null)} }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Guardar y continuar
                  </AlertDialogAction>
                </>
              ) : (
                <>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={performSave} className="bg-amber-600 hover:bg-amber-700 text-white">
                    Sí, guardar asistencia
                  </AlertDialogAction>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
