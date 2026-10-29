import express from 'express'

const app = express()

app.get('/health', (req, res) =>
  res.status(200).json({ ok: true })
)
app.use((req, res) => { res.status(404).json({ error: 'Not Found' }) })
app.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})
