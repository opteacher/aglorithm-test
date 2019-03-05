let {genDisorderList} = require("./tools")

/***
 * 合并排序
 * @param array
 * @returns {*}
 */
function sort(array) {
	if (!(array[0] instanceof Array)) {
		let a = []
		for (let i = 0; i < array.length - 1; i += 2) {
			let tmp = []
			if (array[i] < array[i + 1]) {
				tmp.push(array[i])
				tmp.push(array[i + 1])
			} else {
				tmp.push(array[i + 1])
				tmp.push(array[i])
			}
			a.push(tmp)
		}
		array = sort(a)
	} else {
		if (array.length === 1) {
			return array[0]
		}
		let a = []
		for (let t = 0; t < array.length - 1; t += 2) {
			let tmp = []
			for (let i = 0, j = 0; ;) {
				if (array[t][i] < array[t + 1][j]) {
					tmp.push(array[t][i])
					if (i === array[t].length - 1) {
						tmp.push(...array[t + 1].slice(j))
						break
					}
					i++
				} else {
					tmp.push(array[t + 1][j])
					if (j === array[t + 1].length - 1) {
						tmp.push(...array[t].slice(i))
						break
					}
					j++
				}
			}
			a.push(tmp)
		}
		// 如果数组是奇数项，则最后多出的一项追加到尾部
		if (array.length % 2 !== 0) {
			a.push(array[array.length - 1])
		}
		array = sort(a)
	}
	return array
}

let origin = genDisorderList(2000000)
console.log(`排序总量: ${origin.length}`)
let begTime = Date.now()
let result = sort(origin)
console.log(`耗时：${Date.now() - begTime}`)