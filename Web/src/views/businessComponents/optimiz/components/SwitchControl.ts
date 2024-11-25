import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'

export default class SwitchControl {
    /** 目标元素id */
    target: string;
    /** 场景 */
    scene: THREE.Scene;
    /** 目标元素 */
    targetEl: HTMLElement | undefined;
    /** 宽度 */
    width: number;
    /** 高度 */
    height: number;
    constructor(params: any) {
        const { width, height, target } = params;
        this.width = width;
        this.height = height;
        this.target = target;
        this.init();
    }

    /**
     * 初始化
     */
    init(): void {
        if (!this.target) {
            console.error('请设置目标元素')
            return
        }
        if (!this.getTargetEl()) {
            console.error(`未找到目标元素${this.target}`)
            return
        }
        //创建场景
        const _scene = new THREE.Scene();
        this.scene = _scene;

        ///设置背景色
        _scene.background = new THREE.Color("#565759");

        //创建相机
        const camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);

        //添加地面网格
        const gridHelper = new THREE.GridHelper(10, 10);
        _scene.add(gridHelper);

        //创建渲染器
        const renderer = new THREE.WebGLRenderer();
        renderer.antialias = true;
        renderer.setSize(this.width, this.height);

        //轨道控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;

        //添加坐标轴
        const axesHepler = new THREE.AxesHelper(5);
        _scene.add(axesHepler);

        controls.update();

        this.createBox(-2, 0, -4, '#ffe699', '市电');
        this.createBox(2, 0, -4, '#f8cbad', '电池');
        this.createBox(-2, 0, 4, '#13c765', '光伏发电');
        this.createBox(2, 0, 4, '#de3d3d', '负荷');
        this.drawLine();

        camera.position.z = 5;
        camera.position.y = 8;

        function animate() {
            renderer.render(_scene, camera);
        }
        renderer.setAnimationLoop(animate);

        if (this.targetEl) {
            this.targetEl.appendChild(renderer.domElement);
        }
    }

    createBox(x: number, y: number, z: number, color: string = '#ffffff', text: string = ''): void {
        //添加物体
        const geometry = new THREE.BoxGeometry(2, 0.5, 1);
        const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        this.scene.add(cube);
        const fontLoader = new FontLoader();
        fontLoader.load('/fonts/ch/STXinwei_Regular.json', function (font: any) {
            const textGeometry = new TextGeometry(text, {
                font: font,
                size: 0.3,
                height: 0.1,
                bevelEnabled: false,
                bevelThickness: 0.1,
                bevelSize: 0.05,
                bevelSegments: 3
            });
            // 创建文字材质
            const textMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('#000000') });
            // 创建文字对象
            const mesh = new THREE.Mesh(textGeometry, textMaterial);

            cube.add(mesh);
            geometry.computeBoundingBox();

            // 获取尺寸
            const size = new THREE.Box3().setFromObject(new THREE.Mesh(textGeometry)).getSize(new THREE.Vector3());
            mesh.position.set(-size.x / 2, y + 0.5, 0);
        })
    }

    drawLine(params?: any) {
        // 创建流光线的顶点数组
        const vertices = new Float32Array([
            0, 0, 0, 	// 起点
            10, 10, 10, 	// 终点
        ]);

        // 加载纹理图片
        const loader = new THREE.TextureLoader();
        const texture = loader.load('/fonts/colors1.png'); // 替换为你的纹理图片路径
          const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        // const geometry = new LineGeometry().setPositions(list);
        const material = new LineMaterial({
            color: '#FF0000',
            linewidth: 0.02,
        });
        const line = new Line2(geometry, material);
        // // 创建LineDashedMaterial
        // const material = new THREE.LineBasicMaterial({
        //     color: 0xffffff,
        //     // texture: texture,
        //     linewidth: 1,
        //     linecap: 'round',
        //     linejoin: 'round'
        // });

      
        // // 创建流光线
        // const line = new THREE.Line(geometry, material);

        // 将线添加到场景
        this.scene.add(line);
    }

    /**
     * 获取目标元素
     */
    getTargetEl() {
        const _targetEl = document.getElementById(this.target);
        if (_targetEl) {
            this.width = _targetEl.clientWidth;
            this.height = _targetEl.clientHeight;
            this.targetEl = _targetEl;
            return true
        } else {
            return false
        }
    }
}