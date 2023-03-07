const db = require("./connectionPG")
const { dbMS } = require("./connectionMS")
const { RusGuard } = require("./RusGuard")
const fs = require("fs")
const request = require("request")

// Здесь пишутся только сами запросы

class DataController {
	// RusGuard

	async getDoorEvents(req, res) {
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
			WHERE "eventType" = 'Выход' 
				OR "eventType" = 'Вход' 
				OR "eventType" = 'Выход по лицу' 
				OR "eventType" = 'Вход по лицу' 
			GROUP BY id, name, driver_name 
			ORDER BY id DESC LIMIT 50`
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
	}

	async getDoorEventsAllEmployees(req, res) {
		// будет в отчетности искать все события сотрудника

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
			WHERE "eventType" = 'Выход' 
				OR "eventType" = 'Вход' 
				OR "eventType" = 'Выход по лицу' 
				OR "eventType" = 'Вход по лицу'
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
	}

	// FindFace

	async getLastCameraEvent(req, res) {
		const data = await db.query(
			`SELECT id, matched_object, id_camera, date 
			FROM data_store.camera_data 
			ORDER BY id 
			DESC LIMIT 1`
		)
		res.json(data.rows)
	}
	async updateCameraEvent(req, res) {
		const id = req.params.id
		const { camera, workspace_camera, time } = req.body
		const data = await db.query(
			`UPDATE events set camera = $1, workspace_camera = $2, time = $3 
			WHERE id = $4 
			RETURNING *`,
			[camera, workspace_camera, time, id]
		)
		res.json(data.rows)
	}
	async insertCameraEvent(req, res) {
		res.send(req.body)
		// console.log(req.body)
		// const lastEvent = await db.query(
		// 	`SELECT id, matched_object, id_camera, date FROM data_store.camera_data ORDER BY id DESC LIMIT 1`
		// )
		// console.log("За последние 5 секунд")
		const eventsInFiveSeconds = await db.query(
			`SELECT id_camera, matched_object, date, id_dossier, name 
			FROM data_store.camera_data
				JOIN data_store.camera_names
					ON id_camera = camera_id
			WHERE date > current_timestamp - interval '5 seconds'`
		)

		// console.log(eventsInFiveSeconds.rows)
		// eventsInFiveSeconds.rows.forEach((item, num) => {
		// 	if (
		// 		item.matched_object != req.body[num].matched_object &&
		// 		item.camera != req.body[num].camera
		// 	) {
		// 		console.log("Вкинуто")
		// 	} else {
		// 		console.log("Не вкинуто")
		// 	}
		// })

		await req.body.forEach(item => {
			let check = true
			eventsInFiveSeconds.rows.forEach(it => {
				// console.log(item.camera, it.id_camera)
				// console.log(item.matched_dossier, it.id_dossier)
				if (
					item.camera == it.id_camera &&
					item.matched_dossier == it.id_dossier
				) {
					console.log("Не вкинулось")
					check = false
					return check
				} else {
					console.log("Вкинулось")
					check = true
					return check
				}
			})

			if (check) {
				console.log(check)
				db.query(
					`INSERT INTO data_store.camera_data (matched_object, id_camera, date, id_dossier) 
					VALUES ($1, $2, $3, $4)`,
					[
						req.body[0].matched_object,
						req.body[0].camera,
						req.body[0].created_date.split("+")[0], // Разобраться с часовым поясом
						req.body[0].matched_dossier,
					]
				)
				res.status(200).end()
			}
		})

		// console.log(eventsInFiveSeconds)
		// if (
		// 	lastEvent.rows[0].matched_object != req.body[0].matched_object &&
		// 	lastEvent.rows[0].camera != req.body[0].camera
		// ) {
		// Проверка на существование в базе такого события
		// console.log("Попытка вкинуть камеры в базу")
		// await db.query(
		// 	`INSERT INTO data_store.camera_data (matched_object, id_camera, date) values ($1, $2, $3)`,
		// 	[
		// 		req.body[0].matched_object,
		// 		req.body[0].camera,
		// 		req.body[0].created_date.split("+")[0], // Разобраться с часовым поясом
		// 	]
		// )
		// res.status(200).end()
		// }
	}
	async getCameraEvents(req, res) {
		const dataPG = await db.query(
			`SELECT * 
			FROM data_store.camera_data 
				JOIN data_store.dossiers 
					ON id_dossier = id_dossiers
				JOIN data_store.camera_names
					ON id_camera = camera_id
			ORDER BY id 
			DESC LIMIT 10`
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

		res.json(dataPG.rows)
	}
	// async getDossiers(req, res) {
	// 	await request(
	// 		{
	// 			method: "GET",
	// 			// url: "http://172.16.3.98/events/faces",
	// 			// url: "http://172.16.3.98/dossiers",
	// 			url: "http://172.16.3.98/dossiers/?page=2ar7pCV2V0dsrlbDnsFBZgI8DruQCS95wMg4kcN6W5OTIlOQ3VaBFyZpQ",
	// 			headers: {
	// 				authorization:
	// 					"Token 5aecaaa12387ecfe996d97fc450b8a17c1453736db60ba6599c813dc3ca4ba8d",
	// 			},
	// 		},
	// 		async (err, response, body) => {
	// 			if (!err && response.statusCode == 200) {
	// 				res.json(body)

	// 				await JSON.parse(body).results.forEach(async item => {
	// 					await db.query(
	// 						`INSERT INTO data_store.dossiers (id, fio) values ($1, $2) ON CONFLICT DO NOTHING`,
	// 						[item.id, item.name]
	// 					)
	// 				})
	// 			}
	// 		}
	// 	)
	// }
	async getCameraNames(req, res) {
		await request(
			{
				method: "GET",
				url: "http://172.16.3.98/cameras/?page=2ar7pCV2V0dsrlbgrZUhD36oZDtbW57iZJOeKW49EFujhMjrNHAApKCFE",
				headers: {
					authorization:
						"Token a2db5c7a43cb0d4527dc8b25aa2b2c9355ad68cfb57099a9209f7280057f09c6",
				},
			},
			async (err, response, body) => {
				if (!err && response.statusCode == 200) {
					res.json(body)

					await JSON.parse(body).results.forEach(async item => {
						await db.query(
							`INSERT INTO data_store.camera_names (id, name) values ($1, $2) ON CONFLICT DO NOTHING`,
							[item.id, item.name]
						)
					})
				}
			}
		)
	}

	// 1С:ЗУП

	async getAllOnecData(req, res) {
		// const allData = await db.query(`SELECT * FROM "data_store"."Cabinet"`)
		const allData = await db.query(`SELECT * FROM onec`)
		res.json(allData.rows)
	}
	async getTodayOnecData(req, res) {
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

		let date = `${year}-${month}-${day}`

		const todayData = await db.query(
			`SELECT * 
			FROM onec WHERE date = '${date}'`
		)
		res.json(todayData.rows)
	}
	async deleteDataFromOnec(req, res) {
		const data = db.query(`DELETE FROM onec`)
		res.json(data)
	}
}

module.exports = new DataController()
