"use client"

import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import { Check, X, Clock, Minus, History, Search, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type AttendanceStatus = "asistencia" | "no_asistencia" | "retardo" | "sin_marcar"

export interface Student {
  id: string
  numero: number
  nombre: string
  matricula: string
  faltasAcumuladas?: number
  retardosAcumulados?: number
}

interface AttendanceGridProps {
  students: Student[]
  onAttendanceChange?: (studentId: string, status: AttendanceStatus) => void
  onStatsChange?: (stats: { asistencias: number; noAsistencias: number; retardos: number; sinMarcar: number; total: number }) => void
  hasUnsavedChanges?: boolean
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

export function AttendanceGrid({ students, onAttendanceChange, onStatsChange, hasUnsavedChanges = true }: AttendanceGridProps) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {}
    students.forEach((s) => { initial[s.id] = "sin_marcar" })
    return initial
  })
  
  const [history, setHistory] = useState<Record<string, AttendanceStatus>[]>([])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set([0]))
  const [isFocused, setIsFocused] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "todos">("todos")
  const [columnOrder, setColumnOrder] = useState<("nombre" | "matricula")[]>(["nombre", "matricula"])
  const [sortConfig, setSortConfig] = useState<{ key: "numero" | "nombre" | "matricula" | "faltasAcumuladas", direction: "asc" | "desc" } | null>(null)
  
  const gridRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

  const filteredStudents = useMemo(() => {
    let list = students
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) => s.nombre.toLowerCase().includes(q) || s.matricula.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "todos") {
      list = list.filter((s) => attendance[s.id] === statusFilter)
    }
    if (sortConfig) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]
        
        // Handle undefined values
        if (aVal === undefined) aVal = 0
        if (bVal === undefined) bVal = 0

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return list
  }, [students, searchQuery, statusFilter, attendance, sortConfig])

  const handleSort = (key: "numero" | "nombre" | "matricula" | "faltasAcumuladas") => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Swipe gesture handling for mobile
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (studentId: string) => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    
    // Threshold of 40px for a swipe
    if (diff > 40) {
      // Swipe left -> Falta
      setStatus(studentId, "no_asistencia")
    } else if (diff < -40) {
      // Swipe right -> Asistencia
      setStatus(studentId, "asistencia")
    }
    
    touchStartX.current = null
    touchEndX.current = null
  }

  const cycleStatus = useCallback(
    (studentId: string, direction: 1 | -1 = 1) => {
      setAttendance((prev) => {
        const currentIndex = STATUS_ORDER.indexOf(prev[studentId])
        const newStatus =
          STATUS_ORDER[(currentIndex + direction + STATUS_ORDER.length) % STATUS_ORDER.length]
        
        if (prev[studentId] === newStatus) return prev
        setHistory((h) => [...h, prev])
        onAttendanceChange?.(studentId, newStatus)
        return { ...prev, [studentId]: newStatus }
      })
    },
    [onAttendanceChange]
  )

  const setStatus = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      setAttendance((prev) => {
        if (prev[studentId] === status) return prev
        setHistory((h) => [...h, prev])
        onAttendanceChange?.(studentId, status)
        return { ...prev, [studentId]: status }
      })
    },
    [onAttendanceChange]
  )

  const setMultipleStatus = useCallback(
    (studentIds: string[], status: AttendanceStatus) => {
      setAttendance((prev) => {
        let hasChanges = false
        const updated: Record<string, AttendanceStatus> = {}
        studentIds.forEach(id => {
          if (prev[id] !== status) {
            updated[id] = status
            onAttendanceChange?.(id, status)
            hasChanges = true
          }
        })
        if (!hasChanges) return prev
        setHistory((h) => [...h, prev])
        return { ...prev, ...updated }
      })
    },
    [onAttendanceChange]
  )

  const advance = useCallback(() => {
    if (selectedIndex < filteredStudents.length - 1) {
      setSelectedIndex((prev) => prev + 1)
    }
  }, [selectedIndex, filteredStudents.length])

  const markAllPresent = useCallback(() => {
    setAttendance((prev) => {
      const updated: Record<string, AttendanceStatus> = {}
      let hasChanges = false
      filteredStudents.forEach((s) => {
        if (prev[s.id] === "sin_marcar") {
          updated[s.id] = "asistencia"
          onAttendanceChange?.(s.id, "asistencia")
          hasChanges = true
        }
      })
      if (!hasChanges) return prev
      setHistory((h) => [...h, prev])
      return { ...prev, ...updated }
    })
  }, [filteredStudents, onAttendanceChange])

  const clearAll = useCallback(() => {
    setAttendance((prev) => {
      setHistory((h) => [...h, prev])
      const updated: Record<string, AttendanceStatus> = {}
      filteredStudents.forEach((s) => {
        updated[s.id] = "sin_marcar"
        onAttendanceChange?.(s.id, "sin_marcar")
      })
      return { ...prev, ...updated }
    })
  }, [filteredStudents, onAttendanceChange])

  const handleUndo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory
      const newHistory = [...prevHistory]
      const lastState = newHistory.pop()!
      setAttendance(lastState)
      return newHistory
    })
  }, [])

  // Only capture keys when no input/select/button (other than grid rows) is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isInteractive = ["INPUT", "SELECT", "TEXTAREA"].includes(tag)
      
      // If we are not in an interactive element and press /, focus the search
      if (!isInteractive && e.key === "/") {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      const isModalOpen = document.querySelector('[role="dialog"], [data-radix-popper-content-wrapper]')
      if (isInteractive || isModalOpen) return

      const currentStudent = filteredStudents[selectedIndex]
      if (!currentStudent) return

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault()
          setSelectedIndex((prev) => {
            const next = Math.min(prev + 1, filteredStudents.length - 1)
            if (e.shiftKey) {
              setSelectedIndices(curr => new Set([...curr, next]))
            } else {
              setSelectedIndices(new Set([next]))
            }
            return next
          })
          break
        case "ArrowUp":
        case "k":
          e.preventDefault()
          setSelectedIndex((prev) => {
            const next = Math.max(prev - 1, 0)
            if (e.shiftKey) {
              setSelectedIndices(curr => new Set([...curr, next]))
            } else {
              setSelectedIndices(new Set([next]))
            }
            return next
          })
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
          if (selectedIndices.size > 1) {
            setMultipleStatus(Array.from(selectedIndices).map(idx => filteredStudents[idx].id), "asistencia")
            setSelectedIndices(new Set([selectedIndex]))
          } else {
            setStatus(currentStudent.id, "asistencia")
          }
          advance()
          break
        case "n":
        case "N":
          e.preventDefault()
          if (selectedIndices.size > 1) {
            setMultipleStatus(Array.from(selectedIndices).map(idx => filteredStudents[idx].id), "no_asistencia")
            setSelectedIndices(new Set([selectedIndex]))
          } else {
            setStatus(currentStudent.id, "no_asistencia")
          }
          advance()
          break
        case "r":
        case "R":
          e.preventDefault()
          if (selectedIndices.size > 1) {
            setMultipleStatus(Array.from(selectedIndices).map(idx => filteredStudents[idx].id), "retardo")
            setSelectedIndices(new Set([selectedIndex]))
          } else {
            setStatus(currentStudent.id, "retardo")
          }
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
          setSelectedIndex(filteredStudents.length - 1)
          break
        case "z":
        case "Z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleUndo()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, filteredStudents, cycleStatus, setStatus, advance, handleUndo])

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
      ? Math.round(((stats.total - stats.sinMarcar) / stats.total) * 100)
      : 0

  useEffect(() => {
    onStatsChange?.(stats)
  }, [stats.asistencias, stats.noAsistencias, stats.retardos, stats.sinMarcar, stats.total, onStatsChange])

  return (
    <div className="flex h-full flex-col relative overflow-hidden" ref={gridRef}>
      {/* Stats bar */}
      <div
        className="flex items-center justify-between border-b border-border bg-card/60 px-5 py-2.5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-1.5">
          {[
            { filter: "todos" as const, dot: "bg-foreground/20", label: "Todos", value: stats.total },
            { filter: "asistencia" as const, dot: "bg-emerald-500", label: "Asist.", value: stats.asistencias },
            { filter: "no_asistencia" as const, dot: "bg-red-500", label: "Falta", value: stats.noAsistencias },
            { filter: "retardo" as const, dot: "bg-amber-400", label: "Retardo", value: stats.retardos },
            { filter: "sin_marcar" as const, dot: "bg-muted-foreground/40", label: "Pend.", value: stats.sinMarcar },
          ].map(({ filter, dot, label, value }) => (
            <button
              key={filter}
              onClick={() => { 
                setStatusFilter(statusFilter === filter && filter !== "todos" ? "todos" : filter)
                setSelectedIndex(0) 
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all",
                statusFilter === filter
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : statusFilter !== "todos"
                  ? "text-muted-foreground/60 opacity-60 hover:opacity-100 hover:text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", dot, statusFilter !== "todos" && statusFilter !== filter && "opacity-40")} />
              {label}
              <span className={cn(
                "font-semibold", 
                statusFilter === filter ? "text-foreground" : "text-foreground/50"
              )}>{value}</span>
            </button>
          ))}

          {/* Progress pill */}
          <div className="ml-3 flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  pct === 100 ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-emerald-500"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            {pct === 100 ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 animate-in fade-in slide-in-from-left-2">
                <Check className="h-3 w-3" />
                100%
              </span>
            ) : (
              <span className="text-xs font-medium text-muted-foreground w-11">{pct}%</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Barra de búsqueda */}
          <div className="relative hidden sm:block mr-1">
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar ( / )"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedIndex(0)
              }}
              className="h-7 w-40 rounded-md border border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <button
            onClick={markAllPresent}
            className="rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500 transition-colors hover:bg-emerald-500/20"
            title="Marcar todos los alumnos pendientes como presentes"
          >
            Completar con asistencias
          </button>
          <button
            onClick={clearAll}
            className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            Limpiar
          </button>
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            aria-label="Deshacer último cambio (Ctrl+Z)"
            title="Deshacer (Ctrl+Z)"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Deshacer</span>
          </button>
        </div>
      </div>

      {/* Table & List View Container */}
      <div className="flex-1 overflow-auto">
        {filteredStudents.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No se encontraron alumnos con "{searchQuery}"
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <table className="hidden md:table w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-12 border-b border-border px-5 py-2.5 font-medium">
                    <button onClick={() => handleSort("numero")} className="flex items-center gap-1 hover:text-foreground">
                      # {sortConfig?.key === "numero" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                  </th>
                  
                  {columnOrder.map((col) => (
                    <th 
                      key={col}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("col", col)
                        e.dataTransfer.effectAllowed = "move"
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const sourceCol = e.dataTransfer.getData("col") as "nombre" | "matricula"
                        if (sourceCol && sourceCol !== col) {
                          setColumnOrder(prev => prev[0] === sourceCol ? [prev[1], prev[0]] : prev)
                        }
                      }}
                      className={cn(
                        "border-b border-border px-5 py-2.5 font-medium cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors group",
                        col === "matricula" && "w-36"
                      )}
                      title="Arrastrar para reordenar columna. Clic para ordenar."
                    >
                      <button onClick={() => handleSort(col)} className="flex items-center gap-1.5 w-full text-left focus:outline-none">
                        <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                        {col === "nombre" ? "Nombre" : "Matrícula"}
                        {sortConfig?.key === col && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </button>
                    </th>
                  ))}

                  <th className="w-24 border-b border-border px-5 py-2.5 text-center font-medium">
                    <button onClick={() => handleSort("faltasAcumuladas")} className="flex items-center justify-center gap-1 w-full hover:text-foreground">
                      Faltas {sortConfig?.key === "faltasAcumuladas" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th className="w-44 border-b border-border px-5 py-2.5 text-center font-medium">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  const status = attendance[student.id]
                  const config = STATUS_CONFIG[status]
                  const isSelected = selectedIndices.has(index)

                  const renderName = () => (
                    <td key="col-nombre" className="px-5 py-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedIndex(index)
                              setSelectedIndices(new Set([index]))
                            }}
                            className={cn(
                              "text-sm font-medium transition-colors hover:underline decoration-muted-foreground/50 underline-offset-4 text-left outline-none",
                              isSelected ? "text-foreground" : "text-foreground/80"
                            )}
                          >
                            {student.nombre}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent side="right" className="w-64 p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col">
                                <h4 className="font-semibold text-sm leading-tight text-foreground">{student.nombre}</h4>
                                <span className="text-[10px] text-muted-foreground mt-0.5">Historial del ciclo</span>
                              </div>
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                                85%
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex flex-col rounded-md bg-secondary/60 p-2.5">
                                <span className="text-muted-foreground mb-0.5">Faltas</span>
                                <span className="font-semibold text-foreground text-sm">2 <span className="text-[10px] font-normal text-muted-foreground">acumuladas</span></span>
                              </div>
                              <div className="flex flex-col rounded-md bg-secondary/60 p-2.5">
                                <span className="text-muted-foreground mb-0.5">Retardos</span>
                                <span className="font-semibold text-foreground text-sm">1 <span className="text-[10px] font-normal text-muted-foreground">acumulado</span></span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 mt-1">
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Últimas 5 sesiones</span>
                              <div className="flex gap-1.5">
                                <span className="h-2 w-full rounded-full bg-emerald-500" title="Asistencia" />
                                <span className="h-2 w-full rounded-full bg-emerald-500" title="Asistencia" />
                                <span className="h-2 w-full rounded-full bg-red-500" title="Falta" />
                                <span className="h-2 w-full rounded-full bg-amber-400" title="Retardo" />
                                <span className="h-2 w-full rounded-full bg-emerald-500" title="Asistencia" />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  )

                  const renderMatricula = () => (
                    <td key="col-matricula" className="px-5 py-2">
                      <span className="text-sm font-mono text-muted-foreground/80">
                        {student.matricula}
                      </span>
                    </td>
                  )

                  return (
                    <tr
                      key={student.id}
                      ref={(el) => { rowRefs.current[index] = el }}
                      onClick={(e) => {
                        if (e.shiftKey) {
                          const start = Math.min(selectedIndex, index)
                          const end = Math.max(selectedIndex, index)
                          const newSet = new Set<number>()
                          for (let i = start; i <= end; i++) newSet.add(i)
                          setSelectedIndices(newSet)
                        } else if (e.metaKey || e.ctrlKey) {
                          const newSet = new Set(selectedIndices)
                          if (newSet.has(index)) newSet.delete(index)
                          else newSet.add(index)
                          setSelectedIndices(newSet)
                          setSelectedIndex(index)
                        } else {
                          setSelectedIndex(index)
                          setSelectedIndices(new Set([index]))
                        }
                      }}
                      className={cn(
                        "cursor-default border-b border-border/50 transition-colors",
                        isSelected
                          ? "bg-accent/60"
                          : student.faltasAcumuladas !== undefined && student.faltasAcumuladas >= 3
                          ? "bg-red-500/5 hover:bg-red-500/10"
                          : "hover:bg-accent/30"
                      )}
                    >
                      {/* Indicator strip + number */}
                      <td className="relative px-5 py-2">
                        {isSelected && (
                          <span className="absolute inset-y-0 left-0 w-0.5 rounded-r bg-primary" />
                        )}
                        {!isSelected && student.faltasAcumuladas !== undefined && student.faltasAcumuladas >= 3 && (
                          <span className="absolute inset-y-0 left-0 w-0.5 rounded-r bg-red-500/60" />
                        )}
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {student.numero}
                        </span>
                      </td>

                      {columnOrder.map(col => col === "nombre" ? renderName() : renderMatricula())}

                      {/* Faltas acumuladas column */}
                      <td className="px-3 py-2 text-center">
                        {student.faltasAcumuladas !== undefined ? (
                          <span className={cn(
                            "inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums w-6 h-6",
                            student.faltasAcumuladas === 0
                              ? "text-muted-foreground/40"
                              : student.faltasAcumuladas >= 3
                              ? "bg-red-500/15 text-red-500 ring-1 ring-red-500/30"
                              : student.faltasAcumuladas === 2
                              ? "bg-amber-500/15 text-amber-500"
                              : "text-muted-foreground"
                          )}>
                            {student.faltasAcumuladas}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-5 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Quick-action buttons — only visible on selected row */}
                      {isSelected ? (
                        <div className="flex items-center gap-1">
                          {(["asistencia", "no_asistencia", "retardo"] as AttendanceStatus[]).map(
                            (s) => {
                              const cfg = STATUS_CONFIG[s]
                              const isActive = status === s
                              return (
                                <button
                                  key={s}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setStatus(student.id, isActive ? "sin_marcar" : s)
                                    if (!isActive) advance()
                                  }}
                                  title={`${cfg.label} (${cfg.shortcut})`}
                                  aria-label={`Marcar a ${student.nombre} como ${cfg.label}`}
                                  className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-semibold transition-all",
                                    isActive
                                      ? cfg.className + " scale-110 shadow-sm"
                                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-accent"
                                  )}
                                >
                                  {cfg.shortcut}
                                </button>
                              )
                            }
                          )}
                          {/* current status pill */}
                          <span
                            className={cn(
                              "ml-1 flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-all duration-300",
                              config.className
                            )}
                          >
                            {config.icon}
                            <span>{config.label}</span>
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIndex(index)
                            cycleStatus(student.id)
                          }}
                          aria-label={`Estado actual de ${student.nombre}: ${config.label}. Presiona para cambiar.`}
                          className={cn(
                            "flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-all duration-300",
                            config.className
                          )}
                        >
                          {config.icon}
                          <span>{config.label}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Mobile List View */}
        <div className="flex flex-col md:hidden pb-12">
          {filteredStudents.map((student, index) => {
            const status = attendance[student.id]
            const isSelected = selectedIndices.has(index)

            return (
              <div 
                key={student.id}
                onClick={(e) => {
                  if (e.shiftKey) {
                    const start = Math.min(selectedIndex, index)
                    const end = Math.max(selectedIndex, index)
                    const newSet = new Set<number>()
                    for (let i = start; i <= end; i++) newSet.add(i)
                    setSelectedIndices(newSet)
                  } else if (e.metaKey || e.ctrlKey) {
                    const newSet = new Set(selectedIndices)
                    if (newSet.has(index)) newSet.delete(index)
                    else newSet.add(index)
                    setSelectedIndices(newSet)
                    setSelectedIndex(index)
                  } else {
                    setSelectedIndex(index)
                    setSelectedIndices(new Set([index]))
                  }
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(student.id)}
                className={cn(
                  "flex flex-col gap-3 border-b border-border/50 p-4 transition-colors relative overflow-hidden",
                  isSelected ? "bg-accent/60" : "hover:bg-accent/30"
                )}
              >
                {/* Swipe hints (subtle) */}
                <div className="absolute inset-y-0 left-0 w-1 bg-red-500/20 opacity-0 transition-opacity" />
                <div className="absolute inset-y-0 right-0 w-1 bg-emerald-500/20 opacity-0 transition-opacity" />
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-5 tabular-nums text-right">{student.numero}</span>
                  <div className="flex flex-col flex-1 items-start">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIndex(index)
                          }}
                          className={cn(
                            "text-sm font-semibold transition-colors hover:underline decoration-muted-foreground/50 underline-offset-4 text-left outline-none leading-tight",
                            isSelected ? "text-foreground" : "text-foreground/80"
                          )}
                        >
                          {student.nombre}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" className="w-64 p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                              <h4 className="font-semibold text-sm leading-tight text-foreground">{student.nombre}</h4>
                              <span className="text-[10px] text-muted-foreground mt-0.5">Historial del ciclo</span>
                            </div>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                              85%
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex flex-col rounded-md bg-secondary/60 p-2.5">
                              <span className="text-muted-foreground mb-0.5">Faltas</span>
                              <span className="font-semibold text-foreground text-sm">2 <span className="text-[10px] font-normal text-muted-foreground">acumuladas</span></span>
                            </div>
                            <div className="flex flex-col rounded-md bg-secondary/60 p-2.5">
                              <span className="text-muted-foreground mb-0.5">Retardos</span>
                              <span className="font-semibold text-foreground text-sm">1 <span className="text-[10px] font-normal text-muted-foreground">acumulado</span></span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Últimas 5 sesiones</span>
                            <div className="flex gap-1.5">
                              <span className="h-2 w-full rounded-full bg-emerald-500" title="Asistencia" />
                              <span className="h-2 w-full rounded-full bg-emerald-500" title="Asistencia" />
                              <span className="h-2 w-full rounded-full bg-red-500" title="Falta" />
                              <span className="h-2 w-full rounded-full bg-emerald-500" title="Asistencia" />
                              <span className="h-2 w-full rounded-full bg-amber-400" title="Retardo" />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <span className="text-xs font-mono text-muted-foreground mt-0.5">{student.matricula}</span>
                  </div>
                </div>
                
                {/* Status Toggle Area for Mobile */}
                <div className="flex items-center gap-2 mt-1 ml-8">
                  {(["asistencia", "no_asistencia", "retardo"] as AttendanceStatus[]).map((s) => {
                    const cfg = STATUS_CONFIG[s]
                    const isActive = status === s
                    return (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatus(student.id, isActive ? "sin_marcar" : s)
                          if (!isActive) advance()
                        }}
                        aria-label={`Marcar a ${student.nombre} como ${cfg.label}`}
                        className={cn(
                          "flex-1 flex h-10 items-center justify-center rounded-lg border text-xs font-medium transition-all duration-300",
                          isActive
                            ? cfg.className + " shadow-sm border-transparent ring-1 ring-border scale-[1.02]"
                            : "border-border bg-card text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {cfg.icon}
                        <span className="ml-2 hidden sm:inline-block">{cfg.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
          </>
        )}
      </div>

      {/* 100% Completion Floating Banner */}
      {pct === 100 && hasUnsavedChanges && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500 text-white px-5 py-2.5 shadow-lg shadow-emerald-500/20 animate-in slide-in-from-bottom-5 fade-out duration-500">
          <Check className="h-4 w-4" />
          <span className="text-sm font-semibold tracking-wide">¡Lista completada! <span className="font-normal opacity-90 ml-1">Presiona Ctrl+S para guardar</span></span>
        </div>
      )}

      {/* Keyboard hint bar */}
      <div className="hidden md:flex items-center gap-4 border-t border-border/50 bg-card/40 px-5 py-2 z-10">
        <span className="text-xs text-muted-foreground/60">/ Buscar</span>
        <span className="text-xs text-muted-foreground/60">↑↓ Navegar</span>
        <span className="text-xs font-semibold text-emerald-500/80">A Asistencia</span>
        <span className="text-xs font-semibold text-red-400/80">N No asistió</span>
        <span className="text-xs font-semibold text-amber-400/80">R Retardo</span>
        <span className="text-xs text-muted-foreground/60">Esc Limpiar fila</span>
        <span className="text-xs text-muted-foreground/60">Enter Ciclar</span>
        <span className="text-xs text-muted-foreground/60">Ctrl+Z Deshacer</span>
        <span className="text-xs text-muted-foreground/60">Ctrl+S Guardar</span>
      </div>
    </div>
  )
}
