<template>
  <common-panel>
    <!-- <div class="m-b-10px">
      <common-btn icon="icon-return" @click="handleBack" name="返回"></common-btn>
    </div> -->
    <table-pagination
      height="calc(100% - 10px)"
      :data="tableData"
      :total="total"
      :pageObj="pageObj"
      :loading="loading"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <el-table-column prop="comment" label="预测项目名称" align="center">
        <template #default="scope">
          <span
            style="text-decoration: underline"
            class="color-#2c63ac cursor-pointer"
            @click="handleDetail(scope.row)"
            >{{ scope.row.comment }}</span
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="parameter.startTime"
        label="开始时间"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="parameter.endTime"
        label="结束时间"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="result.min.total"
        label="合计电费(元)"
        align="center"
      >
        <template #default="scope">
          {{ formatDecimal(scope.row.result.min.total) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160px">
        <template #default="scope">
          <common-btn
            icon="icon-customization"
            label="详情"
            @click="handleDetail(scope.row)"
          ></common-btn>
          <common-btn
            type="danger"
            label="删除"
            icon="icon-delete"
            @click="handleDelete(scope.row)"
          ></common-btn>
        </template>
      </el-table-column>
    </table-pagination>
  </common-panel>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { pcsList, pcsDel } from "@/api/business/pcs";
import { confirm, message, formatDecimal } from "~/utils/commonFun";
const router = useRouter();

const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const pageObj = ref({
  pageNum: 1,
  pageSize: 10,
});

onMounted(() => {
  searchFn();
});

onMounted(() => {
  searchFn();
});

function handleBack() {
  // router.back();
  router.push({
    path: `/optimiz`,
  });
}

/** 翻页 */
const currentChange = (val: number) => {
  pageObj.value.pageNum = val;
  getData();
};

/** 修改页数 */
const sizeChange = (val: number) => {
  pageObj.value.pageSize = val;
  searchFn();
};

function searchFn() {
  pageObj.value.pageNum = 1;
  getData();
}

function getData() {
  // TODO: 获取数据
  loading.value = true;
  pcsList({ ...pageObj.value })
    .then((res: ResponseContent) => {
      total.value = res.content.total;
      tableData.value = res.content.records;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 详情
 */
function handleDetail(row: any) {
  // TODO: 跳转到详情页面
  console.log(row);
  router.push({
    path: `/optimiz/${row.id}`,
  });
}

/**
 * 删除
 */
function handleDelete(row: any) {
  confirm("是否删除本条数据?")
    .then(() => {
      loading.value = true;
      pcsDel(row.id)
        .then((res: ResponseContent) => {
          message("删除成功");
          searchFn();
        })
        .catch(() => {
          message("删除失败", "error");
        })
        .finally(() => {
          loading.value = true;
        });
    })
    .catch(() => {
      console.log("取消删除");
    });
}
</script>
