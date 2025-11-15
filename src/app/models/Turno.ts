export interface Turno{
    id?: number,
    creado?: string,
    estado?: string,
    resenia?: string,
    nombreEmpleado?: string,
    nombrePaciente?: string,
    nombreEspecialidad?: string,
    empleado: number,
    especialidad: number,
    duracion: string,
    paciente: string | null,
    fecha: string | Date,
}