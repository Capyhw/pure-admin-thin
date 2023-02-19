// 最简代码，也就是这些字段必须有
export default {
  path: "/submitHomework",
  meta: {
    title: "提交作业",
    icon: "iconoir:submit-document"
  },
  children: [
    {
      path: "/submitHomework/index",
      name: "SubmitHomework",
      component: () => import("@/views/submitHomework/index.vue"),
      meta: {
        title: "提交作业",
        keepAlive: true
      }
    }
  ]
};
