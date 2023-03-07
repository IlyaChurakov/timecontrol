const Request = require("tedious").Request
const db = require("./connectionPG")

class RusGuard {
	constructor(db) {
		this.db = db
		this.result = null
	}

	// getInsertEmployees() {
	// 	return new Promise(resolve => {
	// 		let request = new Request(
	// 			`SELECT _id, FullName FROM dbo.Employee FOR JSON PATH`,
	// 			err => {
	// 				if (err) {
	// 					console.log(err)
	// 				}
	// 			}
	// 		)
	// 		let string = ""

	// 		request.on("row", columns => {
	// 			columns.forEach((column, num) => {
	// 				console.log("Событие в MSSQL появилось")
	// 				return (string += column.value)
	// 			})
	// 		})

	// 		request.on("requestCompleted", async function (rowCount, more) {
	// 			if (string) {
	// 				this.result = JSON.parse(string)

	// 				await this.result.forEach(async item => {
	// 					console.log("Попытка вкинуть")
	// 					await db.query(
	// 						`INSERT INTO data_store.skud_employees (id_employee, name) values ($1, $2) ON CONFLICT DO NOTHING`, // id_event - Primary Key, если ошибка добавления, то ничего не происходит, за счет этого не добавляются дубликаты
	// 						[item._id, item.FullName]
	// 					)
	// 				})
	// 			}
	// 			resolve(this.result)
	// 		})

	// 		this.db.execSql(request)
	// 	})
	// }

	// getInsertWorkZoneAccess() {
	// 	return new Promise(resolve => {
	// 		let request = new Request(
	// 			`SELECT "DriverID", "WorkZoneID", "Name" FROM dbo.WorkZonesAccessPoint JOIN dbo.WorkZones ON "WorkZoneID" = dbo.WorkZones._id FOR JSON PATH`,
	// 			err => {
	// 				if (err) {
	// 					console.log(err)
	// 				}
	// 			}
	// 		)
	// 		let string = ""

	// 		request.on("row", columns => {
	// 			columns.forEach((column, num) => {
	// 				console.log("Событие в MSSQL появилось")
	// 				return (string += column.value)
	// 			})
	// 		})

	// 		request.on("requestCompleted", async function (rowCount, more) {
	// 			if (string) {
	// 				this.result = JSON.parse(string)

	// 				await this.result.forEach(async item => {
	// 					console.log("Попытка вкинуть")
	// 					await db.query(
	// 						`INSERT INTO data_store.work_zone (id_driver, id_workzone, driver_name) values ($1, $2, $3) ON CONFLICT DO NOTHING`, // id_event - Primary Key, если ошибка добавления, то ничего не происходит, за счет этого не добавляются дубликаты
	// 						[item.DriverID, item.WorkZoneID, item.Name]
	// 					)
	// 				})
	// 			}
	// 			resolve(this.result)
	// 		})

	// 		this.db.execSql(request)
	// 	})
	// }

	getData() {
		return new Promise(resolve => {
			let request = new Request(
				"SELECT _id, DriverID, EmployeeID, Message, DateTime FROM dbo.Log WHERE DateTime > dateadd(dd,-1,getdate()) FOR JSON PATH", // Достаем строки, добавленные за последнюю минуту
				err => {
					if (err) {
						console.log(err)
					}
				}
			)
			let string = ""

			request.on("row", columns => {
				columns.forEach((column, num) => {
					console.log("Событие в MSSQL появилось")
					return (string += column.value)
				})
			})

			request.on("requestCompleted", async function (rowCount, more) {
				if (string) {
					this.result = JSON.parse(string)

					await this.result.forEach(async item => {
						// console.log("Попытка вкинуть")
						await db.query(
							`INSERT INTO data_store.skud_data (id, "ID_controller", "cardNumber", "eventType", date) values ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`, // id_event - Primary Key, если ошибка добавления, то ничего не происходит, за счет этого не добавляются дубликаты
							[
								item._id,
								item.DriverID,
								item.EmployeeID,
								item.Message,
								item.DateTime,
							]
						)
						// await db.query(
						// 	`INSERT INTO rusguard2 (id_event, id_controller, card_number, event_type, date) values ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`, // id_event - Primary Key, если ошибка добавления, то ничего не происходит, за счет этого не добавляются дубликаты
						// 	[
						// 		item._id,
						// 		item.DriverID,
						// 		item.EmployeeID,
						// 		item.Message,
						// 		item.DateTime,
						// 	]
						// )
					})
				}
				resolve(this.result)
			})

			this.db.execSql(request)
		})
	}
}

module.exports = {
	RusGuard,
}
