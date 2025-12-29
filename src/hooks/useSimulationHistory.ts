import { useState, useCallback } from 'react'
import type { SimulationScenario } from '../types/ScenarioTypes'

const STORAGE_KEY = 'imob_invest_history'
const MAX_HISTORY_ITEMS = 50

export interface HistoryItem {
  id: string
  clientName: string
  date: string
  propertyValue: number
  scenario: SimulationScenario
}

export function useSimulationHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load simulation history:', error)
      return []
    }
  })

  const saveSimulation = useCallback((scenario: SimulationScenario) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      let currentHistory: HistoryItem[] = stored ? JSON.parse(stored) : []

      const newItem: HistoryItem = {
        id: scenario.id || crypto.randomUUID(),
        clientName: scenario.clientName || 'Cliente Sem Nome',
        date: new Date().toISOString(),
        propertyValue: Number(scenario.propertyValue) || 0,
        scenario: { ...scenario, id: scenario.id || crypto.randomUUID() } // Ensure ID is in scenario
      }

      // Check if updating existing by ID
      const existingIndex = currentHistory.findIndex(item => item.id === newItem.id)

      if (existingIndex >= 0) {
        currentHistory[existingIndex] = newItem
      } else {
        // Add to beginning
        currentHistory.unshift(newItem)
      }

      // Limit size
      if (currentHistory.length > MAX_HISTORY_ITEMS) {
        currentHistory = currentHistory.slice(0, MAX_HISTORY_ITEMS)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentHistory))
      setHistory(currentHistory)
    } catch (error) {
      console.error('Failed to save simulation:', error)
    }
  }, [])

  const deleteSimulation = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const currentHistory: HistoryItem[] = JSON.parse(stored)
        const newHistory = currentHistory.filter(item => item.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
        setHistory(newHistory)
      }
    } catch (error) {
      console.error('Failed to delete simulation:', error)
    }
  }, [])

  const getRecentSimulations = useCallback(() => {
    return history
  }, [history])

  return {
    recentSimulations: history,
    saveSimulation,
    deleteSimulation,
    getRecentSimulations
  }
}
