export interface Usuario{
    id?: string | null,
    creacion?: string | null,
    uid?: string | null, 
    obra_social?: string | null,
    especialidad?: string | null,
    nombre: string ,
    apellido: string,
    edad: string,
    dni: string,
    correo: string,
    perfil: 'cliente' | 'empleado' | string,
    foto: string[] | string,

}