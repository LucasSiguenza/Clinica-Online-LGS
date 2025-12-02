export interface Usuario{
    id?: string | null,
    creacion?: string | null,
    uid?: string | null, 
    estado?: string | boolean
    obra_social?: string | null,
    especialidad?: string | null,
    nombre: string ,
    apellido: string,
    edad: string,
    dni: string,
    cuil: string,
    correo: string,
    perfil: 'cliente' | 'empleado' | 'admin' | string,
    foto: string[] | string,
    isEmpleado?: boolean | null

}