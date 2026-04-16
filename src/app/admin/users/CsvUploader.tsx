'use client'

import { useState } from 'react'
import { bulkCreateUsers } from '../actions'
import { Upload, X, Loader2 } from 'lucide-react'

export function CsvUploader() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    const text = await file.text()
    const rows = text.split('\n').filter(r => r.trim().length > 0)
    if (rows.length < 2) {
      setError('CSV file is empty or missing headers.')
      setLoading(false)
      return
    }

    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    const parsedData = rows.slice(1).map(row => {
      // Regex correctly splits CSV ignoring commas inside quotes
      const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',')
      const obj: any = {}
      headers.forEach((h, i) => {
        let val = values[i] || ''
        obj[h] = val.replace(/^"|"$/g, '').trim()
      })
      return obj
    })

    try {
      await bulkCreateUsers(parsedData)
      setIsOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to import staff.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
        <Upload className="w-4 h-4" /> Bulk Import CSV
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-lg p-6 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-2">Import Staff via CSV</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a comma-separated values (.csv) file. The first row must be the header containing exactly these keys: 
              <br/><br/>
              <code className="text-[10px] bg-muted p-1 rounded">email, firstName, lastName, branch, category, staffId, epfNo, nicPassport, telephoneNumber, etc</code>
            </p>

            {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-4">{error}</p>}

            <div className="relative group overflow-hidden bg-muted/30 border-2 border-dashed border-border hover:border-primary rounded-xl flex items-center justify-center h-32 transition-colors">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-sm font-semibold">Importing data...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-semibold">Select CSV file</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
