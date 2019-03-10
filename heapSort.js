const Stack = require("stackjs")
const {genDisorderList} = require("./tools")

function Node(value, parent) {
	this.value = value
	this.left = null
	this.right = null
	this.parent = parent
	if (!parent) {
		this.next = this.left
	} else {
		this.next = null
	}
}

function sort(array) {
	// 初始化堆树
	let begTime = Date.now()
	let root = initHeapTree(array)
	console.log(`初始化耗时：${Date.now() - begTime}`)
	// 调整堆树：从左叶子节点开始，调整每个子树，要求父节点一定大于子节点
	begTime = Date.now()
	adjustHeapTree(root)
	console.log(`调整耗时：${Date.now() - begTime}`)
	// printTree(root)
	// 堆排序
	begTime = Date.now()
	let ret = sortHeapTree(root)
	console.log(`排序耗时：${Date.now() - begTime}`)
	return ret
}

function initHeapTree(array) {
	let root = null
	let preRight = null
	for (let item of array) {
		if (!root) {
			root = new Node(item)
			preRight = root
		} else {
			for (let node = root; node; node = node.next) {
				if (!node.left) {
					node.left = new Node(item, node)
					preRight.next = node.left
					break
				} else if (!node.right) {
					node.right = new Node(item, node)
					node.left.next = node.right
					preRight = node.right
					break
				}
			}
		}
	}
	return root
}

function adjustHeapTree(root, valid = true) {
	let node = root
	let stack = new Stack()
	function FatherNode(node) {
		this.node = node
		this.first = true
	}
	while (node || !stack.isEmpty()) {
		while (node) {
			stack.push(new FatherNode(node))
			node = node.left
		}
		if (!stack.isEmpty()) {
			let tmp = stack.pop()
			if (tmp.first) {
				tmp.first = false
				stack.push(tmp)
				node = tmp.node.right
			} else {
				let father = tmp.node
				if (father.left && father.left.value > father.value) {
					swapNodeValue(father, father.left)
					valid && validSwap(father.left)
				}
				if (father.right && father.right.value > father.value) {
					swapNodeValue(father, father.right)
					valid && validSwap(father.right)
				}
				node = null
			}
		}
	}
}

function validSwap(node) {
	if (!node) {
		return
	}
	if (node.left && node.value < node.left.value) {
		swapNodeValue(node, node.left)
	}
	if (node.right && node.value < node.right.value) {
		swapNodeValue(node, node.right)
	}
	validSwap(node.left)
	validSwap(node.right)
}

function sortHeapTree(root) {
	let ret = []
	let count = 0
	while (root.next) {
		ret.push(root.value)
		if (root.left && root.right) {
			if (root.left.value < root.right.value) {
				swapNodeValue(root.left, root.right)
			}
		}
		for (let node = root; node.next; node = node.next) {
			node.value = node.next.value
			if (!node.next.next) {
				let delNode = node.next
				node.next = null
				let delParent = delNode.parent
				if (delParent.left === delNode) {
					delParent.left = null
				} else {
					delParent.right = null
				}
				break
			}
		}
	}
	ret.push(root.value)
	return ret
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

let origin = genDisorderList(10)
// console.log(origin)
let begTime = Date.now()
console.log(sort(origin))
console.log(`耗时：${Date.now() - begTime}`)