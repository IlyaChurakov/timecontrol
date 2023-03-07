const cors = require("cors")
const express = require("express")
const bodyParser = require("body-parser")
const router = require("./routes/routes")

const PORT = process.env.PORT || 8080
const app = express()

// CORS
const whitelist = ["http://localhost:3000"]
// const whitelist = ["http://172.16.3.158:3000"]
const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error("Not allowed by CORS"))
		}
	},
	credentials: true,
}
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(router)

app.listen(PORT, () => {
	console.log(`Server has been started on PORT ${PORT}`)
})
