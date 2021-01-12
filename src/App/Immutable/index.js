import React from 'react';
import Immutable, { fromJS, isIndexed } from 'immutable';
import {Map} from 'immutable';
import Cursor from 'immutable/contrib/cursor';
/**

Immutable

背景
    JavaScript 中的对象一般是可变的（Mutable），因为使用了引用赋值，新的对象简单的引用了原始
    对象，改变新的对象将影响到原始对象。如 foo={a: 1};bar=foo; bar.a=2 你会发现此时 foo.a 也被改成了2。
    虽然这样做可以节约内存，但当应用复杂后，这就造成了非常大的隐患，Mutable 带来的优点变得得不偿失。
    为了解决这个问题，一般的做法是使用 shallowCopy（浅拷贝）或 deepCopy（深拷贝）来避免被修改，但这样做造成了 CPU 和内存的浪费。

介绍
    Immutable就是在创建变量、赋值后便不可更改，若对其有任何变更，就会回传一个新值。


原理
    实现的原理是Persistent Data Structure（持久化数据结构），也就是使用旧数据创建新数据时，要保证旧数据同时可用且不变。
    同时为了避免deepCopy把所有的节点都复制一遍带来的性能损耗，Immutable使用了Structural Sharing(结构共享)，即如果对象树
    中一个节点发生变化，只修改这个节点和受它影响的父节点，其他节点则进行共享。
------

作用
    1，让纯函数更强大，让开发愈发简单明了
    2. 使类似于惰性求值的函数编程成为可能
  优点
    1.Immutable降低了Mutable带来的复杂度
    2.节省内存
        Immutable.js使用了Structure Sharing会尽量复用内存，甚至以前使用的对象也可以再次被复用。没有被引用的对象会被垃圾回收。
    3.并发安全

        数据天生不可变，不需要并发锁（JavaScript单线程运行）
  缺点
    1.需要学习新的API
    2.增加了资源文件的大小
    3.容易与原生对象混淆
        Immutable中的Map和List虽对应原生Object和Array，但操作不同，用法是map.get('key')而不是map.key,array.get(0)而不是array[0]。
        另外 Immutable 每次修改都会返回新对象，也很容易忘记赋值。
       
        解决方法
            1.使用 Flow 或 TypeScript 这类有静态类型检查的工具。消除了Immutable流经系统的精神负担  ？？？？
            2.约定变量命名规则：如所有 Immutable 类型对象以 $$ 开头。
            3.使用 Immutable.fromJS 而不是 Immutable.Map 或 Immutable.List 来创建对象，这样可以避免 Immutable 和原生对象间的混用。
            隐藏有关数据结构的详细信息。

如何与React搭配使用，关键点是shouldComponentUpdate
Object.freeze方法可以冻结一个对象。

使用
    immutable主要是防止state对象被错误赋值
    Cursor
        由于Immutable数据一般嵌套非常深，为了便于访问深层数据，Cursor提供了可以直接访问这个深层数据的引用。


将TypeScript与Immutable.js v4一起使用

实现机制
我们新生成一个根节点，对于有修改的部分，把相应路径上的所有节点重新生成，对于本次操作没有修改的部分，我们可以直接把相应的旧的节点拷贝过去，这其实就是结构共享。这样每次操作同样会获得一个全新的版本（根节点变了，新的a!==旧的a），历史版本可以完好保留，同时也节约了空间和时间。
位分区进行速度优化  （5层）
树高压缩、节点内部压缩（Bitmap）进行空间优化



疑问：
    和const什么区别？
    为什么不用深拷贝？
        浪费内存，深度遍历频繁更新不优雅
    Object.assign 的效率较低，因此在特殊场景，不适合使用 Object.assign 生成 immutable 数据。但是大部分场景还是完全可以使用 Object.assign 的。
    
 */
class Immutatble extends React.Component{

    constructor(props){
        super(props);
        this.props = props;
        this.state={
            count:0
        }
    }
    handleDemo = () => {
        let foo = {a:{b:1}};
        let bar = foo;
        bar.a.b = 2;
        console.log(foo.a.b);
        console.log(foo === bar);
    }
    setCount = () => {
        this.setState({
            count:this.state.count+1
        })
    }
    
    handleDemo2 = () => {
        let foo = {a:{b:1}};
        let bar = foo;
        foo = Immutable.fromJS({a:{b:1}});
        bar =  foo.setIn(['a','b'],2);
        console.log(foo.getIn(['a','b']));
        console.log(foo === bar);
        console.log(bar.getIn(['a']));
    //     let data = Immutable.fromJS({ a: { b: { c: 1 } } });
    //     // 让 cursor 指向 { c: 1 }
    //     let cursor = Cursor.from(data, ['a', 'b'], newData => {
    //     // 当 cursor 或其子 cursor 执行 update 时调用
    //     console.log(newData);
    //     });

    //    console.log(cursor.get('c')); // 1
    //     cursor = cursor.update('c', x => x + 1);
    //     console.log(cursor.get('c')); // 1
    }

    handleDemo3 = () => {
        let a = Map({
            select: 'users',
            filter: Map({name: 'Cam'})
        })
        let b = a.set('select','people');
        console.log(a === b);
        console.log(a.get('filter') === b.get('filter'),a.get('filter'));
        // a和b共享了没有变化的filter节点   ？？？？
    }

    handleDemo4 = () => {
        // 1.formJS
        let data = fromJS({a:{b:[12,10,20],c:{d:30,e:[12,21]}}},function(key,value,path){
            console.log(key,value,path,isIndexed(value));
            return isIndexed(value) ? value.toList() : value.toOrderedMap()
        })
        console.log(data.getIn(['a']));
        // 2.isImmutable 返回true表示是不可变数据
        const { isImmutable,isCollection,isKeyed,isAssociative,isOrdered, Map, List, Stack,Set,OrderedMap } = require('immutable');
        isImmutable([]); // false
        isImmutable({}); // false
        isImmutable(Map()); // true
        isImmutable(List()); // true
        isImmutable(Stack()); // true
        isImmutable(Map().asMutable()); // false
        // 3.isCollection 返回true表示这是一个集合或者集合的子类
        isCollection([]); // false
        isCollection({}); // false
        isCollection(Map()); // true
        isCollection(List()); // true
        isCollection(Stack()); // true
        // 4.isKeyed 返回true表示这是Collection.key或其子类
        isKeyed([]); // false
        isKeyed({}); // false
        isKeyed(Map()); // true
        isKeyed(List()); // false
        isKeyed(Stack()); // false
        // 5.isIndexed 返回true表示这是Collection.isIndexed或其子类
        isIndexed([]); // false
        isIndexed({}); // false
        isIndexed(Map()); // false
        isIndexed(List()); // true
        isIndexed(Stack()); // true
        isIndexed(Set()); // false
        // 6.isAssociative 返回true表示这是Keyed或者Indexed Collective(isKeyed+isIndexed)
        isAssociative([]); // false
        isAssociative({}); // false
        isAssociative(Map()); // true
        isAssociative(List()); // true
        isAssociative(Stack()); // true
        isAssociative(Set()); // false
        // 7.isOrdered 返回true表示这是一个Collection同时迭代索引设置正确 Collection.indexed、OrderedMap和OrderedSet会返回True
        isOrdered([]); // false
        isOrdered({}); // false
        isOrdered(Map()); // false
        isOrdered(OrderedMap()); // true
        isOrdered(List()); // true
        isOrdered(Set()); // false
        // 8.isValueObject 返回true表示这是个JS对象并且同时拥有equals()和hashCode()方法
        //equals() // 当与传入的集合值相等时返回True，相等比较与Immutable.is()的定义一样
        //hashCode() // 返回当前集合的哈希计算值。在添加一个元素到Set中或者用Key索引Map时，hashCode会被用于查明两个集合潜在的相等关系，即使他们没用相同的地址
        const a = List([ 1, 2, 3 ]);
        const b = List([ 1, 2, 3 ]);
        console.log(a !== b); // 不是相同地址  true
        const set = Set([ a ]);
        console.log(set.has(b) === true); //true
        // 当两个值的hashCode相等时，并不完全保证他们是相等的，但当他们的hashCode不同时，他们一定是不等的。
        // List  List是类似于JS中数组的密集型有序集合。  List实现了队列功能，能高效的在队首(unshift, shift)或者队尾(push, pop)进行元素的添加和删除。
        List.isList([]); // false
        List.isList(List()); // true
        // List.of()
        List.of({x:1}, 2, [3], 4)// List [ { x: 1 }, 2, [ 3 ], 4 ]
        // set  返回一个在index位置处值为value的新List。如果index位置已经定义了值，它将会被替换。
        // delete,insert,clear,push,pop,unshift,shift,update等等
        // toJS()  深层地将这个有序的集合转换为原生JS数组
        // toJSON  浅转换这个有序的集合为原生JS数组
    }

    // Vector Trie 的核心
    get = (shift,keyHash,key,notSetValue) => {
        const {hash,MASK} = require(Immutable)
        if(keyHash === undefined){
            keyHash = hash(key);
        }
        const idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
        const node = this.nodes[idx];
        return node ? node.get(shift + shift,keyHash,key,notSetValue) : notSetValue;
    }
    render(){
        // 1.原来的写法
        // this.handleDemo();
        // 2.使用 immutable.js后
        // this.handleDemo2();
        // 3.节省内存--复用内存
        // this.handleDemo3();
        // 4.API
        this.handleDemo4();
        const {count} = this.state
        return (
            <div>
            <p>You clicked {count} times</p>
            <button onClick={() => this.setCount()}>
            Click me
            </button>
            </div>
        )
    }
}
export default Immutatble;