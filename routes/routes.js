const Router = require("express")
const fs = require("fs")
const db = require("../controllers/connectionPG")
const dataController = require("../controllers/data.controller")
const { RusGuard } = require("../controllers/RusGuard")
const { dbMS } = require("../controllers/connectionMS")
const router = new Router()

let data = null

setInterval(async () => {
	data = await new RusGuard(dbMS).getData()

	if ((data != null) & (data != undefined)) {
		console.log("События за последнюю минуту:")
		return data
	} else {
		console.log("RusGuard: Данных нет")
	}
}, 30000)

// Router paths

let filterReg = {
	value: "",
}

let reportData = {
	fio: "",
	date: "",
	zone: "",
}

router.post("/hook", dataController.insertCameraEvent)
router.post("/filter", async (req, res) => {
	res.send()
	filterReg.value = req.body.value
})
router.get("/filter", async (req, res) => {
	const dataPG = await db.query(`
			SELECT
				id, name
				,"ID_controller"
				,"cardNumber"
				,"eventType"
				,date
				,driver_name
			FROM data_store.skud_data
				JOIN data_store.skud_employees
					ON "cardNumber" = id_employee
				JOIN data_store.work_zone
					ON "ID_controller" = id_driver
			WHERE ("eventType" = 'Выход'
				OR "eventType" = 'Вход'
				OR "eventType" = 'Выход по лицу'
				OR "eventType" = 'Вход по лицу')
				AND name ILIKE '%${filterReg.value}%'
			GROUP BY id, name, driver_name
			ORDER BY id DESC LIMIT 50
		`)

	dataPG.rows.forEach(row => {
		const dateObj = {
			clearDate: "",
			HMS: "",
			day: "",
			month: "",
			year: "",
		}

		dateObj.clearDate = String(row.date).split("GMT")[0]
		dateObj.HMS = dateObj.clearDate.split(/\s\d\d\d\d\s/)[1].slice(0, -1)
		dateObj.day = dateObj.clearDate
			.split(/\s\d\d\d\d\s/)[0]
			.split(/\s\w\w\w\s/)[1]
		dateObj.month = dateObj.clearDate.match(/\s\w\w\w/)[0].substring(1)
		dateObj.year = dateObj.clearDate.match(/\d\d\d\d/)[0]

		switch (dateObj.month) {
			case "Jan":
				dateObj.month = "01"
				break
			case "Feb":
				dateObj.month = "02"
				break
			case "Mar":
				dateObj.month = "03"
				break
			case "Apr":
				dateObj.month = "04"
				break
			case "May":
				dateObj.month = "05"
				break
			case "Jun":
				dateObj.month = "06"
				break
			case "Jul":
				dateObj.month = "07"
				break
			case "Aug":
				dateObj.month = "08"
				break
			case "Sep":
				dateObj.month = "09"
				break
			case "Oct":
				dateObj.month = "10"
				break
			case "Nov":
				dateObj.month = "11"
				break
			case "Dec":
				dateObj.month = "12"
				break
			default:
				return dateObj.month
		}

		let resultDate =
			dateObj.year +
			"-" +
			dateObj.month +
			"-" +
			dateObj.day +
			"T" +
			dateObj.HMS +
			".000Z"

		row.date = resultDate
	})

	res.send(dataPG.rows)
})
router.post("/report", async (req, res) => {
	res.send(req.body)
	reportData.fio = req.body.fio
	reportData.date = req.body.date
})
router.get("/report", async (req, res) => {
	const dataPG = await db.query(`
			SELECT
				id, name
				,"ID_controller"
				,"cardNumber"
				,"eventType"
				,date
				,driver_name
			FROM data_store.skud_data
				JOIN data_store.skud_employees
					ON "cardNumber" = id_employee
				JOIN data_store.work_zone
					ON "ID_controller" = id_driver
			WHERE ("eventType" = 'Выход'
				OR "eventType" = 'Вход'
				OR "eventType" = 'Выход по лицу'
				OR "eventType" = 'Вход по лицу')
				AND name ILIKE '%${reportData.fio}%'
				AND date::text ILIKE '${reportData.date}%'
			GROUP BY id, name, driver_name
			ORDER BY id DESC LIMIT 50
		`)

	dataPG.rows.forEach(row => {
		const dateObj = {
			clearDate: "",
			HMS: "",
			day: "",
			month: "",
			year: "",
		}

		dateObj.clearDate = String(row.date).split("GMT")[0]
		dateObj.HMS = dateObj.clearDate.split(/\s\d\d\d\d\s/)[1].slice(0, -1)
		dateObj.day = dateObj.clearDate
			.split(/\s\d\d\d\d\s/)[0]
			.split(/\s\w\w\w\s/)[1]
		dateObj.month = dateObj.clearDate.match(/\s\w\w\w/)[0].substring(1)
		dateObj.year = dateObj.clearDate.match(/\d\d\d\d/)[0]

		switch (dateObj.month) {
			case "Jan":
				dateObj.month = "01"
				break
			case "Feb":
				dateObj.month = "02"
				break
			case "Mar":
				dateObj.month = "03"
				break
			case "Apr":
				dateObj.month = "04"
				break
			case "May":
				dateObj.month = "05"
				break
			case "Jun":
				dateObj.month = "06"
				break
			case "Jul":
				dateObj.month = "07"
				break
			case "Aug":
				dateObj.month = "08"
				break
			case "Sep":
				dateObj.month = "09"
				break
			case "Oct":
				dateObj.month = "10"
				break
			case "Nov":
				dateObj.month = "11"
				break
			case "Dec":
				dateObj.month = "12"
				break
			default:
				return dateObj.month
		}

		let resultDate =
			dateObj.year +
			"-" +
			dateObj.month +
			"-" +
			dateObj.day +
			"T" +
			dateObj.HMS +
			".000Z"

		row.date = resultDate
	})

	res.send(dataPG.rows)
})
router.post("/camfilter", async (req, res) => {
	res.send()
	filterReg.value = req.body.value
})
router.get("/camfilter", async (req, res) => {
	const dataPG = await db.query(`
			SELECT
				id
				,"id_camera"
				,name
				,fio
				,date
			FROM data_store.camera_data 
				JOIN data_store.dossiers 
					ON id_dossier = id_dossiers
				JOIN data_store.camera_names
					ON id_camera = camera_id
			WHERE fio ILIKE '%${filterReg.value}%'
			GROUP BY id, name, fio
			ORDER BY id DESC LIMIT 50
		`)

	dataPG.rows.forEach(row => {
		const dateObj = {
			clearDate: "",
			HMS: "",
			day: "",
			month: "",
			year: "",
		}

		dateObj.clearDate = String(row.date).split("GMT")[0]
		dateObj.HMS = dateObj.clearDate.split(/\s\d\d\d\d\s/)[1].slice(0, -1)
		dateObj.day = dateObj.clearDate
			.split(/\s\d\d\d\d\s/)[0]
			.split(/\s\w\w\w\s/)[1]
		dateObj.month = dateObj.clearDate.match(/\s\w\w\w/)[0].substring(1)
		dateObj.year = dateObj.clearDate.match(/\d\d\d\d/)[0]

		switch (dateObj.month) {
			case "Jan":
				dateObj.month = "01"
				break
			case "Feb":
				dateObj.month = "02"
				break
			case "Mar":
				dateObj.month = "03"
				break
			case "Apr":
				dateObj.month = "04"
				break
			case "May":
				dateObj.month = "05"
				break
			case "Jun":
				dateObj.month = "06"
				break
			case "Jul":
				dateObj.month = "07"
				break
			case "Aug":
				dateObj.month = "08"
				break
			case "Sep":
				dateObj.month = "09"
				break
			case "Oct":
				dateObj.month = "10"
				break
			case "Nov":
				dateObj.month = "11"
				break
			case "Dec":
				dateObj.month = "12"
				break
			default:
				return dateObj.month
		}

		let resultDate =
			dateObj.year +
			"-" +
			dateObj.month +
			"-" +
			dateObj.day +
			"T" +
			dateObj.HMS +
			".000Z"

		row.date = resultDate
	})

	res.send(dataPG.rows)
})
router.post("/camreport", async (req, res) => {
	res.send(req.body)
	reportData.fio = req.body.fio
	reportData.zone = req.body.zone
	reportData.date = req.body.date
})
router.get("/camreport", async (req, res) => {
	const dataPG = await db.query(
		(reportData.fio || reportData.zone) && reportData.date
			? `
			SELECT
				id
				,"id_camera"
				,name
				,fio
				,date
			FROM data_store.camera_data 
				JOIN data_store.dossiers 
					ON id_dossier = id_dossiers
				JOIN data_store.camera_names
					ON id_camera = camera_id
			WHERE 
				fio ILIKE '%${reportData.fio}%'
				AND name ILIKE '${reportData.zone}%'
				AND date::text ILIKE '${reportData.date}%'
			GROUP BY id, name, fio
			ORDER BY id DESC
		`
			: `SELECT
				id
				,"id_camera"
				,name
				,fio
				,date
			FROM data_store.camera_data 
				JOIN data_store.dossiers 
					ON id_dossier = id_dossiers
				JOIN data_store.camera_names
					ON id_camera = camera_id
			WHERE 
				fio ILIKE '%${reportData.fio}%'
				AND name ILIKE '${reportData.zone}%'
				AND date::text ILIKE '${reportData.date}%'
			GROUP BY id, name, fio
			ORDER BY id DESC LIMIT 50
		`
	)

	dataPG.rows.forEach(row => {
		const dateObj = {
			clearDate: "",
			HMS: "",
			day: "",
			month: "",
			year: "",
		}

		dateObj.clearDate = String(row.date).split("GMT")[0]
		dateObj.HMS = dateObj.clearDate.split(/\s\d\d\d\d\s/)[1].slice(0, -1)
		dateObj.day = dateObj.clearDate
			.split(/\s\d\d\d\d\s/)[0]
			.split(/\s\w\w\w\s/)[1]
		dateObj.month = dateObj.clearDate.match(/\s\w\w\w/)[0].substring(1)
		dateObj.year = dateObj.clearDate.match(/\d\d\d\d/)[0]

		switch (dateObj.month) {
			case "Jan":
				dateObj.month = "01"
				break
			case "Feb":
				dateObj.month = "02"
				break
			case "Mar":
				dateObj.month = "03"
				break
			case "Apr":
				dateObj.month = "04"
				break
			case "May":
				dateObj.month = "05"
				break
			case "Jun":
				dateObj.month = "06"
				break
			case "Jul":
				dateObj.month = "07"
				break
			case "Aug":
				dateObj.month = "08"
				break
			case "Sep":
				dateObj.month = "09"
				break
			case "Oct":
				dateObj.month = "10"
				break
			case "Nov":
				dateObj.month = "11"
				break
			case "Dec":
				dateObj.month = "12"
				break
			default:
				return dateObj.month
		}

		let resultDate =
			dateObj.year +
			"-" +
			dateObj.month +
			"-" +
			dateObj.day +
			"T" +
			dateObj.HMS +
			".000Z"

		row.date = resultDate
	})

	res.send(dataPG.rows)
})
router.get("/zones", async (req, res) => {
	const dataPG = await db.query(`
			SELECT
				camera_id
				,name
			FROM data_store.camera_names
		`)

	res.send(dataPG.rows)
})
router.get("/database", (req, res) => {
	dataController.getDoorEvents(req, res) // убрал data
})

router.get("/employees", async (req, res) => {
	const dataPG = await db.query(`
			SELECT
				DISTINCT name
			FROM data_store.skud_employees
		`)

	res.send(dataPG.rows)
})

const reportDataArr = []

// router.post("/allempskud", async (req, res) => {
// 	res.send(req.body)
// 	reportData.date = req.body.date
// 	reportData.name = req.body.name
// 	// reportDataArr.push(req.body.name)
// })

const arrDataPG = []

router.get("/allempskud", async (req, res) => {
	console.log(req.query)
	// await reportDataArr.forEach(async item => {
	let dataPG = await db.query(
		`SELECT 
			id, name
			,"ID_controller"
			,"cardNumber"
			,"eventType"
			,date
			,driver_name 
		FROM data_store.skud_data 
			JOIN data_store.skud_employees 
				ON "cardNumber" = id_employee
			JOIN data_store.work_zone
				ON "ID_controller" = id_driver
		WHERE ("eventType" = 'Выход' 
			OR "eventType" = 'Вход' 
			OR "eventType" = 'Выход по лицу' 
			OR "eventType" = 'Вход по лицу')
			AND name LIKE '${req.query.name}%'
			AND date::text LIKE '${req.query.date}%'
		GROUP BY id, name, driver_name 
		ORDER BY id DESC`
	)

	dataPG.rows.forEach(row => {
		const dateObj = {
			clearDate: "",
			HMS: "",
			day: "",
			month: "",
			year: "",
		}

		dateObj.clearDate = String(row.date).split("GMT")[0]
		dateObj.HMS = dateObj.clearDate.split(/\s\d\d\d\d\s/)[1].slice(0, -1)
		dateObj.day = dateObj.clearDate
			.split(/\s\d\d\d\d\s/)[0]
			.split(/\s\w\w\w\s/)[1]
		dateObj.month = dateObj.clearDate.match(/\s\w\w\w/)[0].substring(1)
		dateObj.year = dateObj.clearDate.match(/\d\d\d\d/)[0]

		switch (dateObj.month) {
			case "Jan":
				dateObj.month = "01"
				break
			case "Feb":
				dateObj.month = "02"
				break
			case "Mar":
				dateObj.month = "03"
				break
			case "Apr":
				dateObj.month = "04"
				break
			case "May":
				dateObj.month = "05"
				break
			case "Jun":
				dateObj.month = "06"
				break
			case "Jul":
				dateObj.month = "07"
				break
			case "Aug":
				dateObj.month = "08"
				break
			case "Sep":
				dateObj.month = "09"
				break
			case "Oct":
				dateObj.month = "10"
				break
			case "Nov":
				dateObj.month = "11"
				break
			case "Dec":
				dateObj.month = "12"
				break
			default:
				return dateObj.month
		}

		let resultDate =
			dateObj.year +
			"-" +
			dateObj.month +
			"-" +
			dateObj.day +
			"T" +
			dateObj.HMS +
			".000Z"

		row.date = resultDate
	})

	res.send(dataPG.rows)
})

router.get("/hook", dataController.getCameraEvents)
// router.get("/onec", dataController.getAllOnecData)
// router.get("/onec/today", dataController.getTodayOnecData)
router.get("/data", dataController.getLastCameraEvent)
// router.get("/dossiers", dataController.getDossiers)

// router.put("/data/:id", dataController.updateCameraEvent)

// router.delete("/deleteonec", dataController.deleteDataFromOnec)

// Получение данных из файла выгрузки 1С:ЗУП

const currentDate = new Date()

let day =
		+currentDate.getDate() < 10
			? `0${currentDate.getDate()}`
			: currentDate.getDate(),
	month =
		+currentDate.getMonth() < 10
			? `0${currentDate.getMonth() + 1}`
			: currentDate.getMonth() + 1,
	year = currentDate.getFullYear()

let date = `${day}.${month}.${year}`
// let yesterday = `${day - 1}.${month}.${year}`

const readData = async filedate => {
	await fs.readFile(
		`../1c/${filedate}.json`,
		"utf8",
		async function (error, data) {
			if (error) {
				console.log("1С: Не удалось прочитать файл выгрузки")
			} else {
				console.log("1C: Данные из файла выгрузки обновлены успешно")
				dataJson = JSON.parse(data)
				// await db.query(`DELETE FROM onec`)
				await dataJson.forEach(item => {
					db.query(
						`INSERT INTO onec (name, surname, vacation_dates, sick_dates, date) values ($1, $2, $3, $4, $5)`,
						[
							item.name,
							item.surname,
							item.vacation_dates,
							item.sick_dates,
							date,
						]
					)
				})

				return JSON.parse(data)
			}
		}
	)
}

setInterval(() => {
	// readData(date)
}, 600000)

module.exports = router
