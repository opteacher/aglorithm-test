let {genDisorderList} = require("./tools")

var uuid = 0
const RED_NODE = "red node"
const BLACK_NODE = "black node"

function Node(value, parent, left, right) {
	this.cond = value
	this.color = RED_NODE
	this.parent = parent
	this.left = left
	this.right = right
}

const NIL_NODE = new Node(0)
NIL_NODE.parent = NIL_NODE
NIL_NODE.left = NIL_NODE
NIL_NODE.right = NIL_NODE
NIL_NODE.color = BLACK_NODE

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
		this.root = new Node(array[0], NIL_NODE, NIL_NODE, NIL_NODE)
		this.root.color = BLACK_NODE
	}

	for (let i = 1; i < array.length; i++) {
		this.buildBalanceTree(this.root, array[i])
	}
	// this.genLeaf()
	this.print(this.root)
}

/***
 * 构造平衡二叉树（红黑树算法）
 * @param node
 * @param item
 */
BPlusTreeBuilder.prototype.buildBalanceTree = function(node, item) {
	if (item > node.cond) {
		if (node.right !== NIL_NODE) {
			this.buildBalanceTree(node.right, item)
		} else {
			node.right = new Node(item, node, NIL_NODE, NIL_NODE)
			this.toBalance(node.right)
		}
	} else {
		if (node.left !== NIL_NODE) {
			this.buildBalanceTree(node.left, item)
		} else {
			node.left = new Node(item, node, NIL_NODE, NIL_NODE)
			this.toBalance(node.left)
		}
	}
}

/***
 * 根据红黑树算法调正新增的节点
 * * 如果父节点是黑色，则不调整
 * * 始终保持跟节点为黑色
 * > 以下场景父节点都是红色
 * * 叔节点也是红色。叔父节点都调整为黑色，祖父节点调整为红色并以此为新节点递归
 * > 以下场景叔节点都是黑色
 * * 节点是个左孩子，节点和父节点换以节点为轴，有右旋转后再左旋转
 * * 节点是个右孩子，祖父和父节点环以父节点为轴，做左旋转
 * @param node
 */
BPlusTreeBuilder.prototype.toBalance = function(node) {
	let father = node.parent
	if (father === NIL_NODE) {
		return
	}
	if (father.color === BLACK_NODE) {
		return
	}
	let grandFather = father.parent
	// 祖父是否是根节点
	let gfIsRoot = grandFather.parent === NIL_NODE
	let getUncle = function (node) {
		if (node.parent === node.parent.parent.left) {
			return node.parent.parent.right
		} else {
			return node.parent.parent.left
		}
	}
	let uncle = getUncle(node)
	if (uncle.color === RED_NODE) {
		father.color = BLACK_NODE
		uncle.color = BLACK_NODE
		grandFather.color = RED_NODE
		this.toBalance(grandFather)
	} else if (uncle.color === BLACK_NODE) {
		if (node === father.left && father === grandFather.left) {
			this.rotateRight(grandFather)
			father.color = BLACK_NODE
			grandFather.color = RED_NODE
			if (gfIsRoot) {
				this.root = father
			}
		} else if (node === father.right && father === grandFather.right) {
			this.rotateLeft(grandFather)
			father.color = BLACK_NODE
			grandFather.color = RED_NODE
			if (gfIsRoot) {
				this.root = father
			}
		} else if (node === father.left && father === grandFather.right) {
			this.rotateRight(father)
			this.rotateLeft(grandFather)
			grandFather.color = BLACK_NODE
			father.color = BLACK_NODE
			if (gfIsRoot) {
				this.root = node
			}
			this.toBalance(node)
		} else if (node === father.right && father === grandFather.left) {
			this.rotateLeft(father)
			this.rotateRight(grandFather)
			grandFather.color = BLACK_NODE
			father.color = BLACK_NODE
			if (gfIsRoot) {
				this.root = node
			}
			this.toBalance(node)
		}
	}
}

/***
 *      |              |
 *    node             t
 *    /  \            /\
 *   a   t    =>   node r
 *      /\         /\
 *     b  r       a  b
 * @param node
 */
BPlusTreeBuilder.prototype.rotateLeft = function(node) {
	let parent = node.parent
	let t = node.right

	// 对于node
	node.parent = t
	node.right = t.left

	// 对于t
	t.parent = parent
	t.left = node

	// 对于parent
	if (parent && parent !== NIL_NODE) {
		if (parent.left === node) {
			parent.left = t
		} else {
			parent.right = t
		}
	}
}

/***
 *       |              |
 *     node             t
 *     /  \            /\
 *    t   r    =>     a node
 *   /\                 /\
 *  a  b               b  r
 * @param node
 */
BPlusTreeBuilder.prototype.rotateRight = function(node) {
	let parent = node.parent
	let t = node.left

	// 对于node
	node.parent = t
	node.left = t.right

	//对于t
	t.parent = parent
	t.right = node

	// 对于parent
	if (parent && parent !== NIL_NODE) {
		if (parent.left === node) {
			parent.left = t
		} else {
			parent.right = t
		}
	}
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

BPlusTreeBuilder.prototype.print = function (node, blk = 0) {

	if (node instanceof Node) {
		if (node !== NIL_NODE) {
			for (let i = 0; i < blk; i++) {
				process.stdout.write("\t")
			}
			console.log(`|-<${node.cond}(${node.color})`)
		}
	} else {
		for (let i = 0; i < blk; i++) {
			process.stdout.write("\t")
		}
		console.log(`|-${node.value}`)
	}
	if (node.left !== NIL_NODE) {
		this.print(node.left, blk + 1)
	}
	if (node.right !== NIL_NODE) {
		this.print(node.right, blk + 1)
	}
}

let origin = genDisorderList(10)
console.log(origin)
let tree = new BPlusTreeBuilder(origin)