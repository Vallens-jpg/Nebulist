import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Fetches ALL leads across all projects, grouped by status.
 * Exposes updateStatus() to mutate status in-place (optimistic UI).
 */
export function useAllLeads() {
  const [leads,   setLeads]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) setError(err.message)
    else setLeads(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function updateStatus(leadId, status) {
    // Optimistic update
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l))
    const { error: err } = await supabase.from('leads').update({ status }).eq('id', leadId)
    if (err) {
      setError(err.message)
      fetchLeads() // rollback on failure
    }
  }

  async function deleteLead(leadId) {
    // Optimistic remove
    setLeads(prev => prev.filter(l => l.id !== leadId))
    const { error: err } = await supabase.from('leads').delete().eq('id', leadId)
    if (err) {
      setError(err.message)
      fetchLeads() // rollback
    }
  }

  return { leads, loading, error, updateStatus, deleteLead, refetch: fetchLeads }
}
