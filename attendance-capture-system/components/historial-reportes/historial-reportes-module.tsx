"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HistoryModule } from "@/components/history/history-module"
import { ReportsModule } from "@/components/reports/reports-module"

export function HistorialReportesModule() {
  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="historial" className="flex h-full flex-col">
        <div className="border-b border-border bg-card/50 px-6 pt-4">
          <TabsList className="h-auto p-0 bg-transparent gap-0 border-b-0">
            <TabsTrigger
              value="historial"
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-1 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
            >
              Historial
            </TabsTrigger>
            <TabsTrigger
              value="reportes"
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-1 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
            >
              Reportes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="historial" className="flex-1 overflow-hidden mt-0 border-0 p-0">
          <HistoryModule />
        </TabsContent>

        <TabsContent value="reportes" className="flex-1 overflow-hidden mt-0 border-0 p-0">
          <ReportsModule />
        </TabsContent>
      </Tabs>
    </div>
  )
}
