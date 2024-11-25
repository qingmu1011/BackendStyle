import { AxiosResponse } from "axios";
import { ref, reactive, onMounted } from "vue";
import { confirm, message, defaultValue, deepCopy } from "~/utils/commonFun";
export type PageParams = {
  pageSize: number;
  pageNum: number;
};

export default function useSearch(
  options: any = {
    seachMethod: (...args: any) => Promise<AxiosResponse>,
    delMethod: (...args: any) => Promise<AxiosResponse>,
    originData: {},
    isImmediately: true,
    callback: null,
    handleSearch: null
  }
) {
  const isImmediately = defaultValue(options.isImmediately, true)
  const searchObj = reactive<object>({ ...options.originData });
  const pageObj = reactive<PageParams>({
    pageSize: 10,
    pageNum: 1,
  });
  const callback = options.callback || null;
  const handleSearch = options.handleSearch || null;

  const tableData = ref<Array<any>>([]);
  const loading = ref<boolean>(false);
  const total = ref<number>(0);

  const editInfo = ref<{ type: string; info: any }>({
    type: "",
    info: {},
  });

  /** methods */
  /** 页面交互-start */
  /** 查询 */
  const searchFn = () => {
    currentChange(1);
  };

  /** 重置 */
  const resetFn = () => {
    Object.assign(searchObj, options.originData);
    searchFn();
  };

  /** 翻页 */
  const currentChange = (val: number) => {
    pageObj.pageNum = val;
    getList();
  };

  /** 修改页数 */
  const sizeChange = (val: number) => {
    pageObj.pageSize = val;
    searchFn();
  };

  /** 编辑 */
  const editFn = (row: any, type: string) => {
    editInfo.value.type = type;
    editInfo.value.info = row;
  };

  /** 关闭 */
  const closeFn = (flag = false) => {
    editInfo.value.type = '';
    editInfo.value.info = {};
    if (flag) {
      getList();
    }
  };

  /** 删除 */
  const delFn = (row: any) => {
    confirm("是否删除本条数据?")
      .then(() => {
        options
          .delMethod(row.id)
          .then(() => {
            message("删除成功");
            getList();
          })
          .catch(() => {
            message("删除失败", "error");
          });
      })
      .catch(() => {
        console.log("取消删除");
      });
  };

  /** 页面交互-end */
  /** 数据串联-start */
  const getList = () => {
    const obj = Object.assign({}, getSearchObj(), pageObj);
    return new Promise(async (resolve, rejects) => {
      loading.value = true;
      if (callback) {
        await callback(obj);
      }
      await options
        .seachMethod(obj)
        .then((res: ResponseContent) => {
          total.value = res.content?.total || 0;
          tableData.value = res.content?.records || [];
          if (total.value > 0 && tableData.value.length == 0) {
            searchFn();
            return;
          }
          resolve(res);
        })
        .catch(() => {
          total.value = 0;
          tableData.value = [];
          resolve({});
        });
      loading.value = false;
    });
  };

  function getSearchObj() {
    if (handleSearch) {
      return handleSearch(deepCopy(searchObj))
    } else {
      return searchObj
    }
  }
  /** 数据串联-end */
  onMounted(() => {
    if (isImmediately) {
      searchFn();
    }
  });

  return {
    searchObj,
    pageObj,
    loading,
    tableData,
    total,
    editInfo,
    currentChange,
    sizeChange,
    searchFn,
    resetFn,
    editFn,
    closeFn,
    delFn,
    getList,
  };
}
