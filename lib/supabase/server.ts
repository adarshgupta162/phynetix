import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      storage: {
        getItem: (key: string) => {
          const cookie = cookieStore.get(key)
          return cookie?.value || null
        },
        setItem: (key: string, value: string) => {
          try {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
            })
          } catch {
            // Ignore errors in server components
          }
        },
        removeItem: (key: string) => {
          try {
            cookieStore.delete(key)
          } catch {
            // Ignore errors in server components
          }
        },
      },
    },
  })
}
