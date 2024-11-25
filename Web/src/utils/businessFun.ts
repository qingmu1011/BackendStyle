/**
 * 保存数据为文件
 * @param data
 * @param name
 */
export const saveAs = (data: any, name: string) => {
  const blob = new Blob([data], { type: "text/plain" });
  const URL = window.URL || window.webkitURL;
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click(); // 点击下载
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(url);
}

/**
 * 格式化时间
 * @param duration
 */
export const formatDuration = (duration: number) => {
  const hour = Math.floor(duration / 3600);
  const minute = Math.floor((duration % 3600) / 60);

  return `PT${hour}H${minute > 0 ? `${minute}M` : ''}`;
} 