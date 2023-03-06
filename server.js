require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const port = process.env.PORT || 3004
const app = express()
const userRoutes = require("./routes/userRoutes")

//* middleware
app.use(express.json())

app.use("/api/user", userRoutes)

//* connect to the DB
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port: ${port}`)
    })
  })
  .catch((error) => {
    console.log(error)
  })
