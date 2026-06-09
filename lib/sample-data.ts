import type { Course, Student, AttendanceRecord, CalendarEvent } from './types'

// Sample students data
export const SAMPLE_STUDENTS: Student[] = [
  { id: "1", name: "García López, María Elena", email: "maria.garcia@universidad.edu", matricula: "2024001" },
  { id: "2", name: "Hernández Martínez, Juan Carlos", email: "juan.hernandez@universidad.edu", matricula: "2024002" },
  { id: "3", name: "López García, Ana Sofía", email: "ana.lopez@universidad.edu", matricula: "2024003" },
  { id: "4", name: "Martínez Rodríguez, Pedro Antonio", email: "pedro.martinez@universidad.edu", matricula: "2024004" },
  { id: "5", name: "Rodríguez Sánchez, Lucía Fernanda", email: "lucia.rodriguez@universidad.edu", matricula: "2024005" },
  { id: "6", name: "Sánchez Ramírez, Diego Alejandro", email: "diego.sanchez@universidad.edu", matricula: "2024006" },
  { id: "7", name: "Ramírez Torres, Valentina", email: "valentina.ramirez@universidad.edu", matricula: "2024007" },
  { id: "8", name: "Torres Flores, Miguel Ángel", email: "miguel.torres@universidad.edu", matricula: "2024008" },
  { id: "9", name: "Flores González, Isabella", email: "isabella.flores@universidad.edu", matricula: "2024009" },
  { id: "10", name: "González Díaz, Sebastián", email: "sebastian.gonzalez@universidad.edu", matricula: "2024010" },
  { id: "11", name: "Díaz Morales, Camila Andrea", email: "camila.diaz@universidad.edu", matricula: "2024011" },
  { id: "12", name: "Morales Ruiz, Emiliano", email: "emiliano.morales@universidad.edu", matricula: "2024012" },
  { id: "13", name: "Ruiz Ortega, Regina", email: "regina.ruiz@universidad.edu", matricula: "2024013" },
  { id: "14", name: "Ortega Mendoza, Mateo", email: "mateo.ortega@universidad.edu", matricula: "2024014" },
  { id: "15", name: "Mendoza Castillo, Ximena", email: "ximena.mendoza@universidad.edu", matricula: "2024015" },
  { id: "16", name: "Castillo Vargas, Santiago", email: "santiago.castillo@universidad.edu", matricula: "2024016" },
  { id: "17", name: "Vargas Jiménez, Daniela", email: "daniela.vargas@universidad.edu", matricula: "2024017" },
  { id: "18", name: "Jiménez Aguilar, Leonardo", email: "leonardo.jimenez@universidad.edu", matricula: "2024018" },
  { id: "19", name: "Aguilar Cruz, Renata", email: "renata.aguilar@universidad.edu", matricula: "2024019" },
  { id: "20", name: "Cruz Medina, Nicolás", email: "nicolas.cruz@universidad.edu", matricula: "2024020" },
  { id: "21", name: "Medina Herrera, Mariana", email: "mariana.medina@universidad.edu", matricula: "2024021" },
  { id: "22", name: "Herrera Reyes, Andrés", email: "andres.herrera@universidad.edu", matricula: "2024022" },
  { id: "23", name: "Reyes Silva, Paula", email: "paula.reyes@universidad.edu", matricula: "2024023" },
  { id: "24", name: "Silva Peña, Gabriel", email: "gabriel.silva@universidad.edu", matricula: "2024024" },
  { id: "25", name: "Peña Vega, Victoria", email: "victoria.pena@universidad.edu", matricula: "2024025" },
  { id: "26", name: "Vega Ramos, Fernando", email: "fernando.vega@universidad.edu", matricula: "2024026" },
  { id: "27", name: "Ramos Ibarra, Fernanda", email: "fernanda.ramos@universidad.edu", matricula: "2024027" },
  { id: "28", name: "Ibarra Contreras, Rodrigo", email: "rodrigo.ibarra@universidad.edu", matricula: "2024028" },
  { id: "29", name: "Contreras Luna, Valeria", email: "valeria.contreras@universidad.edu", matricula: "2024029" },
  { id: "30", name: "Luna Domínguez, Alejandro", email: "alejandro.luna@universidad.edu", matricula: "2024030" },
  { id: "31", name: "Domínguez Espinosa, Sara", email: "sara.dominguez@universidad.edu", matricula: "2024031" },
  { id: "32", name: "Espinosa Navarro, Carlos", email: "carlos.espinosa@universidad.edu", matricula: "2024032" },
  { id: "33", name: "Navarro Guerrero, Elena", email: "elena.navarro@universidad.edu", matricula: "2024033" },
  { id: "34", name: "Guerrero Méndez, Tomás", email: "tomas.guerrero@universidad.edu", matricula: "2024034" },
  { id: "35", name: "Méndez Ponce, Adriana", email: "adriana.mendez@universidad.edu", matricula: "2024035" },
]

// Sample courses
export const SAMPLE_COURSES: Course[] = [
  {
    id: "1",
    name: "Programación Orientada a Objetos",
    code: "POO-501",
    section: "Grupo A - ISC",
    schedule: "Lunes y Miércoles 8:00 - 10:00",
    room: "Aula 301",
    students: SAMPLE_STUDENTS,
    attendance: []
  },
  {
    id: "2",
    name: "Bases de Datos Avanzadas",
    code: "BDA-502",
    section: "Grupo B - ISC",
    schedule: "Martes y Jueves 10:00 - 12:00",
    room: "Lab. Cómputo 2",
    students: SAMPLE_STUDENTS.slice(0, 28),
    attendance: []
  },
  {
    id: "3",
    name: "Inteligencia Artificial",
    code: "IA-601",
    section: "Grupo A - ISC",
    schedule: "Viernes 14:00 - 18:00",
    room: "Aula 405",
    students: SAMPLE_STUDENTS.slice(0, 22),
    attendance: []
  }
]

// Sample calendar events
export const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Clase POO", date: "2026-06-01", type: "class", courseId: "1" },
  { id: "2", title: "Clase BDA", date: "2026-06-02", type: "class", courseId: "2" },
  { id: "3", title: "Examen Parcial POO", date: "2026-06-15", type: "exam", courseId: "1", description: "Unidad 1-3" },
  { id: "4", title: "Entrega Proyecto IA", date: "2026-06-20", type: "deadline", courseId: "3" },
  { id: "5", title: "Día Festivo", date: "2026-06-10", type: "holiday", description: "Suspensión de labores" },
]

export const PROFESSOR_INFO = {
  name: "Dr. Roberto Sánchez Pérez",
  department: "Ingeniería en Sistemas Computacionales",
  email: "roberto.sanchez@universidad.edu"
}

// Generate sample attendance history
export function generateAttendanceHistory(students: Student[], days: number = 30): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  const statuses: ('present' | 'absent' | 'late' | 'justified')[] = ['present', 'present', 'present', 'present', 'present', 'absent', 'late', 'justified']
  
  for (let d = 0; d < days; d++) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    const dateStr = date.toISOString().split('T')[0]
    
    for (const student of students) {
      // 85% chance of being present, 8% absent, 5% late, 2% justified
      const rand = Math.random()
      let status: 'present' | 'absent' | 'late' | 'justified'
      if (rand < 0.85) status = 'present'
      else if (rand < 0.93) status = 'absent'
      else if (rand < 0.98) status = 'late'
      else status = 'justified'
      
      records.push({
        studentId: student.id,
        date: dateStr,
        status
      })
    }
  }
  
  return records
}
