const express = require("express")
const app = express()
const io = (app.io = require("socket.io")())
const cors = require("cors")
const bodyParser = require("body-parser")
const users = require("./routes/user")
const rooms = require("./routes/room")
const chat = require("./chat_namespace")

app.use(cors())
app.use(bodyParser.json())

/**
 * Middleware
 */
app.use((request, response, next) => {
  console.log("Time: ", Date.now())
  console.info(`${request.method} ${request.originalUrl}`)
  const start = new Date().getTime()
  response.on("finish", () => {
    const elapsed = new Date().getTime() - start
    console.info(`${request.method} ${request.originalUrl} ${response.statusCode} ${elapsed}ms`)
  })
  next()
})

/**
 * Routing
 */
// app.use("/auth", users)
// app.use("/rooms", rooms)
app.use("/chat/api/auth", users)
app.use("/chat/api/rooms", rooms)

// Static routing
// app.use(express.static(path.join(__dirname, '../dist')))

/**
 * Chat socket namespace
 */
chat.createNameSpace(io)

module.exports = app
