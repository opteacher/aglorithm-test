const {genDisorderList} = require("./tools")

function Node(value, index, parent) {
	this.index = index
	this.value = value
	this.left = null
	this.right = null
	this.parent = parent
}

function sort(array) {
	// 初始化堆树
	let begTime = Date.now()
	initHeapTree(array)
	console.log(`初始化耗时：${Date.now() - begTime}`)
	// 调整堆树：从左叶子节点开始，调整每个子树，要求父节点一定大于子节点
	begTime = Date.now()
	adjustHeapTree(array)
	console.log(`调整耗时：${Date.now() - begTime}`)
	// 堆排序
	begTime = Date.now()
	let ret = sortHeapTree(array)
	console.log(`排序耗时：${Date.now() - begTime}`)
	return ret
}

function initHeapTree(array) {
	for (let i = 0; i < array.length; i++) {
		if (!(array[i] instanceof Node)) {
			array[i] = new Node(array[i], i)
		}
		let lftIdx = 2*i + 1
		if (lftIdx < array.length) {
			array[lftIdx] = new Node(array[lftIdx], lftIdx, array[i])
			array[i].left = array[lftIdx]
		}
		let rgtIdx = lftIdx + 1
		if (rgtIdx < array.length) {
			array[rgtIdx] = new Node(array[rgtIdx], rgtIdx, array[i])
			array[i].right = array[rgtIdx]
		}
	}
}

function adjustHeapTree(array) {
	let hftIdx = array.length/2
	if (!Number.isInteger(hftIdx)) {
		hftIdx = Math.ceil(hftIdx) - 1
	}
	for (let i = hftIdx; i >= 0; i--) {
		maxHeapify(array, i)
	}
}

function maxHeapify(array, i) {
	while (true) {
		let node = array[i]
		let left = node.left
		let right = node.right
		if (!left && !right) {
			break
		}
		let maxIdx = i
		if (left && left.value > node.value) {
			swapNodeValue(node, left)
			maxIdx = left.index
		}
		if (right && right.value > node.value) {
			swapNodeValue(node, right)
			maxIdx = right.index
		}
		if (maxIdx !== i) {
			i = maxIdx
		} else {
			break
		}
	}
}

function sortHeapTree(array) {
	for (let i = array.length - 1; i >= 0; i--) {
		if (i === 0) {
			array[0] = array[0].value
			break
		}
		swapNodeValue(array[0], array[i])
		let node = array[i]
		let parent = node.parent
		if (parent.left === node) {
			parent.left = null
		} else {
			parent.right = null
		}
		array[i] = array[i].value
		maxHeapify(array, 0)
	}
	return array
}

function swapNodeValue(node1, node2) {
	node1.value += node2.value
	node2.value = node1.value - node2.value
	node1.value -= node2.value
}

function printTree(node, blk = 0) {
	for (let i = 0; i < blk; i++) {
		process.stdout.write("\t")
	}
	console.log(`|-${node.value}`)
	if (node.left) {
		printTree(node.left, blk + 1)
	}
	if (node.right) {
		printTree(node.right, blk + 1)
	}
}

let origin = genDisorderList(1000000)
// console.log(origin)
let begTime = Date.now()
sort(origin)
console.log(`耗时：${Date.now() - begTime}`)