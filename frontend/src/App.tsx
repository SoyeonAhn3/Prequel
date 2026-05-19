function App() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-bold text-text tracking-tight">Prequel</h1>
        <p className="text-text-muted mt-2 text-sm">
          Phase 1 — Project Setup Complete
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-green-soft text-green rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />
          Frontend running
        </div>
      </div>
    </div>
  )
}

export default App
