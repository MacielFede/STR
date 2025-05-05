import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import './styles.css'

import Map from './screens/Map.tsx'
import MapPoly from './screens/MapPoly.tsx'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
})

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Map,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/',
  component: Map,
})

const mapPolyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mappoly',
  component: MapPoly,
})

const routeTree = rootRoute.addChildren([mapRoute, adminRoute, mapPolyRoute])

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
