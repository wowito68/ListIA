"use client"

import { useState } from "react"
import { Bell, CalendarDays, Globe, Lock, Moon, Palette, Save, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PROFESSOR_INFO, SAMPLE_COURSES } from "@/lib/sample-data"
import { ScheduleGrid } from "./schedule-grid"

export function SettingsModule() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-4 md:p-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Configuración</h2>
          <p className="text-sm text-muted-foreground">
            Administra tu perfil y preferencias del sistema
          </p>
        </div>

        <Tabs defaultValue="profile" className="flex-1">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">
              <User className="mr-2 size-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="horario">
              <CalendarDays className="mr-2 size-4" />
              Horario
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 size-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="mr-2 size-4" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="mr-2 size-4" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="flex flex-col gap-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="size-20">
                      <AvatarImage src="/avatars/professor.jpg" />
                      <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                        RS
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        Cambiar foto
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG o GIF. Máximo 2MB.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        defaultValue={PROFESSOR_INFO.name}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={PROFESSOR_INFO.email}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        defaultValue={PROFESSOR_INFO.department}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="employee-id">Número de empleado</Label>
                      <Input
                        id="employee-id"
                        defaultValue="EMP-2024-001"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language & Region */}
              <Card>
                <CardHeader>
                  <CardTitle>Idioma y Región</CardTitle>
                  <CardDescription>
                    Configura tu idioma y formato de fecha preferido
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select defaultValue="es">
                        <SelectTrigger id="language">
                          <Globe className="mr-2 size-4" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español (México)</SelectItem>
                          <SelectItem value="en">English (US)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="timezone">Zona horaria</Label>
                      <Select defaultValue="america-mexico">
                        <SelectTrigger id="timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="america-mexico">
                            América/Ciudad de México
                          </SelectItem>
                          <SelectItem value="america-monterrey">
                            América/Monterrey
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="horario">
            <Card>
              <CardHeader>
                <CardTitle>Horario Semanal</CardTitle>
                <CardDescription>
                  Haz clic en las celdas para marcar tus clases. Selecciona primero la materia y luego los bloques correspondientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleGrid
                  courses={SAMPLE_COURSES.map((c) => ({
                    id: c.id,
                    name: c.name,
                    code: c.code,
                  }))}
                  initialSlots={[
                    { day: "Lunes",     time: "08:40", courseId: "1", courseName: "POO-501", color: "bg-primary/20 border-primary/50 text-primary" },
                    { day: "Miércoles", time: "08:40", courseId: "1", courseName: "POO-501", color: "bg-primary/20 border-primary/50 text-primary" },
                    { day: "Martes",    time: "10:20", courseId: "2", courseName: "BDA-502", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
                    { day: "Jueves",    time: "10:20", courseId: "2", courseName: "BDA-502", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
                    { day: "Viernes",   time: "14:30", courseId: "3", courseName: "IA-601",  color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
                    { day: "Viernes",   time: "15:20", courseId: "3", courseName: "IA-601",  color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
                <CardDescription>
                  Configura cómo y cuándo recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label>Notificaciones por correo</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir resumen diario de asistencia
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label>Alertas de ausencias</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar cuando un estudiante tenga 3+ ausencias
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label>Recordatorios de clase</Label>
                    <p className="text-sm text-muted-foreground">
                      Recordar tomar asistencia antes de cada clase
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label>Reportes semanales</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar resumen semanal los viernes
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>
                  Personaliza la apariencia de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label>Tema</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="flex flex-col items-center gap-2 rounded-lg border-2 border-primary p-4 transition-colors">
                      <Moon className="size-6" />
                      <span className="text-sm font-medium">Oscuro</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:border-primary">
                      <Sun className="size-6" />
                      <span className="text-sm font-medium">Claro</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:border-primary">
                      <div className="relative size-6">
                        <Sun className="absolute left-0 top-0 size-4" />
                        <Moon className="absolute bottom-0 right-0 size-4" />
                      </div>
                      <span className="text-sm font-medium">Sistema</span>
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label>Vista compacta</Label>
                    <p className="text-sm text-muted-foreground">
                      Reducir el espaciado en la interfaz
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label>Auto-avance en asistencia</Label>
                    <p className="text-sm text-muted-foreground">
                      Avanzar automáticamente al siguiente estudiante
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña de acceso
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button className="w-fit">Actualizar contraseña</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sesiones Activas</CardTitle>
                  <CardDescription>
                    Administra los dispositivos donde has iniciado sesión
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Este dispositivo</span>
                      <span className="text-sm text-muted-foreground">
                        Último acceso: Ahora
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      Cerrar otras sesiones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 size-4" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  )
}
