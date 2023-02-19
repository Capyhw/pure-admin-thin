<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "SubmitHomework"
});
const hasHomework = ref(true);
const value = ref("");
/**  快捷选择 */
const shortcuts = [
  {
    text: "上周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: "上个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  }
];
/** 手风琴当前展开的*/
const activeName = ref("1");
</script>

<template>
  <div>
    <h1>提交作业</h1>
    <div class="header">
      <span class="datePickerTitle">根据日期筛选</span>
      <el-date-picker
        v-model="value"
        type="daterange"
        :shortcuts="shortcuts"
        range-separator="⇒"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      />
    </div>
    <div class="demo-collapse">
      <el-collapse v-model="activeName" accordion>
        <el-collapse-item title="Consistency" name="1">
          <div>
            Consistent with real life: in line with the process and logic of
            real life, and comply with languages and habits that the users are
            used to;
          </div>
          <div>
            Consistent within interface: all elements should be consistent, such
            as: design style, icons and texts, position of elements, etc.
          </div>
        </el-collapse-item>
        <el-collapse-item title="Feedback" name="2">
          <div>
            Operation feedback: enable the users to clearly perceive their
            operations by style updates and interactive effects;
          </div>
          <div>
            Visual feedback: reflect current state by updating or rearranging
            elements of the page.
          </div>
        </el-collapse-item>
        <el-collapse-item title="Efficiency" name="3">
          <div>
            Simplify the process: keep operating process simple and intuitive;
          </div>
          <div>
            Definite and clear: enunciate your intentions clearly so that the
            users can quickly understand and make decisions;
          </div>
          <div>
            Easy to identify: the interface should be straightforward, which
            helps the users to identify and frees them from memorizing and
            recalling.
          </div>
        </el-collapse-item>
        <el-collapse-item title="Controllability" name="4">
          <div>
            Decision making: giving advices about operations is acceptable, but
            do not make decisions for the users;
          </div>
          <div>
            Controlled consequences: users should be granted the freedom to
            operate, including canceling, aborting or terminating current
            operation.
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- 当未发布作业时兜底显示 -->
    <el-empty v-if="!hasHomework" description="老师当前还未发布作业" />
  </div>
</template>

<style scoped lang="scss">
.header {
  //靠右边
  text-align: right;
  margin-right: 20px;
  .datePickerTitle {
    margin-right: 20px;
  }
}
.demo-collapse {
  margin-top: 20px;
  .el-collapse-item {
    ::v-deep(.el-collapse-item__header) {
      padding: 20px;
    }
    .el-collapse-item__content {
      div ::v-deep() {
        padding: 20px;
      }
    }
  }
}
</style>
