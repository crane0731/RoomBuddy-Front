import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MyPage from '../views/MyPage.vue'
import Admin from '../views/Admin.vue'   

const routes = [
  {
    path: '/',      // ✅ 기본 URL을 홈으로
    name: 'Home',
    component: Home
  },

  {
  path: '/home',
  redirect: '/'   // /home으로 오면 /로 리다이렉트
}
,
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage
  },

   {
    path: '/admin',
    name: 'Admin',
    component: Admin
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
