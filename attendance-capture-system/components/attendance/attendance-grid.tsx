"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, X, Clock, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export type AttendanceStatus = "asistencia" | "no_asistencia" | "retardo" | "sin_marcar"

export interface Student {
  id: string
  numero: number
  nombre: string
  matricula: string
}

interface AttendanceGridProps {
  students: Student[]
  onAttendanceChange?: (studentId: string, status: AttendanceStatus) => void
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; icon: React.ReactNode; className: string; shortcut: string; dotColor: string }
> = {
  asistencia: {
    label: "Asistencia",
    icon: <Check className="h-3.5 w-3.5" />,
    className:
      "bg-emerald-500/15 text-emerald-500 border-emerald-500/40 hover:bg-emerald-500/25",
    shortcut: "A",
    dotColor: "bg-emerald-500",
  },
  no_asistencia: {
    label: "No asistió",
    icon: <X className="h-3.5 w-3.5" />,
    className: "bg-red-500/15 text-red-400 border-red-500/40 hover:bg-red-500/25",
    shortcut: "N",
    dotColor: "bg-red-500",
  },
  retardo: {
    label: "Retardo",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25",
    shortcut: "R",
    dotColor: "bg-amber-500",
  },
  sin_marcar: {
    label: "Pendiente",
    icon: <Minus className="h-3.5 w-3.5" />,
    className:
      "bg-secondary text-muted-foreground border-border hover:bg-accent",
    shortcut: "—",
    dotColor: "bg-muted-foreground/40",
  },
}

const STATUS_ORDER: AttendanceStatus[] = ["sin_marcar", "asistencia", "no_asistencia", "retardo"]

export function AttendanceGrid({ students, onAttendanceChange }: AttendanceGridProps) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {}
    students.forEach((s) => { initial[s.id] = "sin_marcar" })
    return initial
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(true)
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

  const cycleStatus = useCallback(
    (studentId: string, direction: 1 | -1 = 1) => {
      setAttendance((prev) => {
        const currentIndex = STATUS_ORDER.indexOf(prev[studentId])
        const newStatus =
          STATUS_ORDER[(currentIndex + direction + STATUS_ORDER.length) % STATUS_ORDER.length]
        onAttendanceChange?.(studentId, newStatus)
        return { ...prev, [studentId]: newStatus }
      })
    },
    [onAttendanceChange]
  )

  const setStatus = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      setAttendance((prev) => {
        onAttendanceChange?.(studentId, status)
        return { ...prev, [studentId]: status }
      })
    },
    [onAttendanceChange]
  )

  const advance = useCallback(() => {
    if (selectedIndex < students.length - 1) {
      setSelectedIndex((prev) => prev + 1)
    }
  }, [selectedIndex, students.length])

  const markAllPresent = useCallback(() => {
    setAttendance((prev) => {
      const updated: Record<string, AttendanceStatus> = {}
      students.forEach((s) => {
        updated[s.id] = "asistencia"
        onAttendanceChange?.(s.id, "asistencia")
      })
      return { ...prev, ...updated }
    })
  }, [students, onAttendanceChange])

  const clearAll = useCallback(() => {
    setAttendance((prev) => {
      const updated: Record<string, AttendanceStatus> = {}
      students.forEach((s) => {
        updated[s.id] = "sin_marcar"
        onAttendanceChange?.(s.id, "sin_marcar")
      })
      return { ...prev, ...updated }
    })
  }, [students, onAttendanceChange])

  // Only capture keys when no input/select/button (other than grid rows) is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isInteractive = ["INPUT", "SELECT", "TEXTAREA"].includes(tag)
      const isModalOpen = document.querySelector('[role="dialog"], [data-radix-popper-content-wrapper]')
      if (isInteractive || isModalOpen) return

      const currentStudent = students[selectedIndex]
      if (!currentStudent) return

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, students.length - 1))
          break
        case "ArrowUp":
        case "k":
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case "Enter":
        case " ":
          e.preventDefault()
          cycleStatus(currentStudent.id, 1)
          advance()
          break
        case "Backspace":
          e.preventDefault()
          cycleStatus(currentStudent.id, -1)
          break
        case "a":
        case "A":
          e.preventDefault()
          setStatus(currentStudent.id, "asistencia")
          advance()
          break
        case "n":
        case "N":
          e.preventDefault()
          setStatus(currentStudent.id, "no_asistencia")
          advance()
          break
        case "r":
        case "R":
          e.preventDefault()
          setStatus(currentStudent.id, "retardo")
          advance()
          break
        case "Escape":
          e.preventDefault()
          setStatus(currentStudent.id, "sin_marcar")
          break
        case "Home":
          e.preventDefault()
          setSelectedIndex(0)
          break
        case "End":
          e.preventDefault()
          setSelectedIndex(students.length - 1)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, students, cycleStatus, setStatus, advance])

  useEffect(() => {
    rowRefs.current[selectedIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [selectedIndex])

  const stats = {
    asistencias: Object.values(attendance).filter((s) => s === "asistencia").length,
    noAsistencias: Object.values(attendance).filter((s) => s === "no_asistencia").length,
    retardos: Object.values(attendance).filter((s) => s === "retardo").length,
    sinMarcar: Object.values(attendance).filter((s) => s === "sin_marcar").length,
    total: students.length,
  }

  const pct =
    stats.total > 0
      ? Math.round(((stats.asistencias + stats.retardos) / stats.total) * 100)
      : 0

  return (
    <div className="flex h-full flex-col" ref={gridRef}>
      {/* Stats bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-5 py-2.5">
        <div className="flex items-center gap-5">
          {[
            { key: "asistencias", dot: "bg-emerald-500", label: "Asist.", value: stats.asistencias },
            { key: "noAsistencias", dot: "bg-red-500", label: "Falta", value: stats.noAsistencias },
            { key: "retardos", dot: "bg-amber-400", label: "Retardo", value: stats.retardos },
            { key: "sinMarcar", dot: "bg-muted-foreground/40", label: "Pend.", value: stats.sinMarcar },
          ].map(({ key, dot, label, value }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", dot)} />
              <span className="text-xs text-muted-foreground">
                {label}{" "}
                <span className="font-semibold text-foreground">{value}</span>
              </span>
            </div>
          ))}

          {/* Progress pill */}
          <div className="ml-2 flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllPresent}
            className="rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500 transition-colors hover:bg-emerald-500/20"
          >
            Todos presentes
          </button>
          <button
            onClick={clearAll}
            className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-12 border-b border-border px-5 py-2.5 font-medium">#</th>
              <th className="border-b border-border px-5 py-2.5 font-medium">Nombre</th>
              <th className="w-36 border-b border-border px-5 py-2.5 font-medium">Matrícula</th>
              <th className="w-44 border-b border-border px-5 py-2.5 text-right font-medium">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const status = attendance[student.id]
              const config = STATUS_CONFIG[status]
              const isSelected = index === selectedIndex

              return (
                <tr
                  key={student.id}
                  ref={(el) => { rowRefs.current[index] = el }}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "cursor-default border-b border-border/50 transition-colors",
                    isSelected
                      ? "bg-accent/60"
                      : "hover:bg-accent/30"
                  )}
                >
                  {/* Indicator strip + number */}
                  <td className="relative px-5 py-2">
                    {isSelected && (
                      <span className="absolute inset-y-0 left-0 w-0.5 rounded-r bg-primary" />
                    )}
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {student.numero}
                    </span>
                  </td>

                  <td className="px-5 py-2">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isSelected ? "text-foreground" : "text-foreground/80"
                      )}
                    >
                      {student.nombre}
                    </span>
                  </td>

                  <td className="px-5 py-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {student.matricula}
                    </span>
                  </td>

                  <td className="px-5 py-2">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedIndex(index)
                          cycleStatus(student.id)
                        }}
                        className={cn(
                          "flex h-7 w-32 items-center justify-center gap-1.5 rounded-md border text-xs font-medium transition-all",
                          config.className,
                          isSelected && "ring-1 ring-ring ring-offset-1 ring-offset-background"
                        )}
                      >
                        {config.icon}
                        <span>{config.label}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Keyboard hint bar */}
      <div className="flex items-center gap-4 border-t border-border/50 bg-card/40 px-5 py-2">
        <span className="text-xs text-muted-foreground/60">↑↓ Navegar</span>
        <span className="text-xs font-semibold text-emerald-500/80">A Asistencia</span>
        <span className="text-xs font-semibold text-red-400/80">N No asistió</span>
        <span className="text-xs font-semibold text-amber-400/80">R Retardo</span>
        <span className="text-xs text-muted-foreground/60">Esc Limpiar fila</span>
        <span className="text-xs text-muted-foreground/60">Enter Ciclar y avanzar</span>
      </div>
    </div>
  )
}
