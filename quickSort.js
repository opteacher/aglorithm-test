const {genDisorderList} = require("./tools")

function sort(array, beg = 0, end = array.length - 1) {
	if (beg < end) {
		let idx = partition(array, beg, end)
		sort(array, beg, idx - 1)
		sort(array, idx + 1, end)
	}
}

function partition(array, beg, end) {
	// 确定分隔元素
	// beg - splIdx：比分隔元素小的元素
	// splIdx - i：比分隔元素大的元素
	let split = array[end]
	let smlIdx = beg
	for (let bigIdx = beg; bigIdx < end; bigIdx++) {
		if (array[bigIdx] < split) {
			if (bigIdx !== 0 && array[bigIdx - 1] > split) {
				swap(array, smlIdx, bigIdx)
			}
			smlIdx++
		}
	}
	if (smlIdx !== end) {
		swap(array, smlIdx, end)
	}
	return smlIdx
}

function swap(array, index1, index2) {
	array[index1] += array[index2]
	array[index2] = array[index1] - array[index2]
	array[index1] -= array[index2]
}

let origin = genDisorderList(1000000)
// console.log(origin)
let begTime = Date.now()
sort(origin)
console.log(`耗时：${Date.now() - begTime}`)