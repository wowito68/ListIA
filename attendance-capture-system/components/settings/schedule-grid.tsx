"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const TIMES = [
  "07:00", "07:50", "08:40", "09:30", "10:20",
  "11:10", "12:00", "12:50", "13:40", "14:30",
  "15:20", "16:10", "17:00", "17:50", "18:40",
  "19:30", "20:20",
]

// Each slot maps to a time block (50-min class)
function getTimeRange(time: string) {
  const [h, m] = time.split(":").map(Number)
  const endMin = m + 50
  const endH = h + Math.floor(endMin / 60)
  const endM = endMin % 60
  return `${time} - ${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
}

export interface ScheduleSlot {
  day: string
  time: string
  courseId: string
  courseName: string
  color: string
}

const COURSE_COLORS = [
  { bg: "bg-primary/20 border-primary/50 text-primary", dot: "bg-primary" },
  { bg: "bg-blue-500/20 border-blue-500/50 text-blue-400", dot: "bg-blue-500" },
  { bg: "bg-purple-500/20 border-purple-500/50 text-purple-400", dot: "bg-purple-500" },
  { bg: "bg-orange-500/20 border-orange-500/50 text-orange-400", dot: "bg-orange-500" },
  { bg: "bg-pink-500/20 border-pink-500/50 text-pink-400", dot: "bg-pink-500" },
]

interface ScheduleGridProps {
  courses: { id: string; name: string; code: string }[]
  initialSlots?: ScheduleSlot[]
  onChange?: (slots: ScheduleSlot[]) => void
}

export function ScheduleGrid({ courses, initialSlots = [], onChange }: ScheduleGridProps) {
  const [slots, setSlots] = useState<ScheduleSlot[]>(initialSlots)
  const [activeCourse, setActiveCourse] = useState<string>(courses[0]?.id ?? "")
  const [isSelecting, setIsSelecting] = useState(false)
  const [dialog, setDialog] = useState<{ day: string; time: string } | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close dialog on outside click
  useEffect(() => {
    if (!dialog) return
    const handler = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setDialog(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [dialog])

  const getSlot = (day: string, time: string) =>
    slots.find((s) => s.day === day && s.time === time)

  const getCourseColor = (courseId: string) => {
    const idx = courses.findIndex((c) => c.id === courseId)
    return COURSE_COLORS[idx % COURSE_COLORS.length]
  }

  const toggleSlot = (day: string, time: string) => {
    const existing = getSlot(day, time)
    if (existing) {
      // Click on filled cell → open "change/remove" dialog
      setDialog({ day, time })
      return
    }
    // Click on empty cell → assign active course immediately
    const course = courses.find((c) => c.id === activeCourse)
    if (!course) return
    const color = getCourseColor(activeCourse).bg
    const updated = [...slots, { day, time, courseId: course.id, courseName: `${course.code}`, color }]
    setSlots(updated)
    onChange?.(updated)
  }

  const removeSlot = (day: string, time: string) => {
    const updated = slots.filter((s) => !(s.day === day && s.time === time))
    setSlots(updated)
    onChange?.(updated)
    setDialog(null)
  }

  const changeSlotCourse = (day: string, time: string, courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    if (!course) return
    const color = getCourseColor(courseId).bg
    const updated = slots.map((s) =>
      s.day === day && s.time === time
        ? { ...s, courseId: course.id, courseName: course.code, color }
        : s
    )
    setSlots(updated)
    onChange?.(updated)
    setDialog(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Course picker */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Asignando:</span>
        {courses.map((course, idx) => {
          const color = COURSE_COLORS[idx % COURSE_COLORS.length]
          return (
            <button
              key={course.id}
              onClick={() => setActiveCourse(course.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                activeCourse === course.id
                  ? color.bg + " ring-1 ring-offset-1 ring-offset-background"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <span className={cn("size-2 rounded-full", color.dot)} />
              {course.code}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-xs select-none">
          <thead>
            <tr>
              <th className="w-14 border-b border-r border-border bg-card px-2 py-2 text-right text-[10px] font-medium text-muted-foreground" />
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border-b border-r border-border bg-card px-3 py-2 text-center text-[11px] font-medium text-foreground last:border-r-0"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMES.map((time) => (
              <tr key={time}>
                <td className="border-b border-r border-border bg-card/50 px-2 py-0 text-right text-[10px] text-muted-foreground h-10 align-middle">
                  {time}
                </td>
                {DAYS.map((day) => {
                  const slot = getSlot(day, time)
                  const isActive = dialog?.day === day && dialog?.time === time
                  return (
                    <td
                      key={day}
                      className={cn(
                        "relative border-b border-r border-border last:border-r-0 h-10 cursor-pointer transition-colors",
                        slot
                          ? cn(slot.color, "border-opacity-50")
                          : "hover:bg-primary/5"
                      )}
                      onClick={() => toggleSlot(day, time)}
                    >
                      {slot && (
                        <div className="flex h-full items-center justify-center px-1">
                          <span className="truncate text-[10px] font-semibold leading-tight text-center">
                            {slot.courseName}
                            <br />
                            <span className="font-normal opacity-70 text-[9px]">{getTimeRange(time)}</span>
                          </span>
                        </div>
                      )}

                      {/* Inline dialog for existing slot */}
                      {isActive && (
                        <div
                          ref={dialogRef}
                          className="absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 rounded-lg border border-border bg-popover p-2 shadow-xl min-w-[160px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="mb-1.5 text-[10px] font-medium text-muted-foreground px-1">
                            Cambiar a:
                          </p>
                          {courses.map((c, idx) => {
                            const col = COURSE_COLORS[idx % COURSE_COLORS.length]
                            return (
                              <button
                                key={c.id}
                                onClick={() => changeSlotCourse(day, time, c.id)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent",
                                  slot?.courseId === c.id && "bg-accent"
                                )}
                              >
                                <span className={cn("size-2 rounded-full flex-shrink-0", col.dot)} />
                                {c.code} – {c.name}
                              </button>
                            )
                          })}
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => removeSlot(day, time)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10"
                          >
                            <X className="size-3" /> Quitar esta clase
                          </button>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Haz clic en una celda vacía para agregar clase • Haz clic en una clase existente para cambiarla o quitarla
      </p>
    </div>
  )
}
