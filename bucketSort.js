const {genDisorderList} = require("./tools")

const MODE = 10
const BASE = 100

function Node(value) {
	this.value = value
	this.next = null
}

/***
 * 桶排序需要直到序列的上限值（不可达）
 * > 通过增加模数，可以加快排序速度！OoO~不过不可以大于上限值
 * > 不过模数设的太大，就会近似于插入排序，数量很大时慎用！
 * @param array
 * @param topLmt
 * @returns {Array}
 */
function sort(array, topLmt) {
	let bucket = new Array(MODE)
	for (let item of array) {
		// 使所有元素小于1
		item /= topLmt
		let index = Math.ceil(dieTake(item, topLmt/10)) - 1
		if (bucket[index] == null) {
			bucket[index] = new Node(item)
		} else {
			let node = bucket[index]
			let prev = null
			let inserted = false
			while (node) {
				if (node.value > item) {
					inserted = true
					if (!prev) {
						bucket[index] = new Node(item)
						bucket[index].next = node
					} else {
						prev.next = new Node(item)
						prev.next.next = node
					}
					break
				}
				prev = node
				node = node.next
			}
			if (!inserted) {
				prev.next = new Node(item)
			}
		}
	}
	// printBucket(bucket)
	let ret = []
	for (let item of bucket) {
		for (let node = item; node; node = node.next) {
			ret.push(node.value * topLmt)
		}
	}
	return ret
}

function dieTake(item, mode = MODE) {
	return item * mode
}

function printBucket(array) {
	for (let item of array) {
		if (!item) {
			console.log("/")
		} else {
			process.stdout.write(`${item.value}`)
			for (let node = item.next; node; node = node.next) {
				process.stdout.write(`\t->${node.value}`)
			}
			console.log()
		}
	}
}

let origin = genDisorderList(1000000, BASE)
console.log(`数量：${origin.length}`)
// console.log(origin)
let begTime = Date.now()
sort(origin, BASE)
console.log(`耗时：${Date.now() - begTime}`)