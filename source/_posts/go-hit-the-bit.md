title: Go解坑指南
author: blademainer
tags:
  - go
categories:
  - go
date: 2020-03-25 23:16:00
---

![](/images/golang.png)

Go解坑指南

<!-- more -->

## 日常踩坑：for-range

**这个循环会停止吗？**

```Go
func main() {
    v := []int{1, 2, 3}
    for i, _ := range v {
        v = append(v, i)
    }
}
```

----

**先来看看for-range（two-value）底层实现**
```Go
for_temp := v // for_temp是slice v的值拷贝
len_temp := len(for_temp)
for index_temp = 0; index_temp < len_temp; index_temp++ {
    value_temp = for_temp[index_temp] // value_temp也是元素的值拷贝
    index = index_temp
    value = value_temp
    original body
}
```

所以，上述的代码只会循环3次。

----

**再来个常见的，copys数组里是什么？`["alice", "bob"]`?**
```Go
var dogs = []Dog{}
dogs = append(dogs, Dog{Name: "alice"}, Dog{Name: "bob"})

var copys []*Dog
for _, d := range dogs {
    copys = append(copys, &d)
}
```

----

### 答案

`["bob", "bob"]`

### 原因
d是一个临时变量，在循环开始前声明，d会被重复利用。

----

### 扩展：map的for-range是怎样的呢？为什么是无序的？
```Go
for mapiterinit(type, range, &hiter); hiter.key != nil; mapiternext(&hiter) {
    index_temp = *hiter.key
    value_temp = *hiter.val
    index = index_temp
    value = value_temp
    original body
}
```

<font size=6>答：mapiterinit被做了手脚，迭代器初始位置是随机的。
    但是，迭代出来的相对位置是固定的。</font>

---

## 深度解惑：defer

- 优雅的释放资源或关闭
- 与recover配合捕获程序异常
- 结合闭包在return前做一些处理
- ...

----

**函数`f1`与`f2`的返回值分别是什么？**

```Go
func f1() (result int) {
    defer func() {
        result *= 7
    }()
    return 6
}

func f2() (result int) {
    tmp := 5
    defer func() {
        tmp = tmp + 5
    }()
    return tmp
}
```

----

解答上述问题，需要了解这些知识

- defer原理
- Go闭包
- 逃逸分析（escape analyze）

----

**defer原理**

1. defer的对象一定是函数调用

2. defer的函数调用顺序LIFO(后进先出)

3. defer与return的关系：return语句并不是原子指令，可以分解为以下3条语句：
    ```
    返回值 = xxx
    调用defer函数
    空的return
    ```

----

**Go闭包**

<font size=5>闭包是由函数及其相关引用环境组合而成的实体(即：闭包=函数+引用环境)</font>

```Go
func f(i int) func() int {
    return func() int {
        i++
        return i
    }
}
```

```Go
c1 := f(0)
c2 := f(0)
c1()    // reference to i, i = 0, return 1
c2()    // reference to another i, i = 0, return 1
```
<font size=5>c1跟c2引用的是不同的环境，函数f每进入一次，就形成了一个新的环境。</font>

----

**逃逸分析（escape analyze）**

```Go
func getCursor() *Cursor {
    var c Cursor
    c.X = 500
    noinline()
    return &c
}

~/closure ✗ go build -gcflags '-l -m'
./main.go:12:9: func literal escapes to heap
./main.go:19:6: moved to heap: c
```

编译器会识别出变量需要在堆上分配。

----

**分享一段defer+闭包的实战代码**
```Go
    var code string
    defer func() {
        Publish(&Message{Request: "bind", Code: code})
    }()
    // defer Publish(&Message{Request: "bind", Code: code})

    if condition0 {
        code = DBError
    }
    if condition1 {
        code = InternalError
    }
    code = OK
```

---

## 错觉瞬间：Go到底有没引用？

----

**错觉1**

```Go
func test(s []int) {
    s[0] = 999
}

func main() {
    s := []int{1, 2, 3}
    test(s)
    fmt.Println(s)
}
```

输出[999 2 3]，s被修改了！引用实锤！

----

**错觉2**
```Go
func test(s []int) {
    s = append(s, 999)
}

func main() {
    s := []int{1, 2, 3}
    test(s)
    fmt.Println(s)
}
```

输出[1 2 3]，s没被修改，那究竟还是不是引用呢？

----

**其实，它只是一个指针**
![](https://img.draveness.me/2019-02-20-golang-slice-struct.png)

```Go
type slice struct {
	array unsafe.Pointer // 底层数组指针
	len   int
	cap   int
}
```


另外，Go的函数传参是值传递的。

----

There is no pass-by-reference in Go
    --- Dave Cheney

![](https://dave.cheney.net/wp-content/uploads/2014/11/dfc.jpg =350x350)
