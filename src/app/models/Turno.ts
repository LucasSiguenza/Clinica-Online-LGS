export interface Turno{
    id?: number,
    creado?: string,
    estado?: string,
    resenia?: number,
    empleado: number,
    especialidad: number,
    duracion: string,
    paciente: string | null,
    fecha: string | Date,
}