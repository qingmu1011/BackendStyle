<template>
    <div class="picture-viewer-container">
        <div class="picture-warp">
            <div class="left-btn" @click="leftBtn">
                <i class="iconfont icon-left"></i>
            </div>
            <div class="picture-img" @wheel="wheel">
                <img ref="pictureRef" class="picture" :src='currentImg.path' @mousedown="mouseDown" ></img>
                <div class="imgName">{{ currentImg.name }}</div>
            </div>
            <div class="right-btn" @click="rightBtn">
                <i class="iconfont icon-right"></i>
            </div>
            <div class="operate">
                <div class="operate-item" @click="amplify">
                    <i class="iconfont icon-zoom-in"></i>
                </div>
                <div class="operate-item" @click="reduce">
                    <i class="iconfont icon-zoom-out"></i>
                </div>
                <div class="operate-item" @click="rotate(-90)">
                    <i class="iconfont icon-undo"></i>
                </div>
                <div class="operate-item" @click="rotate(90)">
                    <i class="iconfont icon-redo"></i>
                </div>
            </div>
        </div>
        <div class="picture-footer">
            <el-scrollbar ref="scrollbarRef" always>
                <div class="round-list" @click="changeImg($event)">
                    <div class="round-item" v-for="(item, index) in files" :key="index" :class="[index === imgIndex?'active':'']">
                        <img :src="item.thumbnail" :data-index="index"></img>
                        <div class="round-item-name">{{ item.name }}</div>
                    </div>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup lang='ts'>
    import { ref, watch, computed, nextTick } from 'vue'
    import { ElScrollbar } from 'element-plus'

    const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

    const props = withDefaults(defineProps<{
        files: Array<{
            path: string
            name: string
        }>
    }>(), {
        files: () => []
    })

    // const pictureRef = ref<HTMLDivElement>()
    const imgIndex = ref(0)
    const imgScale = ref(1)
    const imgmouseX = ref('0px')
    const imgmouseY = ref('0px')
    const imgRotate = ref('0deg')
    

    watch(imgIndex, (newVal, oldVal) => {
        imgScale.value = 1
        imgmouseX.value = '0px'
        imgmouseY.value = '0px'
        imgRotate.value = '0deg'
    })

    const currentImg = computed(() => {
        if(props.files.length===0) return {}
        return props.files[imgIndex.value]
    })

    function leftBtn (){
        imgIndex.value--
        if(imgIndex.value < 0){
            imgIndex.value = props.files.length - 1
        }
        
    }

    function rightBtn (){
        imgIndex.value++
        if(imgIndex.value > props.files.length - 1){
            imgIndex.value = 0
        }
    }

    function changeImg (e: MouseEvent){
        const node = (e.target as HTMLElement)
        if(node.tagName !== 'IMG')return
        imgIndex.value = +node.getAttribute('data-index')!
    }

    function scaleHandler (num:number){
        imgScale.value += num
        if(imgScale.value < 0.2){
            imgScale.value = 0.2
        }else if (imgScale.value > 7){
            imgScale.value = 7
        }
    }
    
    function wheel(e: WheelEvent){
        e.preventDefault()
        
        if(e.deltaY > 0){
            scaleHandler(-0.2)
        }else{
            scaleHandler(0.2)
        }
    }

    function amplify(){
        scaleHandler(0.2)
    }

    function reduce(){
        scaleHandler(-0.2)
    }

    function rotate(num: 90 | -90){
        let rotate = (parseInt(imgRotate.value) + num)
        if(rotate >= 360 || rotate <= -360){
            rotate = 0
        }
        if(num == 90){
            const x = parseInt(imgmouseX.value)
            imgmouseX.value = imgmouseY.value
            imgmouseY.value = -x + 'px'
        }else {
            const y = parseInt(imgmouseY.value)
            imgmouseY.value = imgmouseX.value
            imgmouseX.value = -y + 'px'
        }
        imgRotate.value = rotate + 'deg'
    }

    function mouseDown(e: MouseEvent){
        e.preventDefault()
        const ol = e.clientX;
        const ot = e.clientY;
        const currentOl = parseInt(imgmouseX.value) * imgScale.value
        const currentOt = parseInt(imgmouseY.value) * imgScale.value;

        document.onmousemove = (e:MouseEvent)=>{
            let moveX = 0
            let moveY = 0

            if(parseInt(imgRotate.value) == 180  || parseInt(imgRotate.value) == -180){
                moveX = -(-(ol - e.clientX) + -currentOl) / imgScale.value
                moveY = -(-(ot - e.clientY) + -currentOt) / imgScale.value
            }else if (parseInt(imgRotate.value) == 90 || parseInt(imgRotate.value) == -270){
                moveX = (-(ot - e.clientY) + currentOl) / imgScale.value
                moveY = -(-(ol - e.clientX) + -currentOt) / imgScale.value
            }else if (parseInt(imgRotate.value) == -90 || parseInt(imgRotate.value) == 270){
                moveX = -(-(ot - e.clientY) + -currentOl) / imgScale.value
                moveY = (-(ol - e.clientX) + currentOt) / imgScale.value
            }else {
                moveX = (-(ol - e.clientX) + currentOl) / imgScale.value
                moveY = (-(ot - e.clientY) + currentOt) / imgScale.value
            }

            imgmouseX.value = moveX + 'px'
            imgmouseY.value = moveY + 'px'
        };

        document.onmouseup = ()=>{
            document.onmousemove = null;
            document.onmouseup = null;
        }

        return false
    }

</script>

<style lang='scss' scoped>
.picture-viewer-container{
    margin-top: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    user-select: none;
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none;    /* Firefox */
    -ms-user-select: none;     /* Internet Explorer/Edge */
    background-color: var(--el-bg-color-page);
    border-radius: var(--el-border-radius-round);
    padding-top: 20px;

    .picture-warp{
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        position: relative;
        .picture-img{
            margin: 0 15px;
            z-index: 1;
            overflow: hidden;
            width: 100%;
            height: 60vh;
            aspect-ratio: 1 / 1;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: var(--el-border-radius-round);
            position: relative;

            .picture{
                width: 100%;
                height: 100%;
                object-fit:contain;
                border-radius: var(--el-border-radius-round);
                transform: scale(v-bind(imgScale)) rotate(v-bind(imgRotate)) translate(v-bind(imgmouseX), v-bind(imgmouseY));
                transform-origin: center;
            }
            .imgName{
                position: absolute;
                top: 0;
                width: 100%;
                z-index: 2;
                text-align: center;
                background-color: var(--el-fill-color);
                color: var(--el-text-color-regular);
                opacity: .8;
                padding: 5px 0;
                font-weight: bold;
            }
        }

        .operate{
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            border-radius: var(--el-border-radius-round);
            background-color: var(--el-fill-color); 
            box-shadow: var(--el-box-shadow-lighter);
            padding: 8px 15px;
            z-index: 2;
            opacity: .8;

            .operate-item{
                // width: 20px;
                // height: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                margin-right: 15px;

                .iconfont {
                    font-size: 24px;
                    color: var(--el-text-color-regular);
                }

                &:last-child{
                    margin-right: 0;
                }
            }
        }
        
        .left-btn, .right-btn{
            z-index: 2;
            position: absolute;
            width: 40px;
            height: 100px;
            margin: 0 15px;
            background-color: var(--el-fill-color);
            border-radius: var(--el-border-radius-round);
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all .3s;
            box-shadow: var(--el-box-shadow-lighter);
            cursor: pointer;
            opacity: .8;
            .iconfont{
                font-size: 25px;
                // font-weight: bold;
                color: var(--el-text-color-regular);
                transition: inherit;
            }

            &:hover{
                .iconfont{
                    transform: translateX(5px);
                }
            }
        }

        .left-btn:hover{
            .iconfont{
                transform: translateX(-5px);
            }
        }

        .right-btn{
            right: 0;
        }


    }

    .picture-footer{
        margin-top: 20px;
        max-width: 100%;
        transition: all .5s;   
        padding: 8px 15px;
        border-radius: var(--el-border-radius-round);
        background-color: var(--el-fill-color);   

        .round-list{
            display: flex;
            max-width: 100%;
            height: 95px;

            .round-item{
                flex: none;
                width: 80px;
                height: 80px;
                border-radius: var(--el-border-radius-base);
                overflow: hidden;
                margin-right: 5px;
                cursor: pointer;
                position: relative;

                img{
                    width: 100%;
                    height: 100%;
                    transition: all .3s;
                }

                &:last-child{
                    margin-right: 0px;
                }

                &:hover{
                    border: 3px solid var(--el-color-primary-light-7);

                }

                &.active{
                    border: 3px solid var(--el-color-primary);
                }

                .round-item-name{
                    position: absolute;
                    top: 0;
                    font-size: 14px;
                    text-align: center;
                    width: 100%;
                    background-color: var(--el-overlay-color-lighter);
                    color: #fff;
                }
            }
        }
    }
    
}
</style>