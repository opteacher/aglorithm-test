const {genDisorderList} = require("./tools")

function Node(value) {
	this.value = value
	this.next = null
}

/***
 * 通过链表插入，不过寻找插入位置是线性的
 * @param array
 */
function sortByChain(array) {
	let root = null
	for (let item of array) {
		if (!root) {
			root = new Node(item)
		} else {
			root = insertChain(root, item) || root
		}
	}
	return (() => {
		let ret = []
		for (let node = root; node; node = node.next) {
			ret.push(node.value)
		}
		return ret
	})()
}

function insertChain(root, item) {
	let node = root
	let prev = null
	while (node) {
		if (node.value > item) {
			let newNode = new Node(item)
			if (prev) {
				prev.next = newNode
				newNode.next = node
				return
			} else {
				newNode.next = node
				return newNode
			}
		}
		prev = node
		node = node.next
	}
	prev.next = new Node(item)
}

/***
 * 通过数组插入，采用对半查找位置，性能比链表好，
 * 不过插入效率较低所以数量小时表现略差
 * @param array
 */
function sortByArray(array) {
	let ret = []
	for (let item of array) {
		insertArray(ret, item, 0, ret.length)
	}
	return ret
}

function insertArray(array, item, beg, end) {
	if (array.length !== 0) {
		if (array[0] > item) {
			array.unshift(item)
			return
		}
		if (array[array.length - 1] < item) {
			array.push(item)
			return
		}
	}
	if (beg >= end || end - beg === 1) {
		array.splice(end, 0, item)
		return
	}
	let idx = (end + beg) / 2
	if (!Number.isInteger(idx)) {
		idx = Math.ceil(idx) - 1
	}
	if (array[idx] > item) {
		insertArray(array, item, beg, idx)
	} else {
		insertArray(array, item, idx, end)
	}
}

let origin = genDisorderList(1000)
// console.log(origin)
console.log("使用链表插入排序")
let begTime = Date.now()
sortByChain(origin)
console.log(`耗时：${Date.now() - begTime}`)

console.log("使用数组插入排序")
begTime = Date.now()
sortByArray(origin)
console.log(`耗时：${Date.now() - begTime}`)