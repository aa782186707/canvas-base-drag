// const music = require('./aa.mp3')
const fileList = {
    music: [require('./music/aa.mp3')],
    images: [require('./images/dadad.png'), require('./images/bg@register.jpg'), require('./images/ssssss.jpg')],
}
/**
 * @description 每一个拖拽的对象
 * @param {Array} position  一个坐标数组,如果type为rect,传入[x,y,w,h],如果为round,传入[x,y,r],如果为path,传入回路的各个坐标[[x,y],[x,y],[x,y]]
 * @param {String}type 绘制图形的类型，有矩形rect，圆形round, 环路path,
 * @param {Object} myCanvas 传入的canvas对象
 * @param {ImgObject}imgData 图片背景，有图片背景默认按矩形绘制
 */
class DragItem {
    constructor({ type, position = [], myCanvas, imgData, color }) {
        this.type = type;
        this.myCanvas = myCanvas;
        this.ctx = this.myCanvas.getContext('2d');
        this.imgData = imgData;
        this.changePos(position, color);
    }
    /**
     * @description 输出拖拽的有效范围,输出左上角，右下角的坐标
     */
    setArea() {
        if (this.type === 'rect') {
            this.area = [this.position[0], this.position[1], this.position[0] + this.position[2], this.position[1] + this.position[3]]
        }
        else {
            this.area = [this.position[0] - this.position[2] / 2, this.position[1] - this.position[2] / 2, this.position[0] + this.position[2] / 2, this.position[1] + this.position[2] / 2]
        }
    }
    /**
     * @description 修改对象的坐标
     */
    changePos(position, color) {
        if (position.length) {
            this.position = position;
            this.color = color
        }
        this.setArea();
        this.drawData();
    }
    /**
     * @description 绘制canvas图案
     */
    drawData() {
        const { ctx } = this
        if (this.color) {
            this.ctx.fillStyle = this.color
        }
        switch (this.type) {
            case 'rect': {
                ctx.fillRect(...this.position)
                break;
            }
            case 'round': {
                ctx.beginPath();
                ctx.arc(...this.position, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            }
            case 'path': {
                ctx.beginPath();
                ctx.moveTo(...this.position[0])
                this.position.map((v, i) => {
                    if (i !== 0) {
                        ctx.lineTo(...v)
                    }
                })
                ctx.fill();
                ctx.stroke();
                break;
            }
        }
    }
    clear() {
        this.ctx.clearRect(0, 0, this.myCanvas.width, this.myCanvas.height)
    }
}
class MyGame {
    constructor(initDom) {
        const allFileNum = Object.values(fileList).reduce((cur, item) => {
            cur += item.length
            return cur
        }, 0)
        const state = {
            allFileNum, // 所有文件数量
            loadPercent: 0, // 文件加载的进度
            dom: initDom, // canvas dom容器
            rem: document.documentElement.clientWidth / 750 * 100, // 页面rem
            imagesList: [],
            myCanvas: initDom.getElementsByTagName('canvas')[0],
            touchX: 0,// touch在canvas上的宽
            touchY: 0,// touch在canvas上的高
            dragObj: new Array(),
            curBoxPos: [{
                x: 0, y: 0, w: 20, h: 30
            }],// 存放所有拖拽对象的坐标信息
            dragList: [
                { position: [0, 0, 20, 30], color: '#000' },
                { position: [40, 40, 20, 30], color: 'blue' },
                { position: [70, 40, 30, 30], color: 'red' },
            ]
        }
        for (let data of Object.entries(state)) {
            this[data[0]] = data[1]
        }
        this.loadFiles(fileList.images)
        this.touchWatch()
        // document.getElementById('music').src = fileList.music[0]
    }
    /**
     * @description touch 坐标转换成canvas坐标
     */
    changePos(x, y) {
        this.touchX = x;
        this.touchY = y - (document.documentElement.clientHeight - 7.5 * this.rem) / 2
    }
    /**
     * @description 监听点击了哪块dom
     */
    checkClickDom() {
        const { touchX, touchY } = this
        this.dragObj.map((v, i) => {
            v.curTouch = false
            if (touchX >= v.area[0] && touchX <= v.area[2] && touchY >= v.area[1] && touchY <= v.area[3]) {
                // 用来标识当前点中的这一块
                v.curTouch = true
            }
        })
    }
    /**
     * @description touch监听
     */
    touchWatch() {
        $(this.dom).on('touchstart', (event) => {
            var touchpros = event.touches[0];
            this.changePos(touchpros.clientX, touchpros.clientY);
            this.checkClickDom();
            const curTouchObj = this.dragObj.find(v => v.curTouch)
            if (!curTouchObj) {
                return
            }
            let xDis = this.touchX - curTouchObj.position[0];
            let yDis = this.touchY - curTouchObj.position[1];
            $(this.dom).on('touchmove', (event2) => {
                var touchpros = event2.touches[0];
                this.changePos(touchpros.clientX, touchpros.clientY);
                curTouchObj.position[0] = this.touchX - xDis;
                curTouchObj.position[1] = this.touchY - yDis;
                this.drawRect()
            });
            $(this.dom).on('touchend', (event) => {
                $(this.dom).off('touchmove')
                $(this.dom).off('touchend')
            });
        });
    }
    /**
     * @description 图片加载器
     */
    loadFiles(fileList) {
        let curLoadNum = fileList.length;
        const imagesList = this.imagesList
        let prom = new Promise(resolve => {
            fileList.map((v, i) => {
                const img = new Image()
                img.src = v
                img.onload = function () {
                    imagesList[i] = img
                    curLoadNum--
                    if (curLoadNum === 0) {
                        resolve()
                    }
                }
            })
        })
        prom.then(() => {
            this.drawRect(this.dragList);
        })
    }
    /**
     * @description 实例化拖拽块对象
     */
    drawRect() {
        this.clear();
        this.dragObj = [];
        this.dragList.map(v => {
            this.dragObj.push(new DragItem({ color: v.color, imgData: v.imgData, position: v.position, myCanvas: this.myCanvas, type: v.imgData ? 'rect' : v.position[0].length ? 'path' : v.position.length === 4 ? 'rect' : 'round' }))
        })
    }
    /**
     * @description 清除画布
     */
    clear() {
        this.myCanvas.getContext('2d').clearRect(0, 0, this.myCanvas.width, this.myCanvas.height)
    }
}
window.MyGame = MyGame;
