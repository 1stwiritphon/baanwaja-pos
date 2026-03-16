import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import POSView from '../views/POSView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminMenuView from '../views/AdminMenuView.vue'
import ExpensesView from '../views/ExpensesView.vue'
import EditBillView from '../views/EditBillView.vue'

const routes = [
{
path: '/',
redirect: '/login',
},
{
path: '/login',
name: 'login',
component: LoginView,
},
{
path: '/pos',
name: 'pos',
component: POSView,
meta: {
requiresAuth: true,
roles: ['staff', 'admin'],
},
},
{
path: '/admin/dashboard',
name: 'dashboard',
component: DashboardView,
meta: {
requiresAuth: true,
roles: ['admin'],
},
},
{
path: '/admin/menu',
name: 'admin-menu',
component: AdminMenuView,
meta: {
requiresAuth: true,
roles: ['admin'],
},
},
{
path: '/expenses',
name: 'expenses',
component: ExpensesView,
meta: {
requiresAuth: true,
roles: ['staff', 'admin'],
},
},
{
path: '/bill/:id/edit',
name: 'edit-bill',
component: EditBillView,
meta: {
requiresAuth: true,
roles: ['staff', 'admin'],
},
},
{
path: '/:pathMatch(.*)*',
redirect: '/login',
},
]

const router = createRouter({
history: createWebHistory(),
routes,
})

router.beforeEach((to) => {
 const user = JSON.parse(localStorage.getItem('user') || 'null')

 const isLoggedIn = !!user
 const isAdmin = user?.role === 'admin'

 if (to.meta.requiresAuth && !isLoggedIn) {
 return '/login'
 }

 if (to.meta.requiresAdmin && !isAdmin) {
 return '/pos'
 }

 if (to.path === '/login' && isLoggedIn) {
 return isAdmin ? '/admin/dashboard' : '/pos'
 }

 return true
})

export default router