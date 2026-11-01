import express from 'express'

const app = express()

app.get('/health', (req, res) =>
  res.status(200).json({ ok: true })
)
app.use((req, res) => { res.status(404).json({ error: 'Not Found, Please try again' }) })
app.listen(3000, () => {
  console.log('listened on http://localhost:3000')
})
