function genDisorderList(size, ceil = 100) {
	let ret = []
	for (let i = 0; i < size; i++) {
		ret.push(Math.random() * ceil)
	}
	return ret
}

module.exports = {
	genDisorderList
}