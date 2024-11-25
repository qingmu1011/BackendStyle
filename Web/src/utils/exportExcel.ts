import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';


interface Header {
    name: string
    key: string
}

interface ProjectInfo {
    name: string
    value: string | number
}

/**
 * 导出数据为 Excel 文件
 * @param {Array} project - 项目信息
 * @param {Array} header - 表头数据（数组对象）
 * @param {Array} data - 要导出的数据（数组对象）
 * @param {string} fileName - 下载的文件名
 */

export async function exportExcel(project:ProjectInfo[], header:Header[],data: any[], fileName: string) {

    // 创建一个新的工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    // 设置列宽
    worksheet.columns = [
        { width: 30 }, // 第一列宽度
        { width: 25 }, // 第二列宽度
        { width: 25 },  // 第三列宽度
        { width: 25 }, 
        { width: 25 }, 
    ];

    const border:Partial<ExcelJS.Borders> = {
        top: {style: 'thin'},
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    }
    project.forEach((item,index)=>{
        const _row = [item.name, item.value]
        const rowIndex = index+1
        const projectRow = worksheet.addRow(_row)  // 插入一行数据
        projectRow.height = 16  // 设置行高
        projectRow.alignment = { horizontal: 'left', vertical: 'middle' };  // 设置对齐方式
        worksheet.mergeCells(`B${rowIndex}:C${rowIndex}`);  // 合并单元格
        worksheet.getCell(`A${rowIndex}`).border = border  // 设置边框
        worksheet.getCell(`B${rowIndex}`).border = border  // 设置边框
    })
    worksheet.addRow([])

    // 插入表头
    const _header = header.map(item => item.name)
    const headerRow = worksheet.addRow(_header)
    headerRow.height = 22; // 表头高度
    headerRow.font = { bold: true }; // 粗体
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // 提取数据并插入数据到工作表
    data.forEach((item) => {
        const _row: string[] = []
        header.forEach((headerItem) => {
            _row.push(item[headerItem.key])
        })
        const row = worksheet.addRow(_row as string[]);
        row.height = 18
        row.alignment = { horizontal: 'center', vertical: 'middle' };
    })


    // 将工作簿保存为 Blob
    const buffer = await workbook.xlsx.writeBuffer();

    // 创建 Blob 对象并使用 file-saver 下载
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
}