function genDisorderList(size) {
	let ret = []
	for (let i = 0; i < size; i++) {
		ret.push(Math.random() * 100)
	}
	return ret
}

module.exports = {
	genDisorderList
}