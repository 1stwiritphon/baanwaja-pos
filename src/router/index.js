import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import POSView from '../views/POSView.vue'
import AdminMenuView from '../views/AdminMenuView.vue'
import DashboardView from '../views/DashboardView.vue'
import ExpensesView from '../views/ExpensesView.vue'
import EditBillView from '../views/EditBillView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },

  {
    path: '/pos',
    component: POSView,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] },
  },
  {
    path: '/expenses',
    component: ExpensesView,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] },
  },
  {
    path: '/bill/:id/edit',
    component: EditBillView,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] },
  },

  { path: '/admin', redirect: '/admin/dashboard' },
  {
    path: '/admin/dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/menu',
    component: AdminMenuView,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const userRaw = localStorage.getItem('user')
  if (!userRaw) return '/login'

  const user = JSON.parse(userRaw)

  if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    return user.role === 'admin' ? '/admin/dashboard' : '/pos'
  }

  return true
})

export default router