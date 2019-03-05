let {app, BrowerWindow} = require("electron")

let mainWindow

const createWindow = () => {
	mainWindow = new BrowerWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	})

	mainWindow.loadFile("index.html")

	mainWindow.on("closed", () => {
		mainWindow = null
	})
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
})

app.on("activate", () => {
	if (mainWindow === null) {
		createWindow()
	}
})
