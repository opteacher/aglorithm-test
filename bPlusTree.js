const Stack = require("stackjs")
const {genDisorderList} = require("./tools")

const RED_NODE = "red node"
const BLACK_NODE = "black node"

function Node(value, parent, left, right) {
	this.cond = value
	this.color = RED_NODE
	this.parent = parent
	this.left = left
	this.right = right
	this.used = false
}

const NIL_NODE = new Node(Number.MAX_SAFE_INTEGER)
NIL_NODE.parent = NIL_NODE
NIL_NODE.left = NIL_NODE
NIL_NODE.right = NIL_NODE
NIL_NODE.color = BLACK_NODE

function Leaf(node, next) {
	node.used = true
	node.leaf = this
	this.value = node.cond
	this.next = next
}

/***
 * 构建B+树
 * @param array
 * @constructor
 */
function BPlusTreeBuilder(array) {
	if (!this.root) {
		this.root = new Node(array[0], NIL_NODE, NIL_NODE, NIL_NODE)
		this.root.color = BLACK_NODE
	}
	if (!this.leaves) {
		this.leaves = null
	}

	for (let i = 1; i < array.length; i++) {
		this.buildBalanceTree(this.root, array[i])
	}
	this.root.color = BLACK_NODE
	this.leafPoint = null
	this.toBPlusTree()
	process.stdout.write("B+树：")
	this.print(this.root)

	console.log("叶子：[")
	let numLeaves = 0
	for (let leaf = this.leaves; leaf; leaf = leaf.next) {
		console.log(`\t${leaf.value},`)
		numLeaves++
	}
	process.stdout.write("]")
	console.log()
	console.log(`总有叶子数：${numLeaves}`)
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
		/* grandfather
		      /
		  father
		   /
		node */
		if (node === father.left && father === grandFather.left) {
			this.rotateRight(grandFather)
			father.color = BLACK_NODE
			grandFather.color = RED_NODE
			if (gfIsRoot) {
				this.root = father
			}
		}
		/* grandfather
		       \
	         father
	            \
	           node */
		if (node === father.right && father === grandFather.right) {
			this.rotateLeft(grandFather)
			father.color = BLACK_NODE
			grandFather.color = RED_NODE
			if (gfIsRoot) {
				this.root = father
			}
		}
		/* grandfather
		       \
	         father
	           /
	        node */
		if (node === father.left && father === grandFather.right) {
			this.rotateRight(father)
			node.color = BLACK_NODE
			grandFather.color = RED_NODE
			this.rotateLeft(grandFather)
			if (gfIsRoot) {
				this.root = node
			}
		}
		/* grandfather
		      /
		  father
		     \
		    node */
		if (node === father.right && father === grandFather.left) {
			this.rotateLeft(father)
			node.color = BLACK_NODE
			grandFather.color = RED_NODE
			this.rotateRight(grandFather)
			if (gfIsRoot) {
				this.root = node
			}
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
	t.left.parent = node

	// 对于t
	t.parent = parent
	if (parent !== NIL_NODE) {
		if (parent.left === node) {
			parent.left = t
		} else {
			parent.right = t
		}
	}
	t.left = node
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
	t.right.parent = node

	//对于t
	t.parent = parent
	if (parent !== NIL_NODE) {
		if (parent.left === node) {
			parent.left = t
		} else {
			parent.right = t
		}
	}
	t.right = node
}

/***
 * 将整理出来的红黑树转化成B+树
 * * 所有的准叶子节点的左右子节点变为与之最邻近节点
 * > 其实就是找对应（左对左、右对右）最近的节点，
 * > 比如该准叶子节点的左孩子，就是其向上追溯（包括它自己）最近的左孩子节点
 * @param node
 */
BPlusTreeBuilder.prototype.toBPlusTree = function(node = this.root) {
	if (node.left === NIL_NODE && node.right === NIL_NODE) {
		let root = this.root
		/***
		 * 从当前节点开始找最小的未使用节点
		 * @param nd
		 */
		let findMinLeaf = function (nd) {
			let minNode = NIL_NODE
			while (nd !== NIL_NODE) {
				if (!nd.used) {
					if (nd.cond < minNode.cond) {
						minNode = nd
					}
				}
				nd = nd.parent
			}
			minNode.used = true
			return new Leaf(minNode)
		}
		node.left = findMinLeaf(node)
		if (!this.leaves) {
			this.leaves = node.left
		} else if (this.leafPoint) {
			this.leafPoint.next = node.left
		}
		node.right = findMinLeaf(node)
		node.left.next = node.right
		this.leafPoint = node.right
		return
	}
	if (node.left !== NIL_NODE) {
		this.toBPlusTree(node.left)
	}
	if (node.right !== NIL_NODE) {
		this.toBPlusTree(node.right)
	}
}

BPlusTreeBuilder.prototype.sortedList = function(node, list = null) {
	list = list || []
	if (node.left !== NIL_NODE) {
		this.sortedList(node.left, list)
	}
	list.push(node)
	if (node.right !== NIL_NODE) {
		this.sortedList(node.right, list)
	}
	return list
}

BPlusTreeBuilder.prototype.print = function (node, blk = 0) {
	if (node instanceof Node) {
		for (let i = 0; i < blk; i++) {
			process.stdout.write("\t")
		}
		console.log(`|-<${node.cond}(${node.color})`)
	} else {
		for (let i = 0; i < blk; i++) {
			process.stdout.write("\t")
		}
		console.log(`|-*${node.value}(leaf)`)
		return
	}
	if (node.left !== NIL_NODE) {
		this.print(node.left, blk + 1)
	}
	if (node.right !== NIL_NODE) {
		this.print(node.right, blk + 1)
	}
}

BPlusTreeBuilder.prototype.rangeSearch = function (min, max) {
	function isNode(node) {
		return node instanceof Node && node !== NIL_NODE
	}
	let minNode = (function (node) {
		let stack = new Stack()
		while (isNode(node) || !stack.isEmpty()) {
			while (isNode(node)) {
				stack.push(node)
				node = node.left
			}
			if (!stack.isEmpty()) {
				node = stack.pop()
				if (min < node.cond) {
					return node
				}
				node = node.right
			}
		}
	})(this.root)
	let maxNode = (function (node) {
		let stack = new Stack()
		while (isNode(node) || !stack.isEmpty()) {
			while (isNode(node)) {
				stack.push(node)
				node = node.right
			}
			if (!stack.isEmpty()) {
				node = stack.pop()
				if (max > node.cond) {
					return node
				}
				node = node.left
			}
		}
	})(this.root)
	let ret = []
	for (let p = minNode.leaf; p.value <= maxNode.leaf.value; p = p.next) {
		ret.push(p.value)
	}
	return ret
}

let origin = genDisorderList(10)
process.stdout.write("原始数组：")
console.log(origin)
let tree = new BPlusTreeBuilder(origin)
let min = Math.min(...origin)
let max = Math.max(...origin)
let rand1 = Math.random() * (max - min) + min
let rand2 = Math.random() * (max - min) + min
min = Math.min(rand1, rand2)
max = Math.max(rand1, rand2)
console.log(`搜索范围大于：${min}`)
console.log(`搜索范围小于：${max}`)
let begTime = Date.now()
console.log(`搜索结果：${tree.rangeSearch(min, max)}`)
console.log(`耗时：${Date.now() - begTime}`)