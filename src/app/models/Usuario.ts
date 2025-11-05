export interface Usuario{
    id?: string | null,
    creacion?: string | null,
    uid?: string | null, 
    obra_social?: string | null,
    especialidad?: string | null,
    estado?: string | boolean
    nombre: string ,
    apellido: string,
    edad: string,
    dni: string,
    cuil: string,
    correo: string,
    perfil: 'cliente' | 'empleado' | string,
    foto: string[] | string,

}