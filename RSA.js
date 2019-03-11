function extendedEuclid(a, b) {
	if (b === 0) {
		return { a, x: 1, y: 0 }
	} else {
		let _ = extendedEuclid(b, a % b)
		// console.log(_)
		return {
			a: _.a,
			x: _.y,
			y: _.x - parseInt(a/b)*_.y
		}
	}
}

var validPrimesSet = []
function genFakeRandPrimes(bit = 1024) {
	let numStr = ""
	for (let i = 0; i < bit; i++) {
		let numTmp = Math.ceil(Math.random() * 10) - 1
		if (i === bit - 1 && numTmp % 2 === 0) {
			numTmp += 1
			if (numTmp === 10) {
				numTmp = 1
			}
		}
		numStr += `${numTmp}`
	}
	while (true) {
		let n = BigInt(numStr)

		// 构建检测用素数数组
		if (validPrimesSet.length === 0) {
			for (let i = 2; i < 2000; i++){
				let isPrimes = true
				for (let j = 2; j < i; j++) {
					if (i % j === 0) {
						isPrimes = false
						break
					}
				}
				if (isPrimes) {
					validPrimesSet.push(BigInt(i))
				}
			}
		}

		let isPrimes = true
		for (let p of validPrimesSet) {
			if (n % p === 0) {
				isPrimes = false
				break
			}
		}
		if (isPrimes) {
			return n
		}
	}
}

/***
 *
 * @param n 一个大于3的奇整数
 * @param t 一个大于等于1的安全参数(用于确定测试轮数)
 */
function checkByMillerRabin(n, t) {
	let r = n - 1n
	let s = 0
	while (r % 2n === 0) {
		r /= 2n
		s++
	}
	for (let i = 0; i < t; i++) {
		let a = Math.random() * (n - 4n) + 2n // 产生[2, n-2]的随机数
		let y = Math.pow(a, r) % n
		if (y !== 1 && y !== n - 1n) {
			for (let j = 1; j < s && y !== n - 1n; j++) {
				y = Math.pow(y, 2) % n
				if (y === 1) {
					return false
				}
			}
			if (y !== n - 1n) {
				return true
			}
		}
	}
}

// console.log(extendedEuclid(99, 78))
let primes = genFakeRandPrimes()
console.log(primes)
console.log(checkByMillerRabin(primes, 2000))