import { useSupabase } from '../utils/supabase'

export default defineEventHandler(async () => {
  try {
    const supabase = useSupabase()

    // Simple connection test - get server timestamp
    const { data, error } = await supabase.rpc('now')

    if (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code,
      }
    }

    return {
      status: 'ok',
      message: 'Supabase connection successful',
      serverTime: data,
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: err.message || 'Unknown error',
    }
  }
})
