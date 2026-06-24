"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Mail,
  User,
  Calendar,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  ShieldAlert,
  Info,
  UserCog,
  FileBadge
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type JustificationStatus = "Recibido" | "Falta encontrada" | "Justificado" | "Pendiente" | "Inconsistente" | "Revisión manual"

interface ExtractedField {
  value: string
  confidence: "Alta" | "Media" | "Baja"
}

interface Justification {
  id: string
  studentName: string
  enrollment: string
  group: string
  absenceDate: string
  subject: string
  teacher: string
  sender: string
  filename: string
  status: JustificationStatus
  emailSubject: string
  emailBody: string
  extractedInfo: {
    name: ExtractedField
    enrollment: ExtractedField
    date: ExtractedField
    subject: ExtractedField
    teacher: ExtractedField
    document: string
    type: string
    observations: string
  }
  matchInfo: {
    studentFound: boolean
    enrollmentFound: boolean
    absenceRegistered: boolean
    groupFound: string
    subjectFound: string
    teacherRelated: string
    matchResult: string
    matchPercentage: number
  }
}

const MOCK_JUSTIFICATIONS: Justification[] = [
  {
    id: "J-001",
    studentName: "Ana López Martínez",
    enrollment: "202300145",
    group: "ISC-301",
    absenceDate: "2026-06-12",
    subject: "Programación Web",
    teacher: "Mtro. Carlos Hernández",
    sender: "tutor.ana@example.com",
    filename: "justificante_medico_ana_lopez.pdf",
    status: "Falta encontrada",
    emailSubject: "Justificante médico Ana López - Ausencia por enfermedad",
    emailBody: "Buen día, envío justificante médico correspondiente a la ausencia de mi hija Ana López Martínez del día 12 de junio de 2026 en la materia de Programación Web. Adjunto documento para su revisión. Gracias.",
    extractedInfo: {
      name: { value: "Ana López Martínez", confidence: "Alta" },
      enrollment: { value: "202300145", confidence: "Media" },
      date: { value: "2026-06-12", confidence: "Alta" },
      subject: { value: "Programación Web", confidence: "Alta" },
      teacher: { value: "Carlos Hernández", confidence: "Alta" },
      document: "Certificado Médico Válido",
      type: "Enfermedad",
      observations: "Reposo por 24 horas."
    },
    matchInfo: {
      studentFound: true,
      enrollmentFound: true,
      absenceRegistered: true,
      groupFound: "ISC-301",
      subjectFound: "Programación Web",
      teacherRelated: "Mtro. Carlos Hernández",
      matchResult: "Se encontró una falta registrada para el alumno en la fecha indicada. El justificante puede aprobarse.",
      matchPercentage: 95
    }
  },
  {
    id: "J-002",
    studentName: "Luis Fernando García",
    enrollment: "202300287",
    group: "ISC-302",
    absenceDate: "2026-06-13",
    subject: "Inteligencia Artificial",
    teacher: "Mtra. Cecilia Alvarado",
    sender: "luis.garcia@example.com",
    filename: "justificante_luis_garcia.jpg",
    status: "Pendiente",
    emailSubject: "Justificación de inasistencia - Falla de transporte",
    emailBody: "Hola, escribo para justificar mi falta del día 13 de junio debido a un problema con el transporte público.\n\nAdjunto foto como evidencia.\n\nGracias.",
    extractedInfo: {
      name: { value: "Luis Fernando García", confidence: "Alta" },
      enrollment: { value: "No detectada", confidence: "Baja" },
      date: { value: "2026-06-13", confidence: "Alta" },
      subject: { value: "Inteligencia Artificial", confidence: "Media" },
      teacher: { value: "Cecilia Alvarado", confidence: "Media" },
      document: "Fotografía / Imagen",
      type: "Fuerza Mayor",
      observations: "Imagen con poca claridad."
    },
    matchInfo: {
      studentFound: true,
      enrollmentFound: true,
      absenceRegistered: false,
      groupFound: "ISC-302",
      subjectFound: "Inteligencia Artificial",
      teacherRelated: "Mtra. Cecilia Alvarado",
      matchResult: "El alumno fue encontrado, pero no existe falta registrada en la fecha indicada.",
      matchPercentage: 72
    }
  },
  {
    id: "J-003",
    studentName: "Mariana Torres Ruiz",
    enrollment: "202300319",
    group: "ISC-303",
    absenceDate: "2026-06-14",
    subject: "Bases de Datos",
    teacher: "Mtro. Iván Guerra",
    sender: "tutor.mariana@example.com",
    filename: "constancia_medica_mariana.pdf",
    status: "Inconsistente",
    emailSubject: "Constancia médica Mariana Torres",
    emailBody: "Buen día,\n\nEnvío la constancia médica correspondiente a la cita de Mariana Torres del día 14 de junio.\n\nQuedo atento a cualquier duda.",
    extractedInfo: {
      name: { value: "Mariana Torres Ruiz", confidence: "Alta" },
      enrollment: { value: "202300319", confidence: "Alta" },
      date: { value: "2026-06-14", confidence: "Alta" },
      subject: { value: "Bases de Datos", confidence: "Alta" },
      teacher: { value: "Iván Guerra", confidence: "Alta" },
      document: "Constancia de Clínica",
      type: "Cita médica",
      observations: "Sin firma visible del médico."
    },
    matchInfo: {
      studentFound: true,
      enrollmentFound: false,
      absenceRegistered: true,
      groupFound: "ISC-303",
      subjectFound: "Bases de Datos",
      teacherRelated: "Mtro. Iván Guerra",
      matchResult: "La matrícula no coincide completamente con el documento adjunto. Requiere revisión manual.",
      matchPercentage: 40
    }
  },
  {
    id: "J-004",
    studentName: "José Emilio Vargas",
    enrollment: "202300421",
    group: "ISC-301",
    absenceDate: "2026-06-12",
    subject: "Desarrollo Web",
    teacher: "Mtro. Carlos Hernández",
    sender: "jose.vargas@example.com",
    filename: "justificante_familiar_jose.pdf",
    status: "Recibido",
    emailSubject: "Ausencia por motivos familiares",
    emailBody: "Profesor Carlos, adjunto documento que justifica mi falta por un asunto familiar impostergable el día de hoy.",
    extractedInfo: {
      name: { value: "José Emilio Vargas", confidence: "Alta" },
      enrollment: { value: "202300421", confidence: "Alta" },
      date: { value: "2026-06-12", confidence: "Media" },
      subject: { value: "Desarrollo Web", confidence: "Alta" },
      teacher: { value: "Carlos Hernández", confidence: "Alta" },
      document: "Carta explicativa firmada",
      type: "Familiar",
      observations: "Contiene firma del tutor legal."
    },
    matchInfo: {
      studentFound: true,
      enrollmentFound: true,
      absenceRegistered: true,
      groupFound: "ISC-301",
      subjectFound: "Desarrollo Web",
      teacherRelated: "Mtro. Carlos Hernández",
      matchResult: "Se encontró una falta registrada para el alumno en la fecha indicada. El justificante puede aprobarse.",
      matchPercentage: 88
    }
  },
  {
    id: "J-005",
    studentName: "Sofía Ramírez Ortega",
    enrollment: "202300512",
    group: "ISC-302",
    absenceDate: "2026-06-13",
    subject: "Ingeniería de Software",
    teacher: "Mtra. Cecilia Alvarado",
    sender: "tutor.sofia@example.com",
    filename: "justificante_clinica_sofia.png",
    status: "Falta encontrada",
    emailSubject: "Constancia de asistencia médica - Sofía Ramírez",
    emailBody: "Buenas tardes, adjunto la receta médica de Sofía, quien acudió a urgencias y no pudo asistir a su clase.",
    extractedInfo: {
      name: { value: "Sofía Ramírez Ortega", confidence: "Alta" },
      enrollment: { value: "202300512", confidence: "Alta" },
      date: { value: "2026-06-13", confidence: "Alta" },
      subject: { value: "Ingeniería de Software", confidence: "Alta" },
      teacher: { value: "Cecilia Alvarado", confidence: "Alta" },
      document: "Receta Médica",
      type: "Enfermedad",
      observations: "Sello de la institución de salud válido."
    },
    matchInfo: {
      studentFound: true,
      enrollmentFound: true,
      absenceRegistered: true,
      groupFound: "ISC-302",
      subjectFound: "Ingeniería de Software",
      teacherRelated: "Mtra. Cecilia Alvarado",
      matchResult: "Se encontró una falta registrada para el alumno en la fecha indicada. El justificante puede aprobarse.",
      matchPercentage: 93
    }
  },
  {
    id: "J-006",
    studentName: "Diego Hernández Luna",
    enrollment: "202300678",
    group: "ISC-304",
    absenceDate: "2026-06-14",
    subject: "Redes",
    teacher: "Mtro. Iván Guerra",
    sender: "diego.hl@example.com",
    filename: "justificante_diego.pdf",
    status: "Revisión manual",
    emailSubject: "Documento de inasistencia",
    emailBody: "Profe, le dejo mi comprobante de por qué falté a la clase de redes.",
    extractedInfo: {
      name: { value: "Diego Hernández Luna", confidence: "Media" },
      enrollment: { value: "202300678", confidence: "Alta" },
      date: { value: "2026-06-14", confidence: "Media" },
      subject: { value: "Redes", confidence: "Alta" },
      teacher: { value: "Iván Guerra", confidence: "Alta" },
      document: "Documento en formato Word convertido a PDF",
      type: "Desconocido",
      observations: "Carece de membrete y firma oficial."
    },
    matchInfo: {
      studentFound: true,
      enrollmentFound: true,
      absenceRegistered: true,
      groupFound: "ISC-304",
      subjectFound: "Redes",
      teacherRelated: "Mtro. Iván Guerra",
      matchResult: "Faltan datos para validar el justificante.",
      matchPercentage: 61
    }
  }
]

const STATUS_COLORS: Record<JustificationStatus, string> = {
  "Recibido": "bg-slate-500/10 text-slate-500 border-slate-500/20",
  "Falta encontrada": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Justificado": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Pendiente": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Inconsistente": "bg-red-500/10 text-red-600 border-red-500/20",
  "Revisión manual": "bg-purple-500/10 text-purple-600 border-purple-500/20",
}

const STATUS_ICONS: Record<JustificationStatus, any> = {
  "Recibido": Mail,
  "Falta encontrada": Search,
  "Justificado": CheckCircle,
  "Pendiente": Clock,
  "Inconsistente": ShieldAlert,
  "Revisión manual": UserCog,
}

export function JustificationsModule() {
  const [justifications, setJustifications] = useState<Justification[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Cargar estado de Justificantes
  useEffect(() => {
    setIsMounted(true)
    const stored = localStorage.getItem("listia_justifications")
    if (stored) {
      try {
        setJustifications(JSON.parse(stored))
      } catch {
        setJustifications(MOCK_JUSTIFICATIONS)
      }
    } else {
      setJustifications(MOCK_JUSTIFICATIONS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Seleccionar el primero por defecto cuando se cargan los datos
  useEffect(() => {
    if (justifications.length > 0 && !selectedId) {
      setSelectedId(justifications[0].id)
    }
  }, [justifications, selectedId])

  const selectedItem = justifications.find(j => j.id === selectedId)

  const handleUpdateStatus = (id: string, newStatus: JustificationStatus) => {
    const updated = justifications.map(j => j.id === id ? { ...j, status: newStatus } : j)
    setJustifications(updated)
    localStorage.setItem("listia_justifications", JSON.stringify(updated))
    toast.success("Estado actualizado", {
      description: `El justificante ahora está marcado como: ${newStatus}`,
      duration: 3000,
    })
  }

  // Si no está montado (SSR), retornamos skeleton o null para evitar mismatch de hidratación
  if (!isMounted) return <div className="h-full w-full bg-background"></div>

  // Metrics
  const metrics = {
    received: justifications.length,
    pending: justifications.filter(j => j.status === "Pendiente" || j.status === "Recibido" || j.status === "Revisión manual").length,
    found: justifications.filter(j => j.status === "Falta encontrada").length,
    approved: justifications.filter(j => j.status === "Justificado").length,
    inconsistent: justifications.filter(j => j.status === "Inconsistente").length,
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Encabezado y Aviso */}
      <div className="border-b border-border bg-card/50 px-6 py-4 shrink-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileBadge className="h-5 w-5 text-primary" />
              Gestión de Justificantes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Recepción, extracción y revisión de justificantes académicos enviados por correo electrónico.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-blue-500/10 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Info className="h-4 w-4 shrink-0" />
            <span className="leading-tight text-xs font-medium max-w-xs">
              Prototipo visual de la segunda etapa. La integración real con Gmail y validación automática de documentos se contempla para una etapa posterior.
            </span>
          </div>
        </div>

        {/* Métricas */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MetricCard title="Recibidos" value={metrics.received} icon={Mail} color="text-slate-500" />
          <MetricCard title="Pendientes de revisión" value={metrics.pending} icon={Clock} color="text-blue-500" />
          <MetricCard title="Faltas Encontradas" value={metrics.found} icon={Search} color="text-amber-500" />
          <MetricCard title="Justificantes Aprobados" value={metrics.approved} icon={CheckCircle} color="text-emerald-500" />
          <MetricCard title="Casos Inconsistentes" value={metrics.inconsistent} icon={AlertCircle} color="text-red-500" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Bandeja de justificantes */}
        <div className="w-1/3 min-w-[320px] flex flex-col border-r border-border bg-muted/10 h-full">
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur z-10">
            <h2 className="text-sm font-semibold">Bandeja de Entrada</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {justifications.map((justification) => {
              const isSelected = selectedId === justification.id
              return (
                <button
                  key={justification.id}
                  onClick={() => setSelectedId(justification.id)}
                  className={cn(
                    "flex flex-col gap-2.5 rounded-xl border p-3.5 text-left transition-all hover:bg-accent/50",
                    isSelected
                      ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-border bg-card shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm leading-tight text-foreground">{justification.studentName}</span>
                      <span className="text-[11px] font-mono text-muted-foreground mt-0.5">{justification.enrollment}</span>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 text-[10px] font-semibold px-2 py-0.5", STATUS_COLORS[justification.status])}>
                      {justification.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Ausencia: <span className="font-medium text-foreground">{justification.absenceDate}</span></span>
                    <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {justification.subject}</span>
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {justification.teacher}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detalle del justificante */}
        <div className="flex-1 overflow-y-auto bg-background p-6">
          {selectedItem ? (
            <div className="mx-auto max-w-4xl flex flex-col gap-6 pb-10">
              
              {/* Acciones Superiores */}
              <div className="flex flex-wrap items-center justify-between rounded-lg border border-border bg-card p-2 shadow-sm gap-2">
                <div className="px-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Acciones del Justificante:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-500 dark:hover:bg-emerald-500/10"
                    onClick={() => handleUpdateStatus(selectedItem.id, "Justificado")}
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Marcar como justificada
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 border-blue-500/20 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-500 dark:hover:bg-blue-500/10"
                    onClick={() => handleUpdateStatus(selectedItem.id, "Pendiente")}
                  >
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    Dejar pendiente
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 border-purple-500/20 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-500 dark:hover:bg-purple-500/10"
                    onClick={() => handleUpdateStatus(selectedItem.id, "Revisión manual")}
                  >
                    <UserCog className="mr-1.5 h-3.5 w-3.5" />
                    Revisión manual
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 border-red-500/20 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-500/10"
                    onClick={() => handleUpdateStatus(selectedItem.id, "Inconsistente")}
                  >
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                    Marcar inconsistente
                  </Button>
                </div>
              </div>

              {/* Correo Electrónico Simulado */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="border-b border-border bg-muted/30 p-4">
                  <h3 className="text-lg font-semibold">{selectedItem.emailSubject}</h3>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                        {selectedItem.sender.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{selectedItem.sender}</span>
                        <span className="text-xs text-muted-foreground">Para: coordinacion@listia.edu</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-foreground">Fecha de recepción</span>
                      <span className="text-xs text-muted-foreground">{selectedItem.absenceDate} 09:41 AM</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                  {selectedItem.emailBody}
                </div>
                <div className="border-t border-border bg-muted/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{selectedItem.filename}</span>
                      <span className="text-[11px] text-muted-foreground">Documento simulado • 1.2 MB</span>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
                      <Download className="h-3.5 w-3.5" />
                      Visualizar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Información Extraída */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h4 className="mb-5 text-sm font-bold flex items-center gap-2 text-primary">
                    <ShieldAlert className="h-4 w-4" />
                    Información Extraída Automáticamente
                  </h4>
                  <div className="flex flex-col gap-4">
                    <ExtractedRow label="Nombre detectado" field={selectedItem.extractedInfo.name} />
                    <ExtractedRow label="Matrícula detectada" field={selectedItem.extractedInfo.enrollment} />
                    <ExtractedRow label="Fecha detectada" field={selectedItem.extractedInfo.date} />
                    <ExtractedRow label="Materia detectada" field={selectedItem.extractedInfo.subject} />
                    <ExtractedRow label="Profesor detectado" field={selectedItem.extractedInfo.teacher} />
                    
                    <div className="h-px w-full bg-border my-1" />
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Documento detectado</span>
                      <span className="text-sm font-medium text-foreground">{selectedItem.extractedInfo.document}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Tipo de justificante</span>
                      <span className="text-sm font-medium text-foreground">{selectedItem.extractedInfo.type}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Observaciones detectadas</span>
                      <span className="text-sm font-medium text-foreground">{selectedItem.extractedInfo.observations}</span>
                    </div>
                  </div>
                </div>

                {/* Coincidencia con Pase de Lista */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h4 className="mb-5 text-sm font-bold flex items-center gap-2 text-primary">
                    <Search className="h-4 w-4" />
                    Coincidencia con pase de lista
                  </h4>
                  <div className="flex flex-col gap-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Alumno encontrado</span>
                        <span className="text-sm font-semibold">{selectedItem.matchInfo.studentFound ? "Sí" : "No"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Matrícula encontrada</span>
                        <span className="text-sm font-semibold">{selectedItem.matchInfo.enrollmentFound ? "Sí" : "No"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Falta registrada en esa fecha</span>
                      <span className={cn(
                        "text-sm font-bold",
                        selectedItem.matchInfo.absenceRegistered ? "text-amber-600 dark:text-amber-500" : "text-red-600 dark:text-red-500"
                      )}>
                        {selectedItem.matchInfo.absenceRegistered ? "Sí (Pendiente de justificar)" : "No encontrada"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Grupo</span>
                        <span className="text-sm font-medium">{selectedItem.matchInfo.groupFound}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Materia</span>
                        <span className="text-sm font-medium">{selectedItem.matchInfo.subjectFound}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Profesor relacionado</span>
                      <span className="text-sm font-medium">{selectedItem.matchInfo.teacherRelated}</span>
                    </div>

                    <div className="mt-2 rounded-lg bg-secondary/50 p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Porcentaje de coincidencia</span>
                        <Badge variant="outline" className={cn(
                          "font-bold bg-background",
                          selectedItem.matchInfo.matchPercentage >= 90 ? "text-emerald-600 border-emerald-500/40" : 
                          selectedItem.matchInfo.matchPercentage >= 70 ? "text-amber-600 border-amber-500/40" : "text-red-600 border-red-500/40"
                        )}>
                          {selectedItem.matchInfo.matchPercentage >= 90 ? "Coincidencia alta" : 
                           selectedItem.matchInfo.matchPercentage >= 70 ? "Coincidencia media" : "Coincidencia baja"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              selectedItem.matchInfo.matchPercentage >= 90 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                              selectedItem.matchInfo.matchPercentage >= 70 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${selectedItem.matchInfo.matchPercentage}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-sm font-bold w-10 text-right",
                          selectedItem.matchInfo.matchPercentage >= 90 ? "text-emerald-500" : 
                          selectedItem.matchInfo.matchPercentage >= 70 ? "text-amber-500" : "text-red-500"
                        )}>{selectedItem.matchInfo.matchPercentage}%</span>
                      </div>
                      <div className="mt-4 flex gap-2 items-start">
                        <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                        <p className="text-xs font-medium leading-relaxed text-foreground/90">
                          {selectedItem.matchInfo.matchResult}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Selecciona un justificante para ver los detalles
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 text-muted-foreground mb-3">
        <span className="text-xs font-semibold tracking-wide uppercase">{title}</span>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <span className="text-3xl font-bold">{value}</span>
    </div>
  )
}

function ExtractedRow({ label, field }: { label: string, field: ExtractedField }) {
  const getConfidenceColor = (conf: "Alta" | "Media" | "Baja") => {
    switch(conf) {
      case "Alta": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "Media": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "Baja": return "bg-red-500/10 text-red-600 border-red-500/20"
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Confianza:</span>
          <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 uppercase tracking-wider font-bold", getConfidenceColor(field.confidence))}>
            {field.confidence}
          </Badge>
        </div>
      </div>
      <span className="text-sm font-semibold text-foreground bg-secondary/40 px-2.5 py-1.5 rounded-md border border-border/50">
        {field.value}
      </span>
    </div>
  )
}
