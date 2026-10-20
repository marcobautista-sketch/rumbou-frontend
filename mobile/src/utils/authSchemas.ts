import { z } from 'zod'

const emailField = z.email('Ingresa un correo válido, por ejemplo nombre@correo.com')

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, 'Ingresa tu nombre')
      .max(100, 'Usa como máximo 100 caracteres'),
    email: emailField,
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/,
        'Usa de 8 a 72 caracteres, con al menos una mayúscula, una minúscula y un número',
      ),
    confirmPassword: z.string(),
  })
  .refine((form) => form.password === form.confirmPassword, {
    error: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
