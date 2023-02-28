// 最简代码，也就是这些字段必须有
export default {
  path: "/submitHomework",
  meta: {
    title: "批改作业",
    icon: "fluent-mdl2:account-activity"
  },
  children: [
    {
      path: "/correctHomework/index",
      name: "CorrectHomework",
      component: () => import("@/views/correctHomework/index.vue"),
      meta: {
        title: "批改作业",
        keepAlive: true
      }
    }
  ]
};
