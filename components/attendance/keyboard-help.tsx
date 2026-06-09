"use client"

import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Kbd } from "@/components/ui/kbd"

export function KeyboardHelp() {
  const shortcuts = [
    { keys: ["↑", "↓"], action: "Navegar filas" },
    { keys: ["J", "K"], action: "Navegar (Vim)" },
    { keys: ["A"], action: "Marcar Asistencia" },
    { keys: ["N"], action: "No asistió" },
    { keys: ["R"], action: "Retardo" },
    { keys: ["Esc"], action: "Limpiar fila" },
    { keys: ["Enter"], action: "Ciclar y avanzar" },
    { keys: ["/"], action: "Buscar alumno" },
    { keys: ["Shift", "↑", "↓"], action: "Selección múltiple" },
    { keys: ["Shift", "Clic"], action: "Seleccionar rango" },
    { keys: ["Ctrl", "Z"], action: "Deshacer último cambio" },
    { keys: ["Ctrl", "S"], action: "Guardar registro" },
    { keys: ["Home"], action: "Ir al inicio" },
    { keys: ["End"], action: "Ir al final" },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Keyboard className="mr-2 size-4" />
          Atajos
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">Atajos de Teclado</div>
          <div className="flex flex-col gap-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.action}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Al marcar con A, N o R el cursor avanza automáticamente a la siguiente fila.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
