// useLeads — custom hook for fetching & mutating leads from Supabase
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useLeads(projectId) {
  const [leads,   setLeads]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    supabase
      .from('leads')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setLeads(data ?? [])
        setLoading(false)
      })
  }, [projectId])

  async function updateLeadStatus(leadId, status) {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)
    if (!error) setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
  }

  return { leads, loading, error, updateLeadStatus }
}
