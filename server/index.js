import express from 'express'
import loger from 'morgan'

const port = process.env.PORT ?? 1999

const app = express()

app.use(loger('dev'))

app.get('/', (req,res)=>{
    res.sendFile(process.cwd() + '/client/index.html')
})

app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
})
