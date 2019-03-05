let {genDisorderList} = require("./tools")

var uuid = 0

function Node(value, left, right) {
	this.value = value
	this.id = (uuid++)
	this.left = left || null
	this.right = right || null
}

function BinarySearchTreeBuilder(array) {
	if (this.root === undefined) {
		this.root = new Node(array[0])
	}

	for (let i = 1; i < array.length; i++) {
		this.compare(this.root, array[i])
	}

	// this.print(this.root)
}

BinarySearchTreeBuilder.prototype.print = function(node) {
	if (node.left) {
		this.print(node.left)
	}
	console.log(node.value)
	if (node.right) {
		this.print(node.right)
	}
}

BinarySearchTreeBuilder.prototype.compare = function(node, item) {
	if (item > node.value) {
		if (node.right) {
			this.compare(node.right, item)
		} else {
			node.right = new Node(item)
		}
	} else {
		if (node.left) {
			this.compare(node.left, item)
		} else {
			node.left = new Node(item)
		}
	}
}

function search(node, target) {
	if (Math.abs(node.value - target) < 1) {
		return node.id
	}
	if (node.value > target) {
		return search(node.left, target)
	} else {
		return search(node.right, target)
	}
}

let origin = genDisorderList(999999)
let tree = new BinarySearchTreeBuilder(origin)
let target = origin[Math.ceil(Math.random() * origin.length) - 1]
console.log(`搜寻目标：${target}`)
let begTime = Date.now()
let result = search(tree.root, target)
console.log(`耗时：${Date.now() - begTime}`)
console.log(`目标ID：${result}`)