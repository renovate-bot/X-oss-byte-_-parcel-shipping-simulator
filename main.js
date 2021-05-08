const http = require(`http`)
// const db = require("./config/database")
const routers = require(`./routes`)
const { App } = require(`./utils/app.js`)
require("dotenv").config();



app = new App(80)
app.use(routers.adminRouter)
app.use(routers.clientRouter)
app.use(routers.driverRouter)
app.use(routers.employeeRouter)
app.use(routers.commonRouter)
// app.addDb(db)
console.log(app)
app.listen()