let {genDisorderList} = require("./tools")

var uuid = 0
const LEFT_SIDE = -1
const RIGHT_SIDE = 1

function Node(value, parent, left, right) {
	this.cond = value
	this.level = parent ? parent.level + 1 : 0
	this.parent = parent || null
	this.left = left || null
	this.right = right || null
}

function Leaf(node, next) {
	this.value = node.cond
	this.id = (uuid++)
	this.next = next || null
}

/***
 * 构建B+树
 * @param array
 * @constructor
 */
function BPlusTreeBuilder(array) {
	if (this.root === undefined) {
		this.root = new Node(array[0])
		this.root.level = 1
		this.maxLevel = 1
	}

	for (let i = 1; i < array.length; i++) {
		this.buildCond(this.root, array[i])
	}
	this.genLeaf()
	this.print(this.root)
}

BPlusTreeBuilder.prototype.genLeaf = function() {
	let list = this.sortedList(this.root)
	let preLeaf = null
	for (let i = 0; i < list.length; i++) {
		let node = list[i]
		if (!node.left && !node.right) {
			let leftParent = this.searchFirstParent(node, LEFT_SIDE)
			if (leftParent) {
				node.left = new Leaf(leftParent)
				if (preLeaf) {
					preLeaf.next = node.left
					preLeaf = preLeaf.next
				}
			}
			let rightParent = this.searchFirstParent(node, RIGHT_SIDE)
			if (rightParent) {
				node.right = new Leaf(rightParent)
				if (preLeaf) {
					preLeaf.next = node.right
					preLeaf = preLeaf.next
				}
			}
		}
	}
}

BPlusTreeBuilder.prototype.searchFirstParent = function(node, side) {
	let parent = node.parent
	if (!parent) {
		return null
	}
	if (side === LEFT_SIDE && parent.right === node) {
		return parent
	}
	if (side === RIGHT_SIDE && parent.left === node) {
		return parent
	}
	return this.searchFirstParent(parent, side)
}

BPlusTreeBuilder.prototype.buildCond = function(node, item) {
	if (item > node.cond) {
		if (node.right) {
			this.buildCond(node.right, item)
		} else {
			node.right = new Node(item, node)
			if (node.right.level > this.maxLevel) {
				this.maxLevel = node.right.level
			}
		}
	} else {
		if (node.left) {
			this.buildCond(node.left, item)
		} else {
			node.left = new Node(item, node)
			if (node.left.level > this.maxLevel) {
				this.maxLevel = node.left.level
			}
		}
	}
}

BPlusTreeBuilder.prototype.sortedList = function(node, list = null) {
	list = list || []
	if (node.left) {
		this.sortedList(node.left, list)
	}
	list.push(node)
	if (node.right) {
		this.sortedList(node.right, list)
	}
	return list
}

BPlusTreeBuilder.prototype.levelTree = function (node, list = new Array(this.maxLevel)) {
	let index = node.level - 1
	if (list[index] instanceof Array) {
		list[index].push(node)
	} else {
		list[index] = [node]
	}
	if (node.left) {
		this.levelTree(node.left, list)
	}
	if (node.right) {
		this.levelTree(node.right, list)
	}
	return list
}

BPlusTreeBuilder.prototype.print = function (node, blk = 0) {
	for (let i = 0; i < blk; i++) {
		process.stdout.write("\t")
	}
	if (node instanceof Node) {
		console.log(`|-<${node.cond}`)
	} else {
		console.log(`|-${node.value}`)
	}
	if (node.left) {
		this.print(node.left, blk + 1)
	}
	if (node.right) {
		this.print(node.right, blk + 1)
	}
}

let origin = genDisorderList(10)
let tree = new BPlusTreeBuilder(origin)