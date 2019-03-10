const {genDisorderList} = require("./tools")

function sort(array) {
	for (let i = 0; i < array.length; i++) {
		for (let j = i + 1; j < array.length; j++) {
			if (array[i] > array[j]) {
				let tmp = array[i]
				array[i] = array[j]
				array[j] = tmp
			}
		}
	}
	return array
}

let origin = genDisorderList(10000)
// console.log(origin)
console.log("使用冒泡排序")
let begTime = Date.now()
sort(origin)
console.log(`耗时：${Date.now() - begTime}`)