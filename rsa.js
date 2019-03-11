const crypto = require("crypto")

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
function genFakeRandPrime(bit = 1024) {
	while (true) {
		let n = BigInt(`0x${crypto.randomBytes(bit).toString("hex")}`)
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
	while (r % 2n == 0) {
		r /= 2n
		s++
	}
	for (let i = 0; i < t; i++) {
		let a = genBigIntRand(2n, n - 2n) // 产生[2, n-2]的随机数
		let y = modPow(a, r, n)
		if (y !== 1 && y !== n - 1n) {
			for (let j = 1; j < s && y !== n - 1n; j++) {
				y = modPow(y, 2n, n)
				if (y == 1) {
					return false
				}
			}
			if (y != n - 1n) {
				return true
			}
		}
	}
}

function genBigIntRand(min, max) {
	let minStr = min.toString()
	let maxStr = max.toString()
	let minLen = minStr.length
	let maxLen = maxStr.length
	let len = rangeRand(minLen, maxLen)
	let ret = ""
	if (len === minLen || len === maxLen) {
		let numStr = minStr
		let numLen = minLen
		if (len === maxLen) {
			numStr = maxStr
			numLen = maxLen
		}
		let randRng = true
		for (let i = numLen - 1; i >= 0; i--) {
			let low = randRng ? "0" : numStr[i]
			ret += rangeRand(parseInt(low), 9).toString()
			randRng = low !== numStr[i]
		}
	} else {
		for (let i = len - 1; i >= 0; i--) {
			ret += rangeRand(0, 9).toString()
		}
	}
	return BigInt(ret)
}

function modPow(x, y, m) {
	let ret = 1n
	let b = x
	while (y) {
		if (y % 2n != 0) {
			ret = ret * b
			ret = ret % m
		}
		b = b * b
		b = b % m
		y = y / 2n
	}
	return ret
}

function rangeRand(min, max) {
	return Math.ceil(Math.random() * (max - min + 1) + min) - 1
}

function getSmallOddAsPHIsCoPrime(phi) {
	let e = 3n
	for (; e < Number.MAX_VALUE; e += 2n) {
		let isCoPrime = true
		for (let i = e - 2n; i > 1; i -= 2n) {
			if (e % i == 0 && phi % i == 0) {
				isCoPrime = false
				break
			}
		}
		if (isCoPrime) {
			break
		}
	}
	return e
}

function exgcd(a, b, x, y) {
	if (b == 0) {
		x = 1n
		y = 0n
		return a
	}
	let q = exgcd(b, a%b, y, x)
	y -= a/b * x
	console.log(`x:${x}\ty:${y}`)
	return q
}

// console.log(extendedEuclid(99, 78))
// let primes = genFakeRandPrime()
// console.log(primes)
// console.log(checkByMillerRabin(primes, 2000))

function rsaEncode() {
	let p = null
	do {
		p = genFakeRandPrime()
	} while (!checkByMillerRabin(p, 4))
	let q = null
	do {
		q = genFakeRandPrime()
	} while (p == q || !checkByMillerRabin(q, 4))

	let n = p * q
	let phi = (p - 1n) * (q - 1n)
	let e = getSmallOddAsPHIsCoPrime(phi)
	let d = BigInt(1)
	exgcd(e, n, d, BigInt(1))
	console.log(d)
}

rsaEncode()