import { formatTime, formatDecimal } from "@/utils/commonFun"
/** 文字颜色 */
const fontColor = "#000";

/** 缩放比例 */
const clientWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

export const ratio = clientWidth ? clientWidth / 1920 : 1;

/** 基础tooltip配置 */
const tooltip = {
    trigger: "axis",
    borderWidth: 0,
    backgroundColor: "rgba(0, 14, 37, 0.7)",
    appendToBody: true,
    confine: true,
    textStyle: {
        color: "#fff",
        fontSize: 13 * ratio,
    },
};

/** 基础t图例配置 */
const legend = {
    type: "scroll",
    itemWidth: 24 * ratio,
    itemHeight: 12 * ratio,
    itemGap: 5 * ratio,
    textStyle: {
        color: fontColor,
        fontSize: 14 * ratio,
        lineHeight: 14 * ratio,
    },
    pageTextStyle: {
        color: fontColor,
        fontSize: 14 * ratio,
    },
    pageIconColor: fontColor,
    pageIconSize: 14 * ratio,
};

/** 基础边距配置 */
const grid = [{ left: "8%", bottom: "15%", top: "10%", right: "5%" }];

/** 图表调色盘 */
const colorList = ["#15A180", "#00EB3A", "#005EF3", "#F36400"];

/** x坐标轴样式 */
const xAxisLine = {
    show: true,
    lineStyle: {
        color: "#CBD5CB",
    },
};

/** x坐标轴文本配置 */
const xAxisLabel = {
    // color: fontColor,
    fontSize: 14 * ratio,
    margin: 15 * ratio,
};

/** x轴名称 */
const xAxisName = {
    color: fontColor,
    fontSize: 12 * ratio,
    nameGap: 0,
    verticalAlign: "top",
    align: "center",
    padding: [5 * ratio, 0, 0, 4 * ratio],
};

/** x轴Tick */
const xAxisTick = {
    // show: false,
};

/** y轴名称 */
const yAxisName = {
    color: fontColor,
    fontSize: 10 * ratio,
    nameGap: 12 * ratio,
    verticalAlign: "middle",
    align: "center",
    padding: [0, 4 * ratio, 0, 0],
};

/** y轴分割线 */
const yAxisSplitLine = {
    show: true,
    lineStyle: {
        // color: "#819C81",
        // type: "dashed",
    },
};

/** y轴Label */
const yAxisLabel = {
    // color: fontColor,
    fontSize: 12 * ratio,
    interval: 0,
};

/** y轴Line */
const yAxisLine = {
    show: false,
    lineStyle: {
        color: fontColor,
    },
};

/** y轴Tick */
const yAxisTick = {
    show: false,
};

/** 滚动设置 */
const dataZoom = {
    show: false,
    maxValueSpan: 6,
    realtime: true,
    showDetail: false,
    moveHandleSize: 7 * ratio,
    borderRadius: 1 * ratio,
    height: 12 * ratio,
    bottom: 10 * ratio,
};

/**
 *是否显示滚动
 */
export const getZoom = function (xLegnth: number, maxValueSpan?: number) {
    const _maxValueSpan = maxValueSpan || dataZoom.maxValueSpan;
    let zoom = Object.assign({}, dataZoom, {
        show: xLegnth > _maxValueSpan,
        ...(
            xLegnth >= _maxValueSpan ? {
                maxValueSpan: _maxValueSpan,
            } : {}
        )
    });
    if (zoom.show) {
        zoom.maxValueSpan--;
    }
    return zoom;
};

const maxLength = 24
export const getBar = (
    xData: Array<T> = [],
    yData: Array<T> = [],
    otherConfig: object = {}
) => {
    return {
        tooltip: tooltip,
        grid: [{ left: "8%", bottom: "15%", top: "10%", right: "5%" }],
        dataZoom: getZoom(xData.length, maxLength),
        legend: legend,
        xAxis: [
            {
                name: otherConfig.xAxisName || "",
                type: "category",
                data: xData,
                nameTextStyle: xAxisName,
                // axisTick: xAxisTick,
                axisLabel: Object.assign({}, xAxisLabel, {
                    interval: 0,
                    formatter: (val: string) => {
                        return `${formatTime(val, 'MM-dd')}\n${formatTime(val, 'HH:mm')}`
                    }
                }),
                // axisLine: xAxisLine,
            },
        ],
        yAxis: [
            {
                name: "(kW)",
                type: "value",
                axisLine: { show: true },
                axisTick: yAxisTick,
                axisLabel: yAxisLabel,
                splitLine: yAxisSplitLine,
                nameTextStyle: yAxisName,
                minInterval: 1,
            },
        ],
        series: yData.map((c: any) => {
            return {
                type: "bar",
                name: c.name,
                data: c.data,
                barWidth: 20
            }
        })
    };
};

export const getPie = (otherConfig: any = {}) => {
    return {
        title: [
            {
                text: otherConfig.data || "",
                subtext: "综合得分",
                x: "center",
                y: "40%",
                textVerticalAlign: "middle",
                textStyle: {
                    fontSize: 40 * ratio,
                    color: "#42AB01",
                    foontWeight: 600,
                },
                subtextStyle: {
                    color: "#000000",
                    fontSize: 16 * ratio,
                },
            },
        ],
        polar: {
            radius: ["70%", "80%"],
            center: ["50%", "50%"],
        },
        angleAxis: {
            max: 100,
            show: false,
        },
        radiusAxis: {
            type: "category",
            show: true,
            axisLabel: {
                show: false,
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
        },
        series: [
            {
                name: "",
                type: "bar",
                roundCap: true,
                barWidth: 60,
                showBackground: true,
                backgroundStyle: {
                    color: "rgba(66, 66, 66, .3)",
                },
                data: [60],
                coordinateSystem: "polar",
                itemStyle: {
                    normal: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 1,
                            x2: 0,
                            y2: 0,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: "#fdf914", // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: "#38a700", // 100% 处的颜色
                                },
                            ],
                            global: false, // 缺省为 false
                        },
                    },
                },
            },
        ],
    };
};

/**
 * 多线线图
 * @param xData 
 * @param yData 
 * @param otherConfig 
 * @returns 
 */
export const getMultiLine = (xData: Array<any> = [],
    yData: Array<any> = [],
    otherConfig: any = {}) => {


    //左侧最大最小值
    const lData = yData.filter((c: any) => !c.yAxisIndex);
    let max1 = Math.ceil(Math.max.apply(null, lData.map((c: any) => Math.max.apply(null, c.data))));
    let min1 = Math.floor(Math.min.apply(null, lData.map((c: any) => Math.min.apply(null, c.data))));

    //右边最大最小值
    const rData = yData.find((c: any) => c.yAxisIndex)?.data || [];
    let max2 = Math.ceil(Math.max.apply(null, rData));
    let min2 = Math.floor(Math.min.apply(null, rData));

    if (max1 > Math.abs(min1)) {
        min1 = -max1
    } else {
        max1 = Math.abs(min1)
    }
    if (max2 > Math.abs(min2)) {
        min2 = -max2
    } else {
        max2 = Math.abs(min2)
    }

    let yAxisArr = [
        {
            name: "(kW)",
            type: "value",
            axisLine: { show: true },
            axisTick: yAxisTick,
            axisLabel: yAxisLabel,
            splitLine: yAxisSplitLine,
            nameTextStyle: yAxisName,
            minInterval: 1,
            splitNumber: 5,
            min: min1,
            max: max1
        },
        {
            name: "(元/kWh)",
            type: "value",
            axisLine: { show: true },
            axisTick: yAxisTick,
            axisLabel: yAxisLabel,
            splitLine: yAxisSplitLine,
            nameTextStyle: yAxisName,
            minInterval: 1,
            splitNumber: 5,
            min: min2,
            max: max2
        },
    ]

    console.log(max1, min1, max2, min2)

    return {
        tooltip: Object.assign({}, tooltip, {
            formatter: (params: any) => {
                let str = '';
                params.forEach((item: any, idx: number) => {
                    if (idx === 0) {
                        str += `${item.name}\n`;
                    }
                    str += `${item.marker} ${item.seriesName} ${formatDecimal(item.value)}${yData.find(y => y.name === item.seriesName).unit}\n`;
                });
                return str;
            },
            renderMode: 'richText'
        }),
        grid: [{ left: "8%", bottom: "15%", top: "10%", right: "5%" }],
        legend: legend,
        dataZoom: getZoom(xData.length, maxLength),
        xAxis: [
            {
                name: otherConfig.xAxisName || "",
                type: "category",
                data: xData,
                nameTextStyle: xAxisName,
                // axisTick: xAxisTick,
                axisLabel: Object.assign({}, xAxisLabel, {
                    interval: 0,
                    formatter: (val: string) => {
                        return `${formatTime(val, 'MM-dd')}\n${formatTime(val, 'HH:mm')}`
                    }
                }),
                // axisLine: xAxisLine,
            },
        ],
        yAxis: yAxisArr,
        series: yData.map(c => {
            return {
                type: "line",
                name: c.name,
                data: c.data,
                smooth: true,
                yAxisIndex: c.yAxisIndex || 0,
                symbol: c.icon ? "emptyTriangle" : "emptyCircle",
                symbolSize: 6
            }
        })

    }
}

/**
 * 统计结果线图
 * @param xData 
 * @param yData 
 * @param otherConfig 
 * @returns 
 */
export const getResultLine = (xData: Array<any> = [],
    yData: Array<any> = [],
    otherConfig: any = {}) => {

    return {
        tooltip: Object.assign({}, tooltip, {
            formatter: (params: any) => {
                let str = '';
                params.forEach((item: any, idx: number) => {
                    if (idx === 0) {
                        str += `${item.name}\n`;
                    }
                    str += `${item.marker} ${item.seriesName}     ${formatDecimal(item.value)}元/kWh\n`;
                });
                return str;
            },
            renderMode: 'richText'
        }),
        grid: [{ left: "8%", bottom: "15%", top: "10%", right: "5%" }],
        legend: legend,
        dataZoom: getZoom(xData.length, maxLength),
        xAxis: [
            {
                name: otherConfig.xAxisName || "",
                type: "category",
                data: xData,
                nameTextStyle: xAxisName,
                axisLabel: Object.assign({}, xAxisLabel, {
                    interval: 0,
                    formatter: (val: string) => {
                        return `${formatTime(val, 'MM-dd')}\n${formatTime(val, 'HH:mm')}`
                    }
                }),
            },
        ],
        yAxis: [
            {
                name: "(元/kWh)",
                type: "value",
                axisLine: { show: true },
                axisTick: yAxisTick,
                axisLabel: yAxisLabel,
                splitLine: yAxisSplitLine,
                nameTextStyle: yAxisName,
                minInterval: 0.5,
            },
        ],
        series: yData.map(c => {
            return {
                type: "line",
                name: c.name,
                data: c.data,
                smooth: true,
            }
        })

    }
}


/**
 * 开关线图
 * @param xData
 * @param yData
 * @param otherConfig
 * @returns
 */
export const getOnOffLine = (xData: Array<any> = [],
    yData: Array<any> = [],
    otherConfig: any = {}) => {
    const convertFormula = [
        {
            key: 1, value: "断电",
        },
        {
            key: 2, value: "放电"
        },
        {
            key: 3, value: "充电"
        },
        {
            key: -1, value: "断开",
        },
        {
            key: -2, value: "供电"
        },
        {
            key: -3, value: "受电"
        },
    ]
    const colors = [
        {
            key: 1,
            value: '#92c7b1',
        }, {
            key: 2,
            value: '#92c7b1',
        }, {
            key: 3,
            value: '#92c7b1',
        },
        {
            key: -1,
            value: '#d38167',
        },
        {
            key: -2,
            value: '#d38167',
        }, {
            key: -3,
            value: '#d38167',
        },
    ]

    return {
        tooltip: Object.assign({}, tooltip, {
            formatter: (params: any) => {
                let str = '';
                params.forEach((item: any, idx: number) => {
                    if (idx === 0) {
                        str += `${item.name}\n`;
                    }

                    const _convert = convertFormula.find((k: any) => k.key === item.value);
                    str += `${item.marker} ${item.seriesName}                     ${_convert ? _convert.value : ''}\n`;
                });
                return str;
            },
            renderMode: 'richText'
        }),
        grid: [{ left: "8%", bottom: "15%", top: "10%", right: "5%" }],
        legend: Object.assign({}, legend, {
            itemHeight: 2,
            data: yData.map((c: any, idx: number) => {
                return {
                    name: c.name,
                    itemStyle: {
                        color: ['#92c7b1', '#d38167'][idx % 2]
                    }
                }
            }),
        }),
        dataZoom: getZoom(xData.length, maxLength),
        xAxis: [
            {
                name: otherConfig.xAxisName || "",
                type: "category",
                data: xData,
                nameTextStyle: xAxisName,
                axisLabel: Object.assign({}, xAxisLabel, {
                    interval: 0,
                    formatter: (val: string) => {
                        return `${formatTime(val, 'MM-dd')}\n${formatTime(val, 'HH:mm')}`
                    }
                }),
                splitNumber: xData.length,
            },
        ],
        yAxis: [
            {
                name: otherConfig.yAxisName || "",
                type: "value",
                axisLine: yAxisLine,
                axisTick: yAxisTick,
                axisLabel: Object.assign({}, yAxisLabel, {
                    formatter: function (value: number) {
                        const _label = convertFormula.find((k: any) => k.key === value);
                        return _label ? _label.value : '';
                    },
                }),
                splitLine: yAxisSplitLine,
                nameTextStyle: yAxisName,
                minInterval: 1,
                min: -3,
                max: 3,
            },
        ],
        series: yData.map((c: any, idx: number) => {
            return {
                type: "bar",
                name: c.name,
                data: c.convertData.map((d: string) => {
                    const color = colors.find((k: any) => k.key === d);
                    return {
                        value: d,
                        itemStyle: {
                            color: color ? color.value : getColor(idx),
                            // borderWidth: 2,
                            // borderColor: color ? color.value : getColor(idx)
                        },
                    }
                }),
                barWidth: 30,
                stack: 'total',
                // stackStrategy: idx === 0 ? 'positive' : 'negative'
            }
        })
    }
}

function getColor(idx: number) {
    return idx === 0 ? '#92c7b1' : '#d38167'
}