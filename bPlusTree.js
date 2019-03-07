let {genDisorderList} = require("./tools")

var uuid = 0
const LEFT_SIDE = -1
const RIGHT_SIDE = 1

function Node(value, parent, left, right) {
	this.cond = value
	this.level = parent ? parent.level + 1 : 0
	this.power = 0  // 不能超过正负2，超过就需要找最近的1节点做旋转平衡
	this.side = 0   // 父节点相对位置（跟父节点的左右孩子相反）
	if (parent) {
		this.setParent(parent)
	}
	this.left = left || null
	this.right = right || null
}

Node.prototype.setParent = function (parent) {
	this.parent = parent
	this.level = parent.level + 1
	// 在设定父节点之前，需要先成为这个父节点的孩子
	this.side = parent.left === this ? RIGHT_SIDE : LEFT_SIDE
	// 如果父节点和该节点都是同一边的节点，则父节点权重加1
	let node = this
	while (parent.side === node.side || parent.side === 0) {
		parent.power++
		if (!parent.parent) {
			break
		}
		node = parent
		parent = node.parent
	}
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
		this.buildBalanceTree(this.root, array[i])
	}
	// this.genLeaf()
	this.print(this.root)
}

/***
 * 构造平衡二叉树
 * @param node
 * @param item
 */
BPlusTreeBuilder.prototype.buildBalanceTree = function(node, item) {
	if (item > node.cond) {
		if (node.right) {
			this.buildBalanceTree(node.right, item)
		} else {
			let newNode = new Node(item, node)
			node.right = newNode
			this.toBalance(newNode)
			if (newNode.level > this.maxLevel) {
				this.maxLevel = newNode.level
			}
		}
	} else {
		if (node.left) {
			this.buildBalanceTree(node.left, item)
		} else {
			let newNode = new Node(item, node)
			node.left = newNode
			this.toBalance(newNode)
			if (newNode.level > this.maxLevel) {
				this.maxLevel = newNode.level
			}
		}
	}
}

BPlusTreeBuilder.prototype.toBalance = function(node) {
	// 检查平衡
	let needBalance = false
	let parent = node.parent
	let preNode = node
	while (parent) {
		if (parent.power > 1 || parent.power < -1) {
			needBalance = true
			node = preNode // 权重超2节点的同边子节点才应成为父节点
			break
		}
		preNode = parent
		parent = parent.parent
	}
	if (!needBalance) {
		return
	}

	// 找到需要平衡的节点
	// 如果是根节点，边为0
	if (!parent.parent) {
		preNode.side = 0
		this.root = preNode
	}
	preNode.parent = parent.parent;
	(function (nd) {
		nd.level--
		nd.left && arguments.callee(nd.left)
		nd.right && arguments.callee(nd.right)
	})(preNode);
	// 同边的父节点权值都减1
	(nd => {
		for (; nd.parent && (nd.side === nd.parent.side || nd.parent.side === 0); nd = nd.parent) {
			nd.power--
		}
	})(preNode)
	// 将当前超标的父节点设为自己的子节点
	if (preNode.side === RIGHT_SIDE) {
		preNode.right = parent
	} else {
		preNode.left = parent
	}
	// 对成为孩子的父节点进行调整
	parent.power = 0 // 原父节点权值清零
	// 父节点对于这个升级的子节点不再拥有管理权
	if (parent.left === preNode) {
		parent.left = null
	} else {
		parent.right = null
	}
	parent.setParent(preNode)
	// 父节点权值清零
	preNode.power = 0
}

BPlusTreeBuilder.prototype.rotateLeft = function(node) {
	let parent = node.parent
	// 对于node
	node.parent = parent.parent
	let lftTmp = node.left
	node.left = parent

	// 对于node的父节点
	parent.parent = node
	parent.right = lftTmp
}

BPlusTreeBuilder.prototype.rotateRight = function(node) {
	let parent = node.parent
	// 对于node
	node.parent = parent.parent
	let rgtTmp = node.right
	node.right = parent

	//对于node的父节点
	parent.parent = node
	parent.left = rgtTmp
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

let origin = [ 8.834793876168568,
	27.39233139465793,
	30.29213426482469,
	79.03286054072969,
	11.065106064609399,
	8.294227251063436,
	19.19694800514391,
	40.941286814122655,
	75.80291386761306,
	63.62630437358152 ]//genDisorderList(10)
console.log(origin)
let tree = new BPlusTreeBuilder(origin)