import { z } from 'zod'

const emailField = z.email('Ingresa un correo válido, por ejemplo nombre@correo.com')

const namesField = z
  .string()
  .trim()
  .min(2, 'Ingresa tus nombres')
  .max(100, 'Usa como máximo 100 caracteres')

const surnamesField = z
  .string()
  .trim()
  .min(2, 'Ingresa tus apellidos')
  .max(100, 'Usa como máximo 100 caracteres')

const phoneField = z
  .string()
  .trim()
  .regex(/^(9\d{8})?$/, 'El celular debe tener 9 dígitos y empezar con 9')

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export const profileSchema = z.object({
  nombre: namesField,
  apellidos: surnamesField.or(z.literal('')),
  telefono: phoneField,
})

export const registerSchema = z
  .object({
    nombre: namesField,
    apellidos: surnamesField,
    telefono: phoneField,
    email: emailField,
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/,
        'Usa de 8 a 72 caracteres, con al menos una mayúscula, una minúscula y un número',
      ),
    confirmPassword: z.string(),
    universidad: z.string().min(1, 'Elige la universidad a la que postulas'),
    ofertaAcademicaId: z.number({ error: 'Elige la carrera que deseas estudiar' }),
  })
  .refine((form) => form.password === form.confirmPassword, {
    error: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({ email: emailField })

export type LoginForm = z.infer<typeof loginSchema>
export type ProfileForm = z.infer<typeof profileSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
